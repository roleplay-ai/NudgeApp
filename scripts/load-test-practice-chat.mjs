/**
 * Load test: N simultaneous authenticated users each send M messages
 * to /api/practice/chat for one practice activity.
 *
 * Prerequisites:
 *   - App running (npm run dev or npm start)
 *   - .env.local with NEXT_PUBLIC_SUPABASE_* and SUPABASE_SERVICE_ROLE_KEY
 *   - ANTHROPIC_API_KEY on the server
 *
 * Usage:
 *   node scripts/load-test-practice-chat.mjs
 *   node scripts/load-test-practice-chat.mjs --list-activities
 *   ACTIVITY_ID=<uuid> node scripts/load-test-practice-chat.mjs
 *   ACTIVITY_NAME="Write a Job Description" node scripts/load-test-practice-chat.mjs
 *
 * Env:
 *   BASE_URL          default http://localhost:3000
 *   CONCURRENT_USERS  default 25
 *   MESSAGES_PER_USER default 2
 *   ACTIVITY_ID       practice_activities.id (or use ACTIVITY_NAME)
 *   ACTIVITY_NAME     exact activity name to resolve via Supabase
 *   TEST_EMAIL_PREFIX default loadtest-practice
 *   TEST_PASSWORD     default LoadTestPractice1!
 *   CREATE_USERS      default true — create missing test users via service role
 */

import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// ── env ────────────────────────────────────────────────────────────────────

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(join(root, ".env.local"));
loadEnvFile(join(root, ".env"));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const CONCURRENT_USERS = Number(process.env.CONCURRENT_USERS || "25");
const MESSAGES_PER_USER = Number(process.env.MESSAGES_PER_USER || "2");
const ACTIVITY_ID = process.env.ACTIVITY_ID || "";
const ACTIVITY_NAME = process.env.ACTIVITY_NAME || "";
const EMAIL_PREFIX = process.env.TEST_EMAIL_PREFIX || "loadtest-practice";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "LoadTestPractice1!";
const CREATE_USERS = process.env.CREATE_USERS !== "false";

const USER_MESSAGES = [
  "Draft a short role summary for a Senior Frontend Engineer at a 20-person startup.",
  "Now add 4 key responsibilities and required skills, under 300 words total.",
  "Rewrite the opening to sound warmer but still professional.",
  "List three bullet points for required skills only.",
];

const listOnly = process.argv.includes("--list-activities");

function requireEnv() {
  const missing = [];
  if (!SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!ANON_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!SERVICE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length) {
    console.error("Missing env:", missing.join(", "));
    console.error("Set them in .env.local");
    process.exit(1);
  }
}

function cookiesToHeader(cookieMap) {
  return [...cookieMap.entries()]
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join("; ");
}

function createCookieAuthClient() {
  const cookies = new Map();
  const supabase = createServerClient(SUPABASE_URL, ANON_KEY, {
    cookies: {
      getAll() {
        return [...cookies.entries()].map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          if (value) cookies.set(name, value);
          else cookies.delete(name);
        }
      },
    },
  });
  return { supabase, cookies };
}

async function listActivities(admin) {
  const { data, error } = await admin
    .from("practice_activities")
    .select("id, name, is_published, order_index")
    .order("order_index");
  if (error) throw error;
  console.log("\nPublished practice activities:\n");
  for (const row of data || []) {
    const pub = row.is_published ? "published" : "draft";
    console.log(`  ${row.id}  [${pub}]  ${row.name}`);
  }
  console.log("\nSet ACTIVITY_ID or ACTIVITY_NAME and re-run.\n");
}

async function resolveActivityId(admin) {
  if (ACTIVITY_ID) return ACTIVITY_ID;
  if (!ACTIVITY_NAME) {
    const { data, error } = await admin
      .from("practice_activities")
      .select("id, name")
      .eq("is_published", true)
      .order("order_index")
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("No published practice activities found.");
    console.log(`Using first published activity: "${data.name}" (${data.id})`);
    return data.id;
  }
  const { data, error } = await admin
    .from("practice_activities")
    .select("id, name")
    .eq("name", ACTIVITY_NAME)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`Activity not found: "${ACTIVITY_NAME}"`);
  console.log(`Using activity: "${data.name}" (${data.id})`);
  return data.id;
}

async function ensureTestUsers(admin, count) {
  const emails = Array.from(
    { length: count },
    (_, i) => `${EMAIL_PREFIX}-${String(i + 1).padStart(2, "0")}@loadtest.local`
  );

  if (!CREATE_USERS) return emails;

  for (const email of emails) {
    const { data: listed } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const exists = listed?.users?.some((u) => u.email === email);
    if (exists) continue;

    const { error } = await admin.auth.admin.createUser({
      email,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: `Load Test ${email}` },
    });
    if (error && !error.message?.includes("already")) {
      throw new Error(`createUser ${email}: ${error.message}`);
    }
    process.stdout.write(`Created ${email}\n`);
  }
  return emails;
}

async function signIn(email) {
  const { supabase, cookies } = createCookieAuthClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: TEST_PASSWORD,
  });
  if (error) throw new Error(`signIn ${email}: ${error.message}`);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error(`signIn ${email}: no user after login`);
  return { cookies, userId: user.id };
}

async function postChat(cookieHeader, body) {
  const started = performance.now();
  const res = await fetch(`${BASE_URL}/api/practice/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify(body),
  });
  const elapsed = Math.round(performance.now() - started);
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, elapsed, data };
}

async function runUser(index, email, activityId) {
  const label = `user-${String(index + 1).padStart(2, "0")}`;
  const log = (msg) => process.stdout.write(`[${label}] ${msg}\n`);

  try {
    const { cookies, userId } = await signIn(email);
    const cookieHeader = cookiesToHeader(cookies);
    let sessionId = null;
    const messageResults = [];

    for (let m = 0; m < MESSAGES_PER_USER; m++) {
      const message = USER_MESSAGES[m % USER_MESSAGES.length];
      const body = { activityId, message };
      if (sessionId) body.sessionId = sessionId;

      const result = await postChat(cookieHeader, body);
      messageResults.push(result);

      if (!result.ok) {
        return {
          label,
          email,
          userId,
          ok: false,
          error: result.data?.error || `HTTP ${result.status}`,
          messageResults,
        };
      }

      sessionId = result.data.sessionId ?? sessionId;
      log(`message ${m + 1}/${MESSAGES_PER_USER} OK (${result.elapsed}ms)`);
    }

    const totalMs = messageResults.reduce((s, r) => s + r.elapsed, 0);
    return {
      label,
      email,
      userId,
      ok: true,
      sessionId,
      totalMs,
      messageResults,
    };
  } catch (err) {
    return { label, email, ok: false, error: err.message };
  }
}

function printSummary(results, wallMs) {
  const ok = results.filter((r) => r.ok);
  const fail = results.filter((r) => !r.ok);

  console.log("\n──────── summary ────────");
  console.log(`Wall time:     ${wallMs}ms`);
  console.log(`Users:         ${results.length} (${ok.length} ok, ${fail.length} failed)`);
  console.log(
    `Messages:      ${ok.length * MESSAGES_PER_USER} sent (${MESSAGES_PER_USER} per user)`
  );

  if (ok.length) {
    const times = ok.map((r) => r.totalMs);
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const min = Math.min(...times);
    const max = Math.max(...times);
    console.log(`Per-user total: min ${min}ms, avg ${avg}ms, max ${max}ms`);
  }

  if (fail.length) {
    console.log("\nFailures:");
    for (const r of fail) {
      console.log(`  ${r.label} (${r.email}): ${r.error}`);
    }
  }

  console.log("");
  process.exit(fail.length ? 1 : 0);
}

async function main() {
  requireEnv();
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (listOnly) {
    await listActivities(admin);
    return;
  }

  console.log(`Base URL:        ${BASE_URL}`);
  console.log(`Concurrent:      ${CONCURRENT_USERS}`);
  console.log(`Messages/user:   ${MESSAGES_PER_USER}`);

  const activityId = await resolveActivityId(admin);
  const emails = await ensureTestUsers(admin, CONCURRENT_USERS);

  console.log(`\nStarting ${CONCURRENT_USERS} users in parallel…\n`);
  const wallStart = performance.now();
  const results = await Promise.all(
    emails.map((email, i) => runUser(i, email, activityId))
  );
  const wallMs = Math.round(performance.now() - wallStart);
  printSummary(results, wallMs);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
