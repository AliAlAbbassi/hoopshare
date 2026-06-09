import "server-only";
import { unstable_cache } from "next/cache";
import ExcelJS from "exceljs";
import type { ListConfig } from "@/config/lists";
import { formatOf } from "@/config/lists";
import type { ListData, SampleRow, Tally } from "./types";
import { iterateRecords } from "./csv";
import {
  platformColumn,
  geoPreference,
  formatMaybeNumber,
  scoreColumn,
  ownerColumn,
  emailColumns,
  phoneColumns,
  parseScore,
} from "./format";

const EMPTY = (error?: string): ListData => ({
  columns: [],
  sample: [],
  total: 0,
  bytes: null,
  platforms: [],
  regions: [],
  scoreLabel: null,
  scoreTop: null,
  withContacts: 0,
  error,
});

/** A candidate sample row kept while scanning (refs only — no copying). */
type Cand = { rec: string[]; score: number | null; hasOwner: boolean };

function topN(tally: Map<string, number>, n: number): Tally[] {
  return [...tally.entries()]
    .filter(([label]) => label.trim().length > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, count]) => ({ label: label.trim(), count }));
}

// ── XLSX → rows ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cellToString(v: any): string {
  if (v === null || v === undefined) return "";
  const t = typeof v;
  if (t === "string") return v.trim();
  if (t === "number") return formatMaybeNumber(v);
  if (t === "boolean") return v ? "TRUE" : "FALSE";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (t === "object") {
    if (Array.isArray(v.richText)) return v.richText.map((r: { text: string }) => r.text).join("").trim();
    if (typeof v.text === "string") return v.text.trim();
    if (v.hyperlink) return String(v.text ?? v.hyperlink).trim();
    if (v.result !== undefined && v.result !== null) return cellToString(v.result);
  }
  return String(v).trim();
}

function pickSheet(wb: ExcelJS.Workbook): ExcelJS.Worksheet | undefined {
  return (
    wb.worksheets.find((w) => w.name.trim().toLowerCase() === "leads") ??
    wb.worksheets.find((w) => w.actualRowCount > 1) ??
    wb.worksheets[0]
  );
}

function xlsxToRecords(wb: ExcelJS.Workbook): string[][] {
  const ws = pickSheet(wb);
  if (!ws) return [];
  const cols = ws.actualColumnCount;
  const records: string[][] = [];
  ws.eachRow({ includeEmpty: false }, (row) => {
    // row.values is 1-indexed (index 0 is empty).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vals = row.values as any[];
    const arr: string[] = [];
    for (let c = 1; c <= cols; c++) arr.push(cellToString(vals[c]));
    records.push(arr);
  });
  return records;
}

// ── Fetch + read (either format) ────────────────────────────────────────────

async function readRecords(
  list: ListConfig,
): Promise<{ records: Iterable<string[]>; bytes: number | null }> {
  const res = await fetch(list.url, { cache: "no-store" });
  if (!res.ok) throw new Error(`File responded ${res.status}`);
  const bytes = Number(res.headers.get("content-length")) || null;

  if (formatOf(list) === "xlsx") {
    const buf = await res.arrayBuffer();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf);
    return { records: xlsxToRecords(wb), bytes };
  }

  const text = await res.text();
  return { records: iterateRecords(text), bytes };
}

// ── Derive everything the UI needs in a single pass ─────────────────────────

export async function fetchListData(
  list: ListConfig,
  sampleSize = 5,
): Promise<ListData> {
  let records: Iterable<string[]>;
  let bytes: number | null;
  try {
    ({ records, bytes } = await readRecords(list));
  } catch (e) {
    return EMPTY(e instanceof Error ? e.message : "Couldn't read the file.");
  }

  let columns: string[] = [];
  let total = 0;

  let platformIdx = -1;
  const platformTally = new Map<string, number>();
  let geoIdx: number[] = [];
  let geoTallies: Map<string, number>[] = [];

  let scoreIdx = -1;
  let ownerIdx = -1;
  let contactIdx: number[] = [];

  let scoreTop: number | null = null;
  let withContacts = 0;
  const topCands: Cand[] = [];
  const firstFew: string[][] = [];

  // Strongest prospect first: named owner, then highest support score.
  const better = (a: Cand, b: Cand) => {
    if (a.hasOwner !== b.hasOwner) return a.hasOwner ? -1 : 1;
    return (b.score ?? -1) - (a.score ?? -1);
  };

  let first = true;
  for (const rec of records) {
    if (first) {
      columns = rec.map((c) => c.trim());
      const pc = platformColumn(columns);
      if (pc) platformIdx = columns.indexOf(pc);
      geoIdx = geoPreference(columns).map((c) => columns.indexOf(c));
      geoTallies = geoIdx.map(() => new Map<string, number>());
      const sc = scoreColumn(columns);
      if (sc) scoreIdx = columns.indexOf(sc);
      const oc = ownerColumn(columns);
      if (oc) ownerIdx = columns.indexOf(oc);
      contactIdx = [...emailColumns(columns), ...phoneColumns(columns)].map((c) =>
        columns.indexOf(c),
      );
      first = false;
      continue;
    }

    if (rec.length === 1 && rec[0].trim() === "") continue; // blank line

    total++;

    const score = scoreIdx >= 0 ? parseScore((rec[scoreIdx] ?? "").trim()) : null;
    if (score !== null && (scoreTop === null || score > scoreTop)) scoreTop = score;

    const hasContact = contactIdx.some((i) => (rec[i] ?? "").trim().length > 0);
    const hasOwner = ownerIdx >= 0 && (rec[ownerIdx] ?? "").trim().length > 0;

    if (firstFew.length < sampleSize) firstFew.push(rec);

    if (hasContact) {
      withContacts++;
      const cand: Cand = { rec, score, hasOwner };
      if (topCands.length < sampleSize) {
        topCands.push(cand);
        topCands.sort(better);
      } else if (better(cand, topCands[topCands.length - 1]) < 0) {
        topCands[topCands.length - 1] = cand;
        topCands.sort(better);
      }
    }

    if (platformIdx >= 0) {
      const v = (rec[platformIdx] ?? "").trim();
      if (v) platformTally.set(v, (platformTally.get(v) ?? 0) + 1);
    }
    for (let i = 0; i < geoIdx.length; i++) {
      const v = (rec[geoIdx[i]] ?? "").trim();
      if (v) geoTallies[i].set(v, (geoTallies[i].get(v) ?? 0) + 1);
    }
  }

  if (columns.length === 0) return EMPTY("The file looks empty.");

  // Sample: best contact rows first, padded with the first rows if needed.
  const chosenRecs: string[][] = topCands.map((c) => c.rec);
  for (const rec of firstFew) {
    if (chosenRecs.length >= sampleSize) break;
    if (!chosenRecs.includes(rec)) chosenRecs.push(rec);
  }
  const sample: SampleRow[] = chosenRecs.slice(0, sampleSize).map((rec) => {
    const values: Record<string, string> = {};
    columns.forEach((c, i) => {
      values[c] = (rec[i] ?? "").trim();
    });
    return {
      values,
      score: scoreIdx >= 0 ? parseScore(rec[scoreIdx] ?? "") : null,
    };
  });

  // Broadest geography that actually varies (country → state → city).
  let regions: Tally[] = [];
  for (const tally of geoTallies) {
    if (tally.size >= 2) {
      regions = topN(tally, 5);
      break;
    }
  }
  if (regions.length === 0 && geoTallies.length > 0) {
    regions = topN(geoTallies[0], 5);
  }

  return {
    columns,
    sample,
    total,
    bytes,
    platforms: topN(platformTally, 4),
    regions,
    scoreLabel: scoreIdx >= 0 && scoreTop !== null ? "Support score" : null,
    scoreTop,
    withContacts,
  };
}

/**
 * Cached entry point used by the list API route. Only the small derived
 * `ListData` (a few sample rows + tallies — never the whole file) is cached.
 * The cache key includes the url, so swapping a list's `url` busts its cache;
 * the "lists" tag lets `app/api/revalidate` refresh everything on demand.
 */
export function getListData(list: ListConfig, sampleSize = 5): Promise<ListData> {
  return unstable_cache(
    () => fetchListData(list, sampleSize),
    ["list-data:v2", list.id, list.url, String(sampleSize)],
    { revalidate: 3600, tags: ["lists", `list:${list.id}`] },
  )();
}
