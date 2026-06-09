"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, Building2, MapPin, AlertCircle } from "lucide-react";
import clsx from "clsx";
import type { ListConfig } from "@/config/lists";
import { accentClasses } from "@/lib/accent";
import { formatCompact, formatBytes } from "@/lib/format";
import { useListData } from "@/lib/useListData";
import { ListIcon } from "./ListIcon";
import { DownloadButton } from "./DownloadButton";
import { PreviewSheet } from "./PreviewSheet";

export function ListCard({ config }: { config: ListConfig }) {
  const [open, setOpen] = useState(false);
  const { data, status, load } = useListData(config.id);
  const rootRef = useRef<HTMLElement>(null);
  const a = accentClasses[config.accent];

  // Load stats when the card scrolls near the viewport.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          load();
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [load]);

  const loaded = status === "loaded" && data && !data.error;
  const errored = status === "error" || (data?.error ?? false);
  const sizeLabel = formatBytes(data?.bytes);

  const chips = loaded
    ? [
        ...data!.platforms.map((p) => ({ kind: "platform" as const, label: p.label })),
        ...data!.regions.map((r) => ({ kind: "region" as const, label: r.label })),
      ].slice(0, 5)
    : [];

  return (
    <>
      <article
        ref={rootRef}
        className="flex flex-col rounded-2xl border border-border bg-surface p-5"
      >
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className={clsx("flex size-12 shrink-0 items-center justify-center rounded-2xl", a.tile)}>
            <ListIcon name={config.icon} className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={clsx("rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide", a.badge)}>
                {config.category}
              </span>
              {config.badge && (
                <span className="rounded-full bg-foreground/[0.06] px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                  {config.badge}
                </span>
              )}
            </div>
            <h3 className="mt-1.5 text-[17px] font-bold leading-tight text-foreground">
              {config.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="relative mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
          {config.description}
        </p>

        {/* Callout */}
        {config.note && (
          <p className="relative mt-3 rounded-lg border border-foreground/15 bg-foreground/[0.04] px-3 py-2 text-xs font-medium leading-relaxed text-foreground">
            {config.note}
          </p>
        )}

        {/* Stats */}
        <div className="relative mt-4 grid grid-cols-3 divide-x divide-border overflow-hidden rounded-2xl border border-border bg-background/50">
          <Stat
            value={loaded ? formatCompact(data!.total) : errored ? "—" : null}
            label="prospects"
          />
          <Stat
            value={loaded ? String(data!.columns.length) : errored ? "—" : null}
            label="fields"
          />
          <Stat value={sizeLabel ?? (errored ? "—" : null)} label="size" />
        </div>

        {/* Chips / status line */}
        <div className="relative mt-3 min-h-[1.75rem]">
          {loaded && chips.length > 0 ? (
            <div className="flex flex-nowrap gap-1.5 overflow-hidden [mask-image:linear-gradient(to_right,#000_88%,transparent)]">
              {chips.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-foreground/[0.05] px-2.5 py-1 text-xs font-medium text-foreground/70"
                >
                  {c.kind === "platform" ? (
                    <Building2 className="size-3 text-muted" aria-hidden="true" />
                  ) : (
                    <MapPin className="size-3 text-muted" aria-hidden="true" />
                  )}
                  {c.label}
                </span>
              ))}
            </div>
          ) : errored ? (
            <p className="inline-flex items-center gap-1.5 text-xs text-muted">
              <AlertCircle className="size-3.5" aria-hidden="true" />
              Live stats unavailable — download still works.
            </p>
          ) : (
            <div className="flex gap-1.5">
              <span className="h-6 w-20 animate-pulse rounded-lg bg-foreground/[0.06]" />
              <span className="h-6 w-16 animate-pulse rounded-lg bg-foreground/[0.06]" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="relative mt-auto flex items-center gap-2.5 pt-4">
          <button
            onClick={() => {
              load();
              setOpen(true);
            }}
            className="inline-flex flex-1 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
          >
            <Eye className="size-4" aria-hidden="true" />
            Preview
          </button>
          <DownloadButton
            id={config.id}
            filename={config.downloadName}
            accentButton={a.button}
            accentRing={a.ring}
            className="flex-1"
          />
        </div>
      </article>

      <PreviewSheet
        open={open}
        onClose={() => setOpen(false)}
        config={config}
        data={data}
        status={status}
      />
    </>
  );
}

function Stat({
  value,
  label,
  title,
}: {
  value: string | null;
  label: string;
  title?: string;
}) {
  return (
    <div className="px-3 py-2.5 text-center" title={title}>
      {value === null ? (
        <div className="mx-auto h-5 w-10 animate-pulse rounded bg-foreground/[0.08]" />
      ) : (
        <div className="text-base font-bold tabular-nums text-foreground">{value}</div>
      )}
      <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
        {label}
      </div>
    </div>
  );
}
