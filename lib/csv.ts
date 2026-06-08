/**
 * Minimal, dependency-free RFC-4180 CSV reader.
 *
 * Yields one record (array of string fields) at a time, so callers can keep
 * just the first N rows + running tallies instead of materialising the whole
 * file. Handles:
 *   • quoted fields containing commas and newlines
 *   • escaped quotes ("")
 *   • CRLF and LF line endings
 *
 * The schema is whatever the first yielded record (the header) says it is —
 * nothing here assumes specific columns.
 */
export function* iterateRecords(text: string): Generator<string[]> {
  let field = "";
  let record: string[] = [];
  let inQuotes = false;
  let started = false; // have we seen any char of the current record?
  const n = text.length;

  for (let i = 0; i < n; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++; // skip the escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    switch (c) {
      case '"':
        inQuotes = true;
        started = true;
        break;
      case ",":
        record.push(field);
        field = "";
        started = true;
        break;
      case "\r":
        // swallow; the \n (or EOF) ends the record
        break;
      case "\n":
        record.push(field);
        yield record;
        record = [];
        field = "";
        started = false;
        break;
      default:
        field += c;
        started = true;
    }
  }

  // flush trailing record if the file doesn't end with a newline
  if (started || field.length > 0 || record.length > 0) {
    record.push(field);
    yield record;
  }
}
