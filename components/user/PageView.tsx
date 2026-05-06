"use client";

/**
 * Drop this anywhere inside the user layout to automatically fire a
 * `page_view` event every time the route changes.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";

export default function PageView() {
  const path = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === path) return;
    lastPath.current = path;
    track("page_view");
  }, [path]);

  return null;
}
