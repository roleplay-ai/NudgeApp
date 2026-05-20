import { createAdminClient } from "@/lib/supabase/server";
import ChooseCompanyClient from "./ChooseCompanyClient";

export const dynamic = "force-dynamic";

type Company = { id: string; name: string };

export default async function ChooseCompanyPage() {
  const admin = createAdminClient();
  const { data, error } = await admin.from("companies").select("id, name").order("name");

  if (error) {
    return (
      <div className="rounded-2xl border border-nborder bg-white p-6">
        <div className="text-sm font-extrabold text-homeInk">Couldn’t load companies</div>
        <div className="text-sm text-muted mt-1">{error.message}</div>
      </div>
    );
  }

  const companies = (data ?? []) as Company[];

  return <ChooseCompanyClient companies={companies} />;
}

