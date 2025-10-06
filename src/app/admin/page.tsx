import { UploadForm } from "@/components/UploadForm";
import { getPublishedAlbums } from "@/lib/data";

export const metadata = {
  title: "Upload",
  description: "Upload new photos securely with Cloudflare Access and responsive delivery."
};

export default function AdminPage() {
  const albums = getPublishedAlbums();

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold text-white">Upload photos</h1>
        <p className="max-w-2xl text-neutral-300">
          This private area is protected by Cloudflare Access. Uploads are validated for file size, format, and metadata before
          the images become visible on the public site.
        </p>
      </header>
      <UploadForm albums={albums} />
    </section>
  );
}
