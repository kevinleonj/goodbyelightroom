import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MasonryGrid } from "@/components/MasonryGrid";
import { getAlbumBySlug, getPublishedAlbums, getPublishedPhotosByAlbum } from "@/lib/data";

interface AlbumPageProps {
  params: { album: string };
}

export async function generateStaticParams() {
  return getPublishedAlbums().map((album) => ({ album: album.slug }));
}

export function generateMetadata({ params }: AlbumPageProps): Metadata {
  const album = getAlbumBySlug(params.album);

  if (!album) {
    return {
      title: "Album not found"
    };
  }

  return {
    title: album.title,
    description: album.subtitle ?? undefined,
    openGraph: {
      title: album.title,
      description: album.subtitle ?? undefined
    }
  };
}

export default function GalleryPage({ params }: AlbumPageProps) {
  const album = getAlbumBySlug(params.album);

  if (!album) {
    notFound();
  }

  const photos = getPublishedPhotosByAlbum(album.slug);

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">{album.title}</h1>
        {album.subtitle ? <p className="max-w-2xl text-neutral-300">{album.subtitle}</p> : null}
      </header>
      {photos.length > 0 ? (
        <MasonryGrid photos={photos} />
      ) : (
        <p className="rounded-lg border border-dashed border-white/10 bg-neutral-900/60 p-8 text-neutral-400">
          No photos published yet. Use the admin area or CLI uploader to add some.
        </p>
      )}
    </section>
  );
}
