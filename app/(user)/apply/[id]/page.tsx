import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { ApplyTask, ApplySlide } from "@/lib/types";
import TileSlideshow from "@/components/user/TileSlideshow";

export const dynamic = "force-dynamic";

export default async function TaskDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: task }, { data: slides }] = await Promise.all([
    supabase.from("apply_tasks").select("*").eq("id", id).single(),
    supabase.from("apply_slides").select("*").eq("task_id", id).order("order_index"),
  ]);
  if (!task) return notFound();
  return <TileSlideshow task={task as ApplyTask} slides={(slides || []) as ApplySlide[]} />;
}
