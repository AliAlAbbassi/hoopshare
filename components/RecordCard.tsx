import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Building2,
} from "lucide-react";
import {
  classifyValue,
  ensureProtocol,
  humanizeColumn,
  isInternalColumn,
  locationColumns,
  pickHeadingColumn,
  platformColumn,
  prettyHost,
  asTags,
} from "@/lib/format";

const MAX_TAGS = 6;

/**
 * Renders a single CSV row as a readable "business card" — no fixed schema.
 * It picks a heading, groups location, and lays the rest out as labelled rows,
 * hiding empty + internal (slug/id) fields.
 */
export function RecordCard({
  record,
  columns,
  index,
}: {
  record: Record<string, string>;
  columns: string[];
  index: number;
}) {
  const headingCol = pickHeadingColumn(columns);
  const heading = (headingCol && record[headingCol]?.trim()) || `Record ${index + 1}`;

  const loc = locationColumns(columns);
  const platformCol = platformColumn(columns);
  const platform = platformCol ? record[platformCol]?.trim() : "";

  const locParts = [loc.city, loc.state, loc.country]
    .map((c) => (c ? record[c]?.trim() : ""))
    .filter(Boolean);
  const locationLine = locParts.join(", ");

  // Columns already represented by the heading / location / platform pill.
  const consumed = new Set(
    [headingCol, platformCol, loc.city, loc.state, loc.country].filter(
      Boolean,
    ) as string[],
  );

  const details = columns
    .filter((c) => !consumed.has(c) && !isInternalColumn(c))
    .map((c) => ({ col: c, value: (record[c] ?? "").trim() }))
    .filter((d) => d.value.length > 0)
    .map((d) => ({ ...d, kind: classifyValue(d.col, d.value) }));

  // Long "tags" fields (e.g. specialties) read better at the bottom.
  details.sort((a, b) => (a.kind === "tags" ? 1 : 0) - (b.kind === "tags" ? 1 : 0));

  return (
    <div
      className="animate-rise rounded-2xl border border-border bg-background/60 p-4"
      style={{ animationDelay: `${Math.min(index, 5) * 45}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-[15px] font-semibold leading-snug text-foreground">
            {heading}
          </h4>
          {locationLine && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{locationLine}</span>
            </p>
          )}
        </div>
        {platform && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-foreground/[0.06] px-2.5 py-1 text-[11px] font-medium text-muted">
            <Building2 className="size-3" aria-hidden="true" />
            {platform}
          </span>
        )}
      </div>

      {details.length > 0 && (
        <dl className="mt-3 space-y-2">
          {details.map((d) => (
            <Field key={d.col} label={humanizeColumn(d.col)} value={d.value} kind={d.kind} />
          ))}
        </dl>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  kind,
}: {
  label: string;
  value: string;
  kind: ReturnType<typeof classifyValue>;
}) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-2 text-[13px] sm:grid-cols-[6.5rem_1fr]">
      <dt className="truncate pt-px text-[11px] font-medium uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="min-w-0 text-foreground">
        <FieldValue value={value} kind={kind} />
      </dd>
    </div>
  );
}

function FieldValue({
  value,
  kind,
}: {
  value: string;
  kind: ReturnType<typeof classifyValue>;
}) {
  if (kind === "email") {
    return (
      <a
        href={`mailto:${value}`}
        className="inline-flex items-center gap-1.5 break-all text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground"
      >
        <Mail className="size-3.5 shrink-0 text-muted" aria-hidden="true" />
        {value}
      </a>
    );
  }
  if (kind === "phone") {
    return (
      <a
        href={`tel:${value.replace(/[^\d+]/g, "")}`}
        className="inline-flex items-center gap-1.5 text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground"
      >
        <Phone className="size-3.5 shrink-0 text-muted" aria-hidden="true" />
        {value}
      </a>
    );
  }
  if (kind === "url") {
    return (
      <a
        href={ensureProtocol(value)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 break-all text-foreground underline decoration-border underline-offset-2 hover:decoration-foreground"
      >
        {prettyHost(value)}
        <ExternalLink className="size-3 shrink-0 text-muted" aria-hidden="true" />
      </a>
    );
  }
  if (kind === "tags") {
    const tags = asTags(value);
    const shown = tags.slice(0, MAX_TAGS);
    const extra = tags.length - shown.length;
    return (
      <div className="flex flex-wrap gap-1.5">
        {shown.map((t, i) => (
          <span
            key={i}
            className="rounded-md bg-foreground/[0.06] px-2 py-0.5 text-[11px] text-foreground/80"
          >
            {t}
          </span>
        ))}
        {extra > 0 && (
          <span className="rounded-md px-1.5 py-0.5 text-[11px] text-muted">
            +{extra} more
          </span>
        )}
      </div>
    );
  }
  return <span className="break-words">{value}</span>;
}
