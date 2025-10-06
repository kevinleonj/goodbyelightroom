import { NextResponse } from "next/server";

/**
 * POST /api/revalidate
 * Next.js on Cloudflare Pages runs in the edge runtime. We simply acknowledge the
 * revalidation request, as static exports will be rebuilt on the next deployment.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.REVALIDATE_TOKEN;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = url.searchParams.get("path") ?? "/";
  console.info(`Revalidate requested for ${path}`);

  return NextResponse.json({ revalidated: true, path });
}
