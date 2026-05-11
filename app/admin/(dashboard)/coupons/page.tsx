"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input, Checkbox, Button, Toast, useToast } from "@/components/admin/Form";
import type { Coupon } from "@/lib/types";
import { Edit2, Plus, Trash2 } from "lucide-react";

const empty = (): Partial<Coupon> => ({
  code: "",
  discount_percent: 75,
  valid_from: new Date().toISOString().slice(0, 16),
  valid_until: null,
  is_active: true,
});

export default function CouponsAdmin() {
  const supabase = createClient();
  const toast = useToast();
  const [list, setList] = useState<Coupon[]>([]);
  const [editing, setEditing] = useState<Partial<Coupon> | null>(null);

  async function load() {
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    setList((data || []) as Coupon[]);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing?.code?.trim()) {
      toast.show("Coupon code is required", "error");
      return;
    }

    const payload = {
      code: editing.code.trim().toUpperCase(),
      discount_percent: editing.discount_percent ?? null,
      valid_from: editing.valid_from || new Date().toISOString(),
      valid_until: editing.valid_until?.trim() || null,
      is_active: !!editing.is_active,
    };

    if (editing.id) {
      const { error } = await supabase.from("coupons").update(payload).eq("id", editing.id);
      if (error) { toast.show(error.message, "error"); return; }
    } else {
      const { error } = await supabase.from("coupons").insert(payload);
      if (error) { toast.show(error.message, "error"); return; }
    }

    toast.show("Saved");
    setEditing(null);
    load();
  }

  async function toggleActive(c: Coupon) {
    const { error } = await supabase
      .from("coupons")
      .update({ is_active: !c.is_active })
      .eq("id", c.id);
    if (error) toast.show(error.message, "error");
    else { toast.show(c.is_active ? "Deactivated" : "Activated"); load(); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this coupon?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) toast.show(error.message, "error");
    else { toast.show("Deleted"); load(); }
  }

  function fmtDate(iso: string | null) {
    if (!iso) return "—";
    try { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
    catch { return iso; }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">Coupons</h1>
        <Button onClick={() => setEditing(empty())}>
          <Plus size={14} className="inline mr-1" /> New coupon
        </Button>
      </div>
      <p className="text-sm text-muted mb-6">
        Logged-in users see the <strong>most recent active coupon</strong> whose validity window contains today.
        Days 1–7 after signup: full dismissable card in the feed. Day 8+: slim strip in the feed and sidebar.
      </p>

      {editing && (
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 space-y-4 border-2 border-amber">
          <h2 className="font-bold">{editing.id ? "Edit" : "New"} coupon</h2>

          <Input
            label="Code (shown to users — automatically uppercased)"
            value={editing.code || ""}
            onChange={(e) => setEditing({ ...editing, code: e.target.value })}
            placeholder="NUDGEABLE75"
          />

          <Input
            label="Discount % (optional)"
            type="number"
            min={0}
            max={100}
            value={editing.discount_percent ?? ""}
            onChange={(e) =>
              setEditing({
                ...editing,
                discount_percent: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            placeholder="75"
          />

          <Input
            label="Valid from"
            type="datetime-local"
            value={editing.valid_from?.slice(0, 16) || ""}
            onChange={(e) => setEditing({ ...editing, valid_from: e.target.value })}
          />

          <Input
            label="Valid until (leave blank = never expires)"
            type="datetime-local"
            value={editing.valid_until?.slice(0, 16) || ""}
            onChange={(e) =>
              setEditing({ ...editing, valid_until: e.target.value || null })
            }
          />

          <Checkbox
            label="Active — show to logged-in users"
            checked={!!editing.is_active}
            onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
          />

          <div className="flex gap-2 pt-2">
            <Button onClick={save}>Save</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {list.map((c) => (
          <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-3 items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-bold text-sm font-mono">{c.code}</span>
                {c.discount_percent != null && (
                  <span className="text-[10px] font-semibold text-muted bg-chiffon px-2 py-0.5 rounded-full">
                    {c.discount_percent}% off
                  </span>
                )}
                {c.is_active ? (
                  <span className="text-[10px] font-bold bg-emerald text-white px-2 py-0.5 rounded-full">● ACTIVE</span>
                ) : (
                  <span className="text-[10px] font-bold bg-chiffon text-muted px-2 py-0.5 rounded-full">inactive</span>
                )}
              </div>
              <div className="text-xs text-muted">
                {fmtDate(c.valid_from)} → {fmtDate(c.valid_until)}
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleActive(c)}
              className={`text-xs font-semibold px-2 py-1 rounded-lg border transition flex-shrink-0 ${
                c.is_active
                  ? "text-muted border-nborder hover:bg-chiffon"
                  : "text-emerald border-emerald hover:bg-emerald hover:text-white"
              }`}
            >
              {c.is_active ? "Deactivate" : "Activate"}
            </button>

            <button
              type="button"
              onClick={() => setEditing(c)}
              className="text-muted hover:text-shadow flex-shrink-0"
            >
              <Edit2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => remove(c.id)}
              className="text-fuchsia hover:opacity-70 flex-shrink-0"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {list.length === 0 && <div className="text-sm text-muted">No coupons yet. Create one above.</div>}
      </div>

      <Toast message={toast.msg} type={toast.type} />
    </div>
  );
}
