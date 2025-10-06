import albums from "@/lib/albums.json" assert { type: "json" };
import photos from "@/lib/photos.json" assert { type: "json" };
import { Album, Photo } from "@/lib/types";

/**
 * Returns the published albums sorted by the custom order field.
 * In production this data will come from Cloudflare D1, but the JSON keeps
 * the repository self-contained and easy to seed.
 */
export function getPublishedAlbums(): Album[] {
  return [...(albums as Album[])].filter((album) => album.published).sort((a, b) => a.order - b.order);
}

/**
 * Finds a single album by its slug.
 */
export function getAlbumBySlug(slug: string): Album | undefined {
  return (albums as Album[]).find((album) => album.slug === slug && album.published);
}

/**
 * Returns all published photos for a given album.
 * These are pre-filtered for safety, so unpublished images never leak.
 */
export function getPublishedPhotosByAlbum(slug: string): Photo[] {
  return (photos as Photo[])
    .filter((photo) => photo.album_slug === slug && photo.published)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
