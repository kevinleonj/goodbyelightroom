"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

/**
 * Header renders the sticky top navigation with helpful comments for non-technical readers.
 */
export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-white transition-transform hover:scale-95"
        >
          lrcat
        </Link>
        <nav className="flex items-center gap-6 text-sm uppercase tracking-wide text-neutral-300">
          <Link
            href="https://outlook.office.com/calendar/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-200 hover:text-brand-100"
          >
            bookings
          </Link>
          <HeaderLink href="https://www.linkedin.com/in/kevinjouvin" label="LinkedIn" currentPath={pathname} />
          <HeaderLink href="https://www.instagram.com/kevinleonjouvin" label="Instagram" currentPath={pathname} />
          <HeaderLink href="https://open.spotify.com/user/kevinleonjouvin" label="Spotify" currentPath={pathname} />
        </nav>
      </div>
    </header>
  );
}

interface HeaderLinkProps {
  href: string;
  label: string;
  currentPath: string | null;
}

function HeaderLink({ href, label, currentPath }: HeaderLinkProps) {
  const isActive = currentPath === href;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx("transition-colors", isActive ? "text-brand-100" : "hover:text-white")}
    >
      {label}
    </Link>
  );
}
