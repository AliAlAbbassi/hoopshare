import { revalidateTag, revalidatePath } from "next/cache";

/**
 * On-demand cache refresh. Call this after you replace a CSV behind an existing
 * url so previews/counts update immediately instead of waiting for the hourly
 * revalidation (or a redeploy).
 *
 *   curl -X POST "https://your-site/api/revalidate?secret=YOUR_SECRET"
 *
 * Set REVALIDATE_SECRET in your Vercel project env to enable it. Without it the
 * endpoint is disabled.
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return Response.json(
      { ok: false, error: "Revalidation not configured (set REVALIDATE_SECRET)." },
      { status: 501 },
    );
  }

  const url = new URL(req.url);
  const provided =
    url.searchParams.get("secret") ?? req.headers.get("x-revalidate-secret");

  if (provided !== secret) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // "max" is the Next 16 cache-life profile for immediate tag invalidation.
  revalidateTag("lists", "max");
  revalidatePath("/");

  return Response.json({ ok: true, revalidated: true });
}
