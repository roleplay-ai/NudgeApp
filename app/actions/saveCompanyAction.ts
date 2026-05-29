"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveCompanyAction(companyId: string): Promise<{ success: boolean; error?: string }> {
  if (!companyId?.trim()) return { success: false, error: "Please select a company." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ company_id: companyId.trim() })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/workshop");
  return { success: true };
}
