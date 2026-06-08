# OpenCX — Data Lists

A mobile-first landing page that indexes downloadable data lists (**CSV and
Excel/XLSX**). Each list shows a live record count, region/platform breakdown, a
5-row preview, and a one-tap download. Files are read straight from public URLs
(Cloudflare R2) — no database, no upload step.

Built with Next.js (App Router) + Tailwind. Deploys to Vercel as-is.

---

## ✏️ Adding or replacing a list

**`config/lists.ts` is the only file you edit.** Lists are organised into
ordered **groups** → **subgroups**; the OpenCX (“open…”) lead lists come first,
the hotel lists follow.

```ts
{
  id: "hotels-us-texas",          // stable, url-safe id (used in api + download)
  title: "Texas",
  group: "Hotels",                // top-level section (see GROUP_ORDER)
  subgroup: "United States — by state",
  category: "US · State",         // small badge on the card
  description: "…",
  url: "https://…/hotels_us_texas.xlsx",   // .csv or .xlsx — detected automatically
  accent: "indigo",               // color theme
  icon: "hotel",
}
```

- **Add a list** → append an object to the relevant array.
- **Replace data** → just swap the `url`. Record count, file size, region &
  platform chips and the preview are read from the file — nothing else changes.
- **CSV or XLSX** → both work. XLSX is parsed server-side (the `Leads` sheet is
  used if present); multi-sheet workbooks and numeric cells are handled.
- **Any schema** → the header row is read from each file at request time. The
  preview renderer auto-detects the name/location/contact columns, linkifies
  emails/phones/URLs, turns `;`- or `|`-separated fields into chips, and hides
  empty + scoring-metadata columns. A list with totally different columns just
  works — no column names are hardcoded.

Big subgroups (e.g. the 53 US states) collapse behind a “Show all” toggle, and
search (top of page) filters across **every** list regardless of grouping.

### Ordering

Groups render in `GROUP_ORDER` and subgroups in `SUBGROUP_ORDER` (top of
`config/lists.ts`). The OpenCX lead lists are the first group, so the “open…”
files always appear first.

### Refreshing after replacing a file

Each list's stats/preview are cached for an hour (and refresh on every deploy).
To refresh **immediately** after swapping a file at the same URL, set a
`REVALIDATE_SECRET` env var and call:

```bash
curl -X POST "https://your-site.vercel.app/api/revalidate?secret=YOUR_SECRET"
```

---

## 🚀 Deploy to Vercel

1. Push this repo to GitHub.
2. Vercel → **New Project → import the repo**. Framework auto-detected. No env
   vars required to run.
3. Deploy.

Optional env var:

| Variable            | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `REVALIDATE_SECRET` | Enables `POST /api/revalidate` to refresh on demand. |

---

## 🧱 How it works (scales to many lists)

The index page is **fully static** — it renders cards from `config/lists.ts`
with no network calls, so it's instant no matter how many lists you add. Each
card then **lazily** fetches its own stats/preview from `/api/list/[id]` when it
scrolls near the viewport, showing a skeleton until ready.

| Path                              | Role                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------- |
| `config/lists.ts`                 | The list registry + grouping + branding. **Edit this.**                         |
| `lib/csv.ts`                      | Dependency-free RFC-4180 CSV reader.                                             |
| `lib/listData.ts`                 | Reads a CSV **or** XLSX (exceljs) once → sample rows + total + region/platform tallies, cached per-list. |
| `lib/format.ts`                   | Schema-agnostic helpers: humanize columns, classify values, pick the best region axis. |
| `app/api/list/[id]/route.ts`      | Returns one list's derived data as JSON (cached).                               |
| `app/api/download/[id]/route.ts`  | Streams the file with the right `Content-Type` (csv/xlsx) and a clean filename. |
| `app/api/revalidate/route.ts`     | Optional on-demand cache refresh.                                               |
| `components/*`                    | `ListBrowser` (search + grouped sections) → `ListCard` (lazy) → `PreviewSheet`. |

CSV/XLSX parsing happens on the server, so there are no CORS issues and the raw
URL is never needed by the browser.

---

## 🛠 Local development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```
