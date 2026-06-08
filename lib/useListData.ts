"use client";

import { useCallback, useRef, useState } from "react";
import type { ListData } from "./types";

export type LoadStatus = "idle" | "loading" | "loaded" | "error";

/**
 * Lazily fetches a list's derived data (count / regions / sample) from
 * /api/list/[id]. Fetches at most once; call `load()` when the card scrolls
 * near the viewport or when the preview opens.
 */
export function useListData(id: string) {
  const [data, setData] = useState<ListData | null>(null);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const started = useRef(false);

  const load = useCallback(async () => {
    if (started.current) return;
    started.current = true;
    setStatus("loading");
    try {
      const res = await fetch(`/api/list/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ListData;
      setData(json);
      setStatus(json.error ? "error" : "loaded");
    } catch {
      setStatus("error");
      started.current = false; // allow a later retry
    }
  }, [id]);

  return { data, status, load };
}
