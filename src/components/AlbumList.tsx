import Link from "next/link";
import type { Album } from "@/lib/types";

interface AlbumListProps {
  albums: Album[];
}

/**
 * AlbumList renders navigational cards for each album.
 */
export function AlbumList({ albums }: AlbumListProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {albums.map((album) => (
        <Link
          key={album.slug}
          href={`/${album.slug}`}
          className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition-transform hover:-translate-y-1 hover:border-brand-300 hover:bg-brand-500/10"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">{album.title}</h2>
            <span className="text-xs uppercase tracking-widest text-brand-200">enter</span>
          </div>
          {album.subtitle ? (
            <p className="text-sm text-neutral-300">{album.subtitle}</p>
          ) : (
            <p className="text-sm text-neutral-400">New story coming soon.</p>
          )}
        </Link>
      ))}
    </div>
  );
}
