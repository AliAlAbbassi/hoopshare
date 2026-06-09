export type Tally = { label: string; count: number };

/** One sample row: its raw values + the derived support-volume score. */
export type SampleRow = {
  values: Record<string, string>;
  score: number | null;
};

export type ListData = {
  /** Header row, in file order. */
  columns: string[];
  /** Sample rows (strongest prospects first: named owner + contact + score). */
  sample: SampleRow[];
  /** Total data rows (header excluded). */
  total: number;
  /** Content-Length of the file, if the server reported it. */
  bytes: number | null;
  /** Top values of the platform column, if one exists. */
  platforms: Tally[];
  /** Top values of the best geography column, if one exists. */
  regions: Tally[];
  /** Label for the score column, e.g. "Support score" (null if not scored). */
  scoreLabel: string | null;
  /** Highest score in the file (for the card stat). */
  scoreTop: number | null;
  /** How many rows have a contact email or phone. */
  withContacts: number;
  /** Set when the file couldn't be read; the card degrades gracefully. */
  error?: string;
};
