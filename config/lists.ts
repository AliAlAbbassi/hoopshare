/**
 * ─────────────────────────────────────────────────────────────────────────
 *  THE ONLY FILE YOU EDIT TO ADD / REPLACE A LIST.
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  • Add a list   → append an object to one of the arrays below.
 *  • Replace data → swap the `url`. (Record count, file size, region/platform
 *                   chips and the preview are read straight from the file.)
 *  • CSV or XLSX  → both work; the format is detected from the url extension.
 *  • Any schema   → the header row is read from each file at request time, so
 *                   lists with totally different columns just work.
 *
 *  Lists render grouped, in the order of `GROUP_ORDER` below. The "open…"
 *  (OpenCX) lead lists come first; the hotel lists follow.
 */

export type AccentKey =
  | "indigo"
  | "emerald"
  | "rose"
  | "amber"
  | "sky"
  | "violet"
  | "teal";

export type IconKey =
  | "calendar"
  | "health"
  | "compass"
  | "store"
  | "users"
  | "briefcase"
  | "globe"
  | "building"
  | "hotel"
  | "table";

export type ListFormat = "csv" | "xlsx";

export type ListConfig = {
  /** URL-safe, stable id. Used in the api + download routes. */
  id: string;
  /** Display name. */
  title: string;
  /** Top-level section. Sections render in GROUP_ORDER. */
  group: string;
  /** Optional sub-section within a group. */
  subgroup?: string;
  /** Short badge on the card (vertical / platform / region). */
  category: string;
  /** One or two sentences for the card. */
  description: string;
  /** Public file url (Cloudflare R2). */
  url: string;
  /** Filename on download. Defaults to the url's basename. */
  downloadName?: string;
  /** Cosmetic color theme. */
  accent: AccentKey;
  /** Cosmetic icon. */
  icon: IconKey;
  /** Optional ribbon, e.g. "All". */
  badge?: string;
  /** Optional highlighted callout line on the card. */
  note?: string;
};

export const site = {
  name: "Open",
  headline: "20,000 businesses that look like Open's best customers.",
  tagline: "Scored, enriched, ready to download.",
  footnote:
    "Lists are provided as-is. Always comply with applicable privacy & outreach laws.",
};

/** Sections render in this order (groups not listed fall to the end). */
export const GROUP_ORDER = ["Leads", "Hotels"] as const;

/** Sub-sections render in this order within their group. */
export const SUBGROUP_ORDER = [
  "Everything",
  "By vertical",
  "By platform",
  "Countries & regions",
  "By booking platform",
  "United States — by state",
] as const;

// ── 1. OpenCX lead & booking lists (the "open…" files) ─────────────────────

const leadLists: ListConfig[] = [
  {
    id: "leads-all",
    title: "All Leads",
    group: "Leads",
    subgroup: "Everything",
    category: "Combined",
    description:
      "The full lead database — every appointments, healthcare and tours record in one file.",
    url: "https://pub-7195158a9e7043738d3e5e4fc10a5195.r2.dev/opencx_leads_all.csv",
    accent: "indigo",
    icon: "table",
    badge: "All",
  },
  {
    id: "appointments",
    title: "Appointments",
    group: "Leads",
    subgroup: "By vertical",
    category: "Appointments",
    description:
      "Service businesses running online booking — salons, spas, coaches and studios across SimplyBook & Setmore.",
    url: "https://pub-7195158a9e7043738d3e5e4fc10a5195.r2.dev/opencx_appointments.csv",
    accent: "violet",
    icon: "calendar",
  },
  {
    id: "healthcare",
    title: "Healthcare Clinics",
    group: "Leads",
    subgroup: "By vertical",
    category: "Healthcare",
    description:
      "Clinics & practitioners on JaneApp — physio, massage, chiro, acupuncture and allied health, mostly North America.",
    url: "https://pub-7195158a9e7043738d3e5e4fc10a5195.r2.dev/opencx_healthcare.csv",
    accent: "emerald",
    icon: "health",
  },
  {
    id: "tours",
    title: "Tours & Activities",
    group: "Leads",
    subgroup: "By vertical",
    category: "Tours",
    description:
      "Tour operators and activity providers running online booking through FareHarbor.",
    url: "https://pub-7195158a9e7043738d3e5e4fc10a5195.r2.dev/opencx_tours.csv",
    accent: "amber",
    icon: "compass",
    note: "FareHarbor is already an Open customer — here are 2,100 more like them.",
  },
  {
    id: "simplybook",
    title: "SimplyBook.me",
    group: "Leads",
    subgroup: "By platform",
    category: "SimplyBook",
    description: "Appointment-based businesses running on SimplyBook.me.",
    url: "https://pub-7195158a9e7043738d3e5e4fc10a5195.r2.dev/opencx_simplybook.csv",
    accent: "sky",
    icon: "calendar",
  },
  {
    id: "setmore",
    title: "Setmore",
    group: "Leads",
    subgroup: "By platform",
    category: "Setmore",
    description: "Appointment-based businesses running on Setmore.",
    url: "https://pub-7195158a9e7043738d3e5e4fc10a5195.r2.dev/opencx_setmore.csv",
    accent: "rose",
    icon: "calendar",
  },
  {
    id: "janeapp",
    title: "JaneApp",
    group: "Leads",
    subgroup: "By platform",
    category: "JaneApp",
    description: "Health & wellness clinics running on JaneApp.",
    url: "https://pub-7195158a9e7043738d3e5e4fc10a5195.r2.dev/opencx_janeapp.csv",
    accent: "teal",
    icon: "health",
  },
  {
    id: "fareharbor",
    title: "FareHarbor",
    group: "Leads",
    subgroup: "By platform",
    category: "FareHarbor",
    description: "Tour & activity operators running on FareHarbor.",
    url: "https://pub-7195158a9e7043738d3e5e4fc10a5195.r2.dev/opencx_fareharbor.csv",
    accent: "violet",
    icon: "compass",
  },
];

// ── 2. Hotel lists — countries / regions ───────────────────────────────────

const HOTEL_DESC =
  "with contacts, room counts, decision-makers & booking engines.";

const hotelCountries: ListConfig[] = [
  ["hotels_us", "United States", "USA"],
  ["hotels_canada", "Canada", "Canada"],
  ["hotels_uk", "United Kingdom", "UK"],
  ["hotels_australia", "Australia", "Australia"],
].map(([file, title, category]) => ({
  id: file.replace(/_/g, "-"),
  title,
  group: "Hotels",
  subgroup: "Countries & regions",
  category,
  description: `Hotels across ${title} ${HOTEL_DESC}`,
  url: `https://pub-7195158a9e7043738d3e5e4fc10a5195.r2.dev/${file}.xlsx`,
  accent: "teal" as AccentKey,
  icon: "globe" as IconKey,
}));

// ── 3. Hotel lists — by booking / PMS platform ─────────────────────────────

const hotelPlatforms: ListConfig[] = [
  ["hotels_cloudbeds", "Cloudbeds"],
  ["hotels_mews", "Mews"],
  ["hotels_siteminder", "SiteMinder"],
  ["hotels_rms", "RMS Cloud"],
  ["hotels_resnexus", "ResNexus"],
  ["hotels_stayntouch", "StayNTouch"],
  ["hotels_ipms247", "eZee (iPMS 247)"],
  ["hotels_jehs_ipms", "JEHS iPMS"],
  ["hotels_ycs", "YCS"],
  ["hotels_asi", "ASI FrontDesk"],
].map(([file, title]) => ({
  id: file.replace(/_/g, "-"),
  title,
  group: "Hotels",
  subgroup: "By booking platform",
  category: title,
  description: `Hotels & properties running on ${title} ${HOTEL_DESC}`,
  url: `https://pub-7195158a9e7043738d3e5e4fc10a5195.r2.dev/${file}.xlsx`,
  accent: "sky" as AccentKey,
  icon: "building" as IconKey,
}));

// ── 4. Hotel lists — every US state / territory ────────────────────────────

/** slug used in the filename → display name (defaults to title-cased slug). */
const STATE_NAMES: Record<string, string> = {
  district_of_columbia: "Washington, D.C.",
  new_hampshire: "New Hampshire",
  new_jersey: "New Jersey",
  new_mexico: "New Mexico",
  new_york: "New York",
  north_carolina: "North Carolina",
  north_dakota: "North Dakota",
  rhode_island: "Rhode Island",
  south_carolina: "South Carolina",
  south_dakota: "South Dakota",
  west_virginia: "West Virginia",
  puerto_rico: "Puerto Rico",
  virgin_islands: "U.S. Virgin Islands",
};

const STATE_SLUGS = [
  "alabama", "alaska", "arizona", "arkansas", "california", "colorado",
  "connecticut", "delaware", "district_of_columbia", "florida", "georgia",
  "hawaii", "idaho", "illinois", "indiana", "iowa", "kansas", "kentucky",
  "louisiana", "maine", "maryland", "massachusetts", "michigan", "minnesota",
  "mississippi", "missouri", "montana", "nebraska", "nevada", "new_hampshire",
  "new_jersey", "new_mexico", "new_york", "north_carolina", "north_dakota",
  "ohio", "oklahoma", "oregon", "pennsylvania", "puerto_rico", "rhode_island",
  "south_carolina", "south_dakota", "tennessee", "texas", "utah", "vermont",
  "virgin_islands", "virginia", "washington", "west_virginia", "wisconsin",
  "wyoming",
];

function titleizeSlug(slug: string): string {
  return slug
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const hotelStates: ListConfig[] = STATE_SLUGS.map((slug) => {
  const name = STATE_NAMES[slug] ?? titleizeSlug(slug);
  return {
    id: `hotels-us-${slug.replace(/_/g, "-")}`,
    title: name,
    group: "Hotels",
    subgroup: "United States — by state",
    category: "US · State",
    description: `Hotels in ${name} ${HOTEL_DESC}`,
    url: `https://pub-7195158a9e7043738d3e5e4fc10a5195.r2.dev/hotels_us_${slug}.xlsx`,
    accent: "indigo" as AccentKey,
    icon: "hotel" as IconKey,
  };
});

// ── Assembled registry (OpenCX lead lists first) ───────────────────────────

export const lists: ListConfig[] = [
  ...leadLists,
  ...hotelCountries,
  ...hotelPlatforms,
  ...hotelStates,
];

// ── Helpers ────────────────────────────────────────────────────────────────

export function getList(id: string): ListConfig | undefined {
  return lists.find((l) => l.id === id);
}

/** These lists are pinned to the front, in this order. Everything else follows. */
const PRIORITY_IDS = ["healthcare", "hotels-cloudbeds", "hotels-rms"];

export function orderedLists(): ListConfig[] {
  const prioritySet = new Set(PRIORITY_IDS);
  const pinned = PRIORITY_IDS.map((id) => lists.find((l) => l.id === id)).filter(
    (l): l is ListConfig => Boolean(l),
  );
  const rest = lists.filter((l) => !prioritySet.has(l.id));
  return [...pinned, ...rest];
}

/** csv vs xlsx, from the url extension. */
export function formatOf(list: ListConfig): ListFormat {
  return /\.xlsx(\?|$)/i.test(list.url) ? "xlsx" : "csv";
}

export function downloadNameOf(list: ListConfig): string {
  if (list.downloadName) return list.downloadName;
  const base = list.url.split("/").pop()?.split("?")[0];
  return base || `${list.id}.${formatOf(list)}`;
}

export type Group = {
  name: string;
  subgroups: { name: string; lists: ListConfig[] }[];
};

/** Lists organised into ordered groups → ordered subgroups, for the page. */
export function groupedLists(): Group[] {
  const order = (arr: readonly string[], v: string) => {
    const i = arr.indexOf(v);
    return i === -1 ? arr.length : i;
  };

  const byGroup = new Map<string, ListConfig[]>();
  for (const l of lists) {
    const arr = byGroup.get(l.group) ?? [];
    arr.push(l);
    byGroup.set(l.group, arr);
  }

  return [...byGroup.entries()]
    .sort((a, b) => order(GROUP_ORDER, a[0]) - order(GROUP_ORDER, b[0]))
    .map(([name, groupLists]) => {
      const bySub = new Map<string, ListConfig[]>();
      for (const l of groupLists) {
        const key = l.subgroup ?? "";
        const arr = bySub.get(key) ?? [];
        arr.push(l);
        bySub.set(key, arr);
      }
      const subgroups = [...bySub.entries()]
        .sort((a, b) => order(SUBGROUP_ORDER, a[0]) - order(SUBGROUP_ORDER, b[0]))
        .map(([subName, subLists]) => ({ name: subName, lists: subLists }));
      return { name, subgroups };
    });
}
