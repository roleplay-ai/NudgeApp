import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Legacy URLs (/apply/[taskId]) — Apply is now a single video library at /apply */
export default async function LegacyApplyTaskRedirect() {
  redirect("/apply");
}
