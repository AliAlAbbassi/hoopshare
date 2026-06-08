"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X, SearchX, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";
import type { ListConfig, Group } from "@/config/lists";
import { ListCard } from "./ListCard";

const PAGE_SIZE = 12;

export function ListBrowser({ groups }: { groups: Group[] }) {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("All");

  const flat = useMemo(
    () => groups.flatMap((g) => g.subgroups.flatMap((s) => s.lists)),
    [groups],
  );
  const groupChips = useMemo(() => ["All", ...groups.map((g) => g.name)], [groups]);

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const results = useMemo(() => {
    if (!searching) return [];
    return flat.filter((l) => {
      if (activeGroup !== "All" && l.group !== activeGroup) return false;
      const hay =
        `${l.title} ${l.category} ${l.group} ${l.subgroup ?? ""} ${l.description}`.toLowerCase();
      return hay.includes(q);
    });
  }, [flat, q, searching, activeGroup]);

  const visibleGroups = useMemo(
    () => groups.filter((g) => activeGroup === "All" || g.name === activeGroup),
    [groups, activeGroup],
  );

  return (
    <div>
      {/* Controls */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 flex flex-col gap-3 bg-background/85 px-4 pb-3 pt-1 backdrop-blur-md sm:mx-0 sm:px-0">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${flat.length} lists — try "texas" or "cloudbeds"…`}
            aria-label="Search lists"
            className="w-full rounded-2xl border border-border bg-surface py-3 pl-11 pr-10 text-[15px] text-foreground shadow-sm outline-none transition-shadow placeholder:text-muted focus:shadow-md focus:ring-2 focus:ring-foreground/10"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {groupChips.length > 2 && (
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            {groupChips.map((c) => (
              <button
                key={c}
                onClick={() => setActiveGroup(c)}
                className={clsx(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  activeGroup === c
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-surface text-muted hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search results (flat, paginated) */}
      {searching ? (
        results.length > 0 ? (
          <section>
            <p className="mb-3 text-sm text-muted">
              {results.length} {results.length === 1 ? "result" : "results"} for
              <span className="font-medium text-foreground"> “{query.trim()}”</span>
            </p>
            <PaginatedGrid lists={results} />
          </section>
        ) : (
          <EmptyState />
        )
      ) : (
        // Grouped browse
        <div className="space-y-12">
          {visibleGroups.map((group) => (
            <section key={group.name}>
              <GroupHeader
                name={group.name}
                count={group.subgroups.reduce((n, s) => n + s.lists.length, 0)}
              />
              <div className="space-y-8">
                {group.subgroups.map((sub) => (
                  <div key={sub.name || "_"}>
                    {sub.name && <SubgroupHeader name={sub.name} count={sub.lists.length} />}
                    <PaginatedGrid lists={sub.lists} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function GroupHeader({ name, count }: { name: string; count: number }) {
  return (
    <div className="mb-5 flex items-baseline gap-3">
      <h2 className="text-xl font-bold tracking-tight text-foreground">{name}</h2>
      <span className="text-sm font-medium text-muted">{count}</span>
    </div>
  );
}

function SubgroupHeader({ name, count }: { name: string; count: number }) {
  return (
    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
      {name}
      <span className="ml-2 font-medium normal-case text-muted/70">{count}</span>
    </h3>
  );
}

/** A card grid that reveals PAGE_SIZE cards at a time (load-more pagination). */
function PaginatedGrid({ lists }: { lists: ListConfig[] }) {
  const [count, setCount] = useState(() => Math.min(PAGE_SIZE, lists.length));

  // Reset when the underlying list changes (e.g. a new search query).
  useEffect(() => {
    setCount(Math.min(PAGE_SIZE, lists.length));
  }, [lists]);

  const shown = lists.slice(0, count);
  const remaining = lists.length - count;
  const expanded = count > PAGE_SIZE;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((config) => (
          <ListCard key={config.id} config={config} />
        ))}
      </div>

      {(remaining > 0 || expanded) && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {remaining > 0 && (
            <button
              onClick={() => setCount((c) => Math.min(c + PAGE_SIZE, lists.length))}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-foreground/[0.04]"
            >
              Show {Math.min(PAGE_SIZE, remaining)} more
              <span className="text-muted">· {remaining} left</span>
              <ChevronDown className="size-4" aria-hidden="true" />
            </button>
          )}
          {expanded && (
            <button
              onClick={() => setCount(Math.min(PAGE_SIZE, lists.length))}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              Show less
              <ChevronUp className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border py-16 text-center">
      <SearchX className="size-8 text-muted" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">No lists match</p>
      <p className="text-xs text-muted">Try a different search or category.</p>
    </div>
  );
}
