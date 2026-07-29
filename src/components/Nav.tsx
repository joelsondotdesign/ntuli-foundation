"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  // The static site marks the current page's nav link with class="active"
  // (main.css: `.nav-links a.active`). Home has no active link.
  const active = (href: string) => (pathname === href ? "active" : undefined);

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link className="nav-logo" href="/" aria-label="The Ntuli Foundation — home">
          <img src="/assets/img/logo.png" alt="The Ntuli Foundation" />
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link href="/what-we-do" className={active("/what-we-do")}>What we do</Link>
          <Link href="/our-team" className={active("/our-team")}>Our team</Link>
          <Link href="/studio" className={active("/studio")}>Studio</Link>
          <Link href="/archive" className={active("/archive")}>Archive</Link>
          <Link href="/news" className={active("/news")}>News</Link>
        </nav>
        <Link className="btn btn-outline" href="/studio">Visit the studio</Link>
        <button className="nav-toggle" data-nav-toggle type="button" aria-label="Menu" aria-expanded="false">
          <svg className="ic-burger" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <svg className="ic-close" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </header>
  );
}
