import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  filename: z.string().min(3)
});

/**
 * POST /api/signed-upload
 * Calls Cloudflare Images to create a direct upload URL.
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.UPLOAD_API_TOKEN;
    const accessEmail = request.headers.get("cf-access-authenticated-user-email");

    const hasServiceToken = expectedToken && authHeader === `Bearer ${expectedToken}`;
    const hasAccessSession = Boolean(accessEmail);

    if (!hasServiceToken && !hasAccessSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { filename } = requestSchema.parse(json);

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_IMAGES_TOKEN;

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: "Missing Cloudflare configuration." },
        { status: 500 }
      );
    }

    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        metadata: { filename },
        requireSignedURLs: false
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json(
        { error: "Cloudflare Images request failed", details: errorBody },
        { status: 502 }
      );
    }

    const data = await response.json();
    const uploadURL = data.result?.uploadURL;
    const cf_image_id = data.result?.id;

    if (!uploadURL || !cf_image_id) {
      return NextResponse.json(
        { error: "Incomplete response from Cloudflare Images." },
        { status: 502 }
      );
    }

    return NextResponse.json({ uploadURL, cf_image_id });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
