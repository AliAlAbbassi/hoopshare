import { getList } from "@/config/lists";
import { getListData } from "@/lib/listData";

// Derived data is cached (unstable_cache, hourly) + at the CDN below.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const list = getList(id);
  if (!list) {
    return Response.json({ error: "List not found" }, { status: 404 });
  }

  const data = await getListData(list);

  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
