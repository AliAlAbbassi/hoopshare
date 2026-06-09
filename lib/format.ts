/**
 * Schema-agnostic helpers for turning an arbitrary CSV/XLSX row into something
 * readable. Nothing is tied to a particular set of columns — everything works
 * off generic name/value heuristics, so a new list with a different header just
 * works. Column names may be snake_case (csv) or spaced Title Case (xlsx).
 */

const ACRONYMS: Record<string, string> = {
  id: "ID",
  url: "URL",
  uri: "URI",
  api: "API",
  dm: "DM",
  pms: "PMS",
  faq: "FAQ",
  ceo: "CEO",
  hq: "HQ",
};

/** "booking_url" → "Booking URL", "Owner/DM Email" → "Owner / DM Email". */
export function humanizeColumn(col: string): string {
  return col
    .replace(/[_\-.]+/g, " ")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .split(/\s+/)
    .map((w) =>
      w === "/" ? w : ACRONYMS[w.toLowerCase()] ?? w.charAt(0).toUpperCase() + w.slice(1),
    )
    .join(" ");
}

/** Normalised, lower-cased name for exact-word matching. */
function norm(col: string): string {
  return col
    .replace(/[_\-./]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .toLowerCase();
}

// Word-boundary aware patterns (handle spaces, underscores, slashes, hyphens).
const B = "(^|[\\s_/-])";
const E = "([\\s_/-]|$)";
const RX = {
  heading: new RegExp(
    `${B}(name|title|company|business|organization|organisation|account|brand|hotel|property|venue|clinic|practice|shop)${E}`,
    "i",
  ),
  city: new RegExp(`${B}(city|town|locality)${E}`, "i"),
  state: new RegExp(`${B}(state|province|region)${E}`, "i"),
  country: new RegExp(`${B}(country|nation)${E}`, "i"),
  address: new RegExp(`${B}(address|street|addr)${E}`, "i"),
  postal: new RegExp(`${B}(zip|postal|postcode)${E}`, "i"),
  email: new RegExp(`${B}e-?mail${E}`, "i"),
  phone: new RegExp(`${B}(phone|tel|mobile|cell|fax)${E}`, "i"),
  internal: /(slug|_id$|^id$|^uuid$|guid|confidence|\bsource\b|\bactive\b)/i,
};

// Support-volume score, decision-maker, and contact columns.
const RX_SCORE = /(staff[\s_]?count|room[\s_]?count|employees|headcount|team[\s_]?size|\bstaff\b|\brooms?\b|\bseats\b)/i;
const RX_OWNER_POS = /(decision[\s_]?maker|owner|principal|founder)/i;
const RX_OWNER_NEG = /(title|role|email|phone|confidence|count|contacts)/i;
const RX_EMAIL_NAME = /e-?mail/i;
const RX_PHONE_NAME = /(phone|tel|mobile|cell)/i;

/** The column we treat as a support-volume score (staff/room count). */
export function scoreColumn(columns: string[]): string | undefined {
  return columns.find((c) => RX_SCORE.test(norm(c)));
}

/** A named decision-maker / owner column (not title/role/email). */
export function ownerColumn(columns: string[]): string | undefined {
  return columns.find((c) => {
    const n = norm(c);
    return RX_OWNER_POS.test(n) && !RX_OWNER_NEG.test(n);
  });
}

export function emailColumns(columns: string[]): string[] {
  return columns.filter((c) => RX_EMAIL_NAME.test(norm(c)));
}

export function phoneColumns(columns: string[]): string[] {
  return columns.filter((c) => RX_PHONE_NAME.test(norm(c)));
}

/** Parse a numeric score out of a cell (e.g. "1,200" → 1200). */
export function parseScore(v: string): number | null {
  const m = v.replace(/[, ]/g, "").match(/-?\d+(?:\.\d+)?/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
}

/** Columns whose normalised name *is* the platform. */
const PLATFORM_NAMES = new Set([
  "platform",
  "booking engine",
  "engine",
  "provider",
  "vendor",
  "source",
  "pms",
]);

export type FieldKind = "email" | "phone" | "url" | "tags" | "text";

export function pickHeadingColumn(columns: string[]): string | null {
  return columns.find((c) => RX.heading.test(c)) ?? columns[0] ?? null;
}

export function locationColumns(columns: string[]): {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal?: string;
} {
  const find = (rx: RegExp) => columns.find((c) => rx.test(c));
  return {
    address: find(RX.address),
    city: find(RX.city),
    state: find(RX.state),
    country: find(RX.country),
    postal: find(RX.postal),
  };
}

export function platformColumn(columns: string[]): string | undefined {
  return columns.find((c) => PLATFORM_NAMES.has(norm(c)));
}

/**
 * Geography columns in "broadest first" preference order (country → state →
 * city). The data layer tallies each and shows the broadest one that actually
 * varies, so single-country files fall back to state/city automatically.
 */
export function geoPreference(columns: string[]): string[] {
  const loc = locationColumns(columns);
  return [loc.country, loc.state, loc.city].filter(Boolean) as string[];
}

export function isInternalColumn(col: string): boolean {
  return RX.internal.test(norm(col));
}

export function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

/** A url, or a bare domain like "acmt.ca" / "go4golf.setmore.com/book". */
export function isUrlish(value: string): boolean {
  const t = value.trim();
  if (isUrl(t)) return true;
  if (!t || t.includes(" ")) return false;
  return /^[a-z0-9.-]+\.[a-z]{2,}(?:[/?#].*)?$/i.test(t);
}

const TAG_SPLIT = /\s*[;|]\s*/;

/** Decide how a single value should be presented. */
export function classifyValue(col: string, value: string): FieldKind {
  const v = value.trim();
  if (RX.email.test(col) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "email";
  if (RX.phone.test(col)) return "phone";
  if (isUrlish(v)) return "url";
  if (TAG_SPLIT.test(v) && v.split(TAG_SPLIT).filter((s) => s.trim()).length > 1) {
    return "tags";
  }
  return "text";
}

export function asTags(value: string): string[] {
  return value
    .split(TAG_SPLIT)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Ensure a link has a protocol so it's clickable. */
export function ensureProtocol(value: string): string {
  const v = value.trim();
  return isUrl(v) ? v : `https://${v}`;
}

export function prettyHost(value: string): string {
  try {
    return new URL(ensureProtocol(value)).host.replace(/^www\./, "");
  } catch {
    return value;
  }
}

// ── numbers & sizes ───────────────────────────────────────────────────────

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/** 12948 → "12.9k", 5015 → "5k", 980 → "980". */
export function formatCompact(n: number): string {
  if (n < 1000) return String(n);
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatBytes(bytes: number | null | undefined): string | null {
  if (!bytes || bytes <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v >= 10 || i === 0 ? Math.round(v) : v.toFixed(1)} ${units[i]}`;
}

/** Tidy a numeric value (e.g. an xlsx confidence float) without mangling ids. */
export function formatMaybeNumber(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return String(Number(n.toFixed(4)));
}
