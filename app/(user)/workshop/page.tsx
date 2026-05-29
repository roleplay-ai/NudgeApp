import { createClient } from "@/lib/supabase/server";
import type { Company } from "@/lib/types";
import WorkshopContent from "@/components/user/WorkshopContent";

export const dynamic = "force-dynamic";

export default async function WorkshopPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <WorkshopContent
        isLoggedIn={false}
        needsCompany={false}
        displayName={null}
        companies={[]}
      />
    );
  }

  const [{ data: profile }, { data: companies }] = await Promise.all([
    supabase.from("profiles").select("display_name, company_id").eq("id", user.id).single(),
    supabase.from("companies").select("id, name").order("name"),
  ]);

  return (
    <WorkshopContent
      isLoggedIn={true}
      needsCompany={!profile?.company_id}
      displayName={profile?.display_name ?? null}
      companies={(companies || []) as Company[]}
    />
  );
}
