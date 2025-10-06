import Link from "next/link";
import { AlbumList } from "@/components/AlbumList";
import { getPublishedAlbums } from "@/lib/data";

export default function HomePage() {
  const albums = getPublishedAlbums();

  return (
    <section className="space-y-12">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.4em] text-brand-200">kevin leon jouvin</p>
        <h1 className="text-4xl font-semibold text-white sm:text-6xl">it ain’t much, but it’s honest work</h1>
        <p className="max-w-2xl text-lg text-neutral-300">
          These albums are generated statically so the site is blazingly fast.
          Tap an album below or jump straight to the communities where I share music and ideas.
        </p>
      </div>

      <AlbumList albums={albums} />

      <div className="flex flex-wrap gap-4 text-sm text-neutral-300">
        <Link href="https://www.linkedin.com/in/kevinjouvin" className="rounded-full border border-white/10 px-4 py-2">
          LinkedIn
        </Link>
        <Link href="https://www.instagram.com/kevinleonjouvin" className="rounded-full border border-white/10 px-4 py-2">
          Instagram
        </Link>
        <Link href="https://open.spotify.com/user/kevinleonjouvin" className="rounded-full border border-white/10 px-4 py-2">
          Spotify
        </Link>
      </div>
    </section>
  );
}
