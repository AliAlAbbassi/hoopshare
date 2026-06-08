"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, FileWarning } from "lucide-react";
import clsx from "clsx";
import type { ListConfig } from "@/config/lists";
import type { ListData } from "@/lib/types";
import type { LoadStatus } from "@/lib/useListData";
import { accentClasses } from "@/lib/accent";
import { formatNumber, formatBytes } from "@/lib/format";
import { ListIcon } from "./ListIcon";
import { RecordCard } from "./RecordCard";
import { DownloadButton } from "./DownloadButton";

export function PreviewSheet({
  open,
  onClose,
  config,
  data,
  status,
}: {
  open: boolean;
  onClose: () => void;
  config: ListConfig;
  data: ListData | null;
  status: LoadStatus;
}) {
  const a = accentClasses[config.accent];
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const isXlsx = /\.xlsx(\?|$)/i.test(config.url);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), 320);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const focusTimer = setTimeout(() => panelRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      clearTimeout(focusTimer);
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  const loading = status === "loading" || status === "idle";
  const failed = status === "error" || (data && data.error) || (data && data.sample.length === 0 && !loading);
  const sizeLabel = formatBytes(data?.bytes);

  let subtitle: string;
  if (loading) subtitle = "Loading preview…";
  else if (failed) subtitle = "Preview unavailable";
  else subtitle = `Showing ${data!.sample.length} of ${formatNumber(data!.total)} records`;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${config.title} preview`}
    >
      <button
        aria-label="Close preview"
        onClick={onClose}
        className={clsx(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          shown ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className={clsx(
          "relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-surface shadow-2xl outline-none",
          "sm:max-h-[85dvh] sm:max-w-lg sm:rounded-3xl",
          "transition-[transform,opacity] duration-300 ease-out",
          shown
            ? "translate-y-0 opacity-100 sm:scale-100"
            : "translate-y-full opacity-100 sm:translate-y-0 sm:scale-95 sm:opacity-0",
        )}
      >
        <div className="flex justify-center pt-3 sm:hidden">
          <span className="h-1.5 w-10 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-start gap-3 px-5 pb-4 pt-3 sm:pt-5">
          <div className={clsx("flex size-11 shrink-0 items-center justify-center rounded-xl", a.tile)}>
            <ListIcon name={config.icon} className="size-[22px]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className={clsx("text-[11px] font-semibold uppercase tracking-wide", a.text)}>
                {config.category}
              </p>
              <span className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                {isXlsx ? "XLSX" : "CSV"}
              </span>
            </div>
            <h3 className="truncate text-lg font-bold leading-tight text-foreground">
              {config.title}
            </h3>
            <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto overscroll-contain border-t border-border px-4 py-4">
          {loading ? (
            <>
              <RecordSkeleton />
              <RecordSkeleton />
              <RecordSkeleton />
            </>
          ) : failed ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <FileWarning className="size-7 text-muted" aria-hidden="true" />
              <p className="text-sm font-medium text-foreground">
                Couldn&apos;t load a preview
              </p>
              <p className="text-xs text-muted">
                {data?.error ?? "No rows found."} You can still download the full
                file below.
              </p>
            </div>
          ) : (
            data!.sample.map((record, i) => (
              <RecordCard key={i} record={record} columns={data!.columns} index={i} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-surface px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <DownloadButton
            id={config.id}
            filename={config.downloadName}
            accentButton={a.button}
            accentRing={a.ring}
            size="lg"
            label={sizeLabel ? `Download full file · ${sizeLabel}` : "Download full file"}
            className="w-full"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

function RecordSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-4">
      <div className="h-4 w-2/5 animate-pulse rounded bg-foreground/[0.08]" />
      <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-foreground/[0.06]" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-4/5 animate-pulse rounded bg-foreground/[0.06]" />
        <div className="h-3 w-3/5 animate-pulse rounded bg-foreground/[0.06]" />
      </div>
    </div>
  );
}
