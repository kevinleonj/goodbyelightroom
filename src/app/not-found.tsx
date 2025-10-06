import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="flex min-h-[40vh] flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-4xl font-semibold text-white">Page not found</h1>
      <p className="max-w-md text-neutral-300">
        The page you are looking for does not exist. Use the button below to return home and explore the latest albums.
      </p>
      <Link href="/" className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white">
        Back home
      </Link>
    </section>
  );
}
