import { MetadataRoute } from "next";
import { getPublishedAlbums } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kevinleonjouvin.com";

  const albumEntries = getPublishedAlbums().map((album) => ({
    url: `${baseUrl}/${album.slug}`,
    lastModified: new Date(album.created_at)
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date()
    },
    ...albumEntries
  ];
}
