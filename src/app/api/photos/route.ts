import { NextResponse } from "next/server";
import { z } from "zod";

const payloadSchema = z.object({
  album_slug: z.string().min(1),
  cf_image_id: z.string().min(1),
  alt: z.string().max(160).optional().nullable(),
  exif: z
    .object({
      make: z.string().optional().nullable(),
      model: z.string().optional().nullable(),
      lens: z.string().optional().nullable(),
      iso: z.number().optional().nullable(),
      fnumber: z.number().optional().nullable(),
      exposure_time: z.string().optional().nullable(),
      focal_length: z.number().optional().nullable(),
      date_original: z.string().optional().nullable(),
      gps_lat: z.number().optional().nullable(),
      gps_lon: z.number().optional().nullable()
    })
    .optional()
    .nullable(),
  width: z.number().optional(),
  height: z.number().optional(),
  tags: z.array(z.string()).optional(),
  filename_original: z.string().optional(),
  published: z.boolean().default(true)
});

/**
 * POST /api/photos
 * Persists metadata to Cloudflare D1 (simulated here) and triggers revalidation.
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
    const payload = payloadSchema.parse(json);

    // Placeholder: integrate with Cloudflare D1 using bindings in production.
    console.info("Photo metadata received", payload);

    // Trigger revalidation so the static album updates promptly.
    const revalidateResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/revalidate?path=/${payload.album_slug}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.REVALIDATE_TOKEN ?? "dev-token"}`
      }
    }).catch((error) => {
      console.warn("Revalidate request failed", error);
      return null;
    });

    if (revalidateResponse && !revalidateResponse.ok) {
      console.warn("Revalidate endpoint returned", revalidateResponse.status);
    }

    return NextResponse.json({ photo_id: crypto.randomUUID() }, { status: 201 });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
