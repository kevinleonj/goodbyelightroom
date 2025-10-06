import Link from "next/link";

/**
 * Footer duplicates social links and provides a back-to-top shortcut.
 */
export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-neutral-950/95 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 text-sm text-neutral-400 sm:flex-row sm:justify-between sm:px-10">
        <nav className="flex items-center gap-6">
          <SocialLink href="https://www.linkedin.com/in/kevinjouvin" label="LinkedIn" />
          <SocialLink href="https://www.instagram.com/kevinleonjouvin" label="Instagram" />
          <SocialLink href="https://open.spotify.com/user/kevinleonjouvin" label="Spotify" />
        </nav>
        <Link href="#top" className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-wide">
          Back to Top
        </Link>
      </div>
    </footer>
  );
}

interface SocialLinkProps {
  href: string;
  label: string;
}

function SocialLink({ href, label }: SocialLinkProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="transition-colors hover:text-white"
    >
      {label}
    </Link>
  );
}
