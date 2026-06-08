import { getList, formatOf, downloadNameOf } from "@/config/lists";

// Always proxy the freshest file; never cache the (potentially large) stream.
export const dynamic = "force-dynamic";

const CONTENT_TYPE: Record<string, string> = {
  csv: "text/csv; charset=utf-8",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const list = getList(id);
  if (!list) {
    return new Response("List not found", { status: 404 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(list.url, { cache: "no-store" });
  } catch {
    return new Response("Upstream fetch failed", { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    return new Response(`Upstream responded ${upstream.status}`, {
      status: 502,
    });
  }

  // Sanitise the filename so it can't break out of the header.
  const filename = downloadNameOf(list).replace(/[\r\n"\\]/g, "");
  const contentType =
    upstream.headers.get("content-type") ||
    CONTENT_TYPE[formatOf(list)] ||
    "application/octet-stream";

  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  const len = upstream.headers.get("content-length");
  if (len) headers.set("Content-Length", len);
  headers.set("Cache-Control", "public, max-age=0, must-revalidate");

  return new Response(upstream.body, { status: 200, headers });
}
