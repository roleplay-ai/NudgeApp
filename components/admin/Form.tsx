"use client";
import { useState } from "react";

export function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-shadow mb-1">{label}</span>
      <input {...props}
        className="w-full bg-chiffon rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber" />
    </label>
  );
}

export function Textarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-shadow mb-1">{label}</span>
      <textarea {...props}
        className="w-full bg-chiffon rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber min-h-[100px]" />
    </label>
  );
}

export function Select({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-shadow mb-1">{label}</span>
      <select {...props}
        className="w-full bg-chiffon rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

export function Checkbox({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" {...props} className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </label>
  );
}

export function Button({ children, variant = "primary", ...props }: { variant?: "primary" | "danger" | "ghost" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary: "bg-amber text-shadow",
    danger: "bg-fuchsia text-white",
    ghost: "bg-white border border-nborder text-shadow",
  };
  return (
    <button {...props}
      className={`${styles[variant]} font-semibold px-5 py-2.5 rounded-full text-sm disabled:opacity-50 ${props.className || ""}`}>
      {children}
    </button>
  );
}

export function Toast({ message, type = "success" }: { message: string | null; type?: "success" | "error" }) {
  if (!message) return null;
  return (
    <div className={`fixed bottom-6 right-6 ${type === "success" ? "bg-emerald" : "bg-fuchsia"} text-white px-4 py-2.5 rounded-lg text-sm shadow-lg z-50`}>
      {message}
    </div>
  );
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const [type, setType] = useState<"success" | "error">("success");
  function show(message: string, t: "success" | "error" = "success") {
    setMsg(message);
    setType(t);
    setTimeout(() => setMsg(null), 2500);
  }
  return { msg, type, show };
}
