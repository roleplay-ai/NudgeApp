import type { Metadata } from "next";
import Link from "next/link";
import {
  COMPANY_NAME,
  LEGAL_ENTITY_NAME,
  PRIVACY_CONTACT_EMAIL,
  SITE_HOST_LABEL,
  SITE_ORIGIN,
} from "@/lib/site";

export const metadata: Metadata = {
  title: `Privacy policy — ${COMPANY_NAME}`,
  description: `How ${LEGAL_ENTITY_NAME} collects and uses personal information on ${SITE_HOST_LABEL}.`,
  alternates: { canonical: `${SITE_ORIGIN}/privacy` },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="dark-auth-form min-h-screen px-5 py-12 bg-homeSidebar text-white">
      <article className="w-full max-w-2xl mx-auto">
        <header className="mb-10 text-center">
          <p className="text-[10px] font-bold tracking-[2px] text-homeClay mb-1">{SITE_HOST_LABEL}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Privacy policy</h1>
          <p className="text-white/50 text-sm mt-2">
            {LEGAL_ENTITY_NAME} · Effective May 10, 2026
          </p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 sm:px-8 py-8 space-y-8 text-sm text-white/80 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white tracking-tight">1. Who we are</h2>
            <p>
              <strong className="text-white">{LEGAL_ENTITY_NAME}</strong> (“we”, “us”) operates the website and
              application at{" "}
              <a
                href={SITE_ORIGIN}
                className="text-homeClay hover:text-amber no-underline font-semibold"
                target="_blank"
                rel="noopener noreferrer"
              >
                {SITE_ORIGIN}
              </a>{" "}
              (the “Service”). We are based in <strong className="text-white">India</strong>.
            </p>
            <p>
              Privacy inquiries:{" "}
              <a
                href={`mailto:${PRIVACY_CONTACT_EMAIL}`}
                className="text-homeClay hover:text-amber no-underline font-semibold"
              >
                {PRIVACY_CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white tracking-tight">2. Who this policy covers</h2>
            <p>
              This policy describes how we handle personal information about{" "}
              <strong className="text-white">end users</strong> of the Service—people who browse or sign in to use{" "}
              {COMPANY_NAME}.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white tracking-tight">3. Information we collect</h2>
            <ul className="list-disc pl-5 space-y-3 marker:text-homeClay">
              <li>
                <strong className="text-white">Account details.</strong> When you create an account or sign in
                (including with Google), we process information needed to operate your account, such as your{" "}
                <strong className="text-white">email address</strong> and <strong className="text-white">name</strong>,
                along with identifiers from our authentication provider.
              </li>
              <li>
                <strong className="text-white">Learning activity.</strong> When you use learning features, we process
                information such as <strong className="text-white">progress</strong>,{" "}
                <strong className="text-white">completions</strong>, and <strong className="text-white">scores</strong>{" "}
                associated with your account.
              </li>
              <li>
                <strong className="text-white">Sign-in & sessions.</strong> We use{" "}
                <strong className="text-white">cookies</strong> and similar technologies as needed for secure sign-in
                and session management through{" "}
                <a
                  href="https://supabase.com/docs/guides/auth"
                  className="text-homeClay hover:text-amber no-underline font-semibold"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Supabase Auth
                </a>
                . If you use Google sign-in, Google processes your login according to Google&apos;s policies; see also{" "}
                <Link href="/oauth/consent" className="text-homeClay hover:text-amber no-underline font-semibold">
                  Authorization & consent
                </Link>
                .
              </li>
              <li>
                <strong className="text-white">Usage analytics.</strong> We collect limited first-party analytics (for
                example page views and certain clicks) to understand how the Service is used. This may include event
                type, page path, referring URL, optional contextual metadata about the interaction, a random identifier
                for your <strong className="text-white">current browser session</strong> (stored in session storage; it
                does not persist across browser sessions), internet protocol (IP) address, and timestamps. Analytics are
                stored in our systems and access is restricted.
              </li>
              <li>
                <strong className="text-white">Technical data.</strong> Like most online services, our systems receive
                technical information when you use the Service (for example IP address, browser type, and request
                timestamps).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white tracking-tight">4. How we use information</h2>
            <p>We use personal information to:</p>
            <ul className="list-disc pl-5 space-y-2 marker:text-homeClay">
              <li>provide, operate, and improve the Service and your account;</li>
              <li>record and display learning progress, completions, and scores;</li>
              <li>maintain security, diagnose issues, and prevent abuse;</li>
              <li>understand aggregate usage through analytics; and</li>
              <li>comply with applicable law and respond to lawful requests.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white tracking-tight">5. Legal bases</h2>
            <p>
              Depending on applicable law (including India&apos;s Digital Personal Data Protection Act, 2023, where it
              applies), we process personal data where permitted—for example to perform our contract with you, for
              legitimate interests that are not overridden by your rights, with consent where required, or to comply with
              legal obligations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white tracking-tight">6. Sharing</h2>
            <p>
              We use trusted service providers to host and operate the Service. That includes{" "}
              <strong className="text-white">Supabase</strong> for authentication and database hosting. If you choose{" "}
              <strong className="text-white">Google</strong> sign-in, Google processes your Google account login under
              Google&apos;s policies.
            </p>
            <p>
              We do <strong className="text-white">not</strong> sell your personal information. We may disclose
              information if required by law or to protect the rights, safety, and integrity of users and the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white tracking-tight">7. International transfers</h2>
            <p>
              Your information may be processed in India and in other countries where our service providers operate,
              consistent with applicable law and safeguards required in your jurisdiction.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white tracking-tight">8. Retention</h2>
            <p>
              We retain personal information for as long as needed to provide the Service and for legitimate business and
              legal purposes, including security backups and compliance. Retention periods may vary by data category.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white tracking-tight">9. Security</h2>
            <p>
              We implement reasonable technical and organizational measures designed to protect personal information. No
              method of transmission or storage is completely secure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white tracking-tight">10. Your choices and rights</h2>
            <p>
              Depending on applicable law, you may have rights to access, correct, update, delete, or restrict certain
              processing, or to lodge a complaint with an authority. To exercise these rights, contact us at{" "}
              <a
                href={`mailto:${PRIVACY_CONTACT_EMAIL}`}
                className="text-homeClay hover:text-amber no-underline font-semibold"
              >
                {PRIVACY_CONTACT_EMAIL}
              </a>{" "}
              from the email address associated with your account where possible.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white tracking-tight">11. Children</h2>
            <p>
              The Service is not directed at children under 16. If you believe we have collected personal information
              from a child without appropriate authority, contact us and we will take appropriate steps.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-extrabold text-white tracking-tight">12. Changes</h2>
            <p>
              We may update this policy from time to time. We will post the updated policy on this page with a new
              effective date.
            </p>
          </section>
        </div>

        <p className="text-center text-white/40 text-xs mt-8 space-x-4">
          <Link href="/login" className="text-homeClay hover:text-amber no-underline font-semibold">
            Sign in
          </Link>
          <span aria-hidden>·</span>
          <Link href="/" className="text-homeClay hover:text-amber no-underline font-semibold">
            Back to {COMPANY_NAME}
          </Link>
        </p>
      </article>
    </div>
  );
}
