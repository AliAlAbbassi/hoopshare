export type Tally = { label: string; count: number };

export type ListData = {
  /** Header row, in file order. */
  columns: string[];
  /** First N rows as { column: value } objects. */
  sample: Record<string, string>[];
  /** Total data rows (header excluded). */
  total: number;
  /** Content-Length of the file, if the server reported it. */
  bytes: number | null;
  /** Top values of the platform column, if one exists. */
  platforms: Tally[];
  /** Top values of the best geography column, if one exists. */
  regions: Tally[];
  /** Set when the file couldn't be read; the card degrades gracefully. */
  error?: string;
};
