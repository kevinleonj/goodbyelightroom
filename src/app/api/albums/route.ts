import { NextResponse } from "next/server";
import { getPublishedAlbums } from "@/lib/data";

export async function GET() {
  return NextResponse.json(getPublishedAlbums());
}
