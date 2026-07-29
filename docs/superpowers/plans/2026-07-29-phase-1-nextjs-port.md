# Phase 1 — Next.js Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the six hand-written HTML pages into a Next.js app that is visually and behaviourally indistinguishable from the static site at this repo's current HEAD, with no CMS involved.

**Baseline note:** the deployed site at `ntulifoundation.org` is stale and is **not** the reference. Task 1 pins a git worktree of the pre-port HTML at `/tmp/ntuli-baseline`, served on port 3200; that is what every comparison in this plan measures against.

**Architecture:** Next.js 16 App Router, TypeScript, static generation. The existing `main.css`, fonts and images move to `public/assets/` at their current paths and are linked with plain `<link>` tags — never imported through the bundler, never rewritten. Markup becomes JSX with identical class names and DOM structure. `main.js` and `archive.js` are ported into client components so their listeners bind on mount and clean up on unmount.

**Tech Stack:** Next.js 16.2.x · React 19 · TypeScript · GSAP 3 (npm, replacing the CDN script tags)

## Global Constraints

- **`public/assets/css/main.css` is byte-identical to today's `assets/css/main.css`, except for the one sanctioned change in Task 3.** No other CSS edit is permitted in Phase 1. No Tailwind, no CSS modules, no styling libraries.
- **Class names and DOM structure are preserved exactly.** If the current HTML has `<div class="event-row reveal">`, the JSX has `<div className="event-row reveal">` — same element, same classes, same nesting, same order.
- **Asset paths do not change.** `assets/img/logo.png` is served at `/assets/img/logo.png`.
- **Use plain `<img>`, not `next/image`.** `next/image` changes the emitted DOM and would break the CSS. Phase 3 may revisit this for CMS media only.
- **No content changes.** Copy, headings and data are transcribed verbatim, including the currently-hidden events section and the placeholder social URLs.
- **Every page is statically generated.** Nothing may call `headers()`, `cookies()`, or `searchParams` in a way that opts a route out of static rendering.
- Node `>=20.9.0`. Next `>=16.2.6 <17.0.0` (required by `@payloadcms/next@3.86.0`, which Phase 2 installs — do not upgrade past Next 16).
- Site origin is `https://www.ntulifoundation.org`.
- Language is `en-ZA`. British/South African spelling throughout.

---

## File Structure

| File | Responsibility |
|---|---|
| `.gitignore` | **Created first.** Excludes `node_modules`, `.next`, `.env*` |
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript config with `@/*` → `src/*` alias |
| `next.config.ts` | 301 redirects from old `.html` URLs |
| `src/lib/site.ts` | Site-wide constants (origin, name) used by metadata |
| `src/app/layout.tsx` | `<html>`/`<body>`, stylesheet links, pre-paint theme script, default metadata |
| `src/app/page.tsx` | Home |
| `src/app/what-we-do/page.tsx` | What we do — both pinned GSAP sequences live here |
| `src/app/our-team/page.tsx` | Our team |
| `src/app/studio/page.tsx` | Studio |
| `src/app/news/page.tsx` | News |
| `src/app/archive/page.tsx` | Archive — server-rendered shell |
| `src/app/not-found.tsx` | 404 |
| `src/components/Nav.tsx` | Header. One copy, replacing six |
| `src/components/Footer.tsx` | Footer. One copy, replacing six |
| `src/components/SiteChrome.tsx` | Nav + children + Footer + loader + cookie notice; carries the per-page nav-background variant |
| `src/components/SiteScripts.tsx` | Client. Port of `main.js` |
| `src/components/ArchiveGrid.tsx` | Client. Port of `archive.js` grid, filters and overlay |
| `src/data/archive.ts` | Typed archive entries. Phase 3 replaces the data source, keeping the type |
| `public/assets/**` | Moved verbatim from `assets/**` |
| `scripts/smoke.mjs` | Builds, starts, asserts every route and redirect |

**Deviation from the spec, deliberate:** the spec assigns redirects and the 404 page to Phase 4. They are included here (Task 10) because a "complete" Phase 1 in which `/what-we-do.html` returns a 404 is not independently shippable, and both are pure routing work that belongs with the page ports.

---

### Task 1: Repo safety and Next.js scaffold

**Files:**
- Create: `.gitignore`, `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`
- Move: `assets/` → `public/assets/`

**Interfaces:**
- Consumes: nothing
- Produces: a running Next.js app; `npm run dev`, `npm run build`, `npm start` scripts; `@/*` import alias resolving to `src/*`

- [ ] **Step 1: Create `.gitignore` before anything else**

This repo currently has no `.gitignore`, and Phase 2 introduces a database URL. Nothing else in this task may happen first.

```gitignore
node_modules/
.next/
out/
build/
.env
.env.*
!.env.example
.DS_Store
*.pem
npm-debug.log*
next-env.d.ts
.vercel
```

- [ ] **Step 2: Verify the ignore rules actually work**

```bash
printf 'DATABASE_URL=leaked\n' > .env
git status --porcelain | grep -q '\.env' && echo "FAIL: .env is tracked" || echo "PASS: .env ignored"
rm .env
```

Expected: `PASS: .env ignored`

- [ ] **Step 3: Commit the ignore rules on their own**

```bash
git add .gitignore
git commit -m "Add .gitignore before introducing any credentials"
```

- [ ] **Step 4: Create `package.json`**

```json
{
  "name": "ntuli-foundation",
  "version": "1.0.0",
  "private": true,
  "engines": { "node": ">=20.9.0" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "smoke": "node scripts/smoke.mjs"
  },
  "dependencies": {
    "next": "^16.2.12",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "gsap": "^3.12.5"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "typescript": "^5.7.0"
  }
}
```

`gsap` is pinned to the same major the CDN tags currently load (`3.12.5`), so behaviour is unchanged.

- [ ] **Step 5: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 6: Create a minimal `next.config.ts`**

Redirects are added in Task 10. This is the placeholder-free minimum that makes the build run.

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 7: Move the assets, preserving git history**

```bash
mkdir -p public
git mv assets public/assets
ls public/assets
```

Expected: `css  fonts  img  js  og`

- [ ] **Step 8: Move the root-level static files Next serves from `public/`**

```bash
git mv apple-touch-icon.png public/apple-touch-icon.png
git mv site.webmanifest public/site.webmanifest
```

- [ ] **Step 9: Create a temporary root layout so the build has an entry point**

This is replaced wholesale in Task 2. It exists only so this task ends on a green build.

```tsx
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 10: Create a temporary home page**

```tsx
// src/app/page.tsx
export default function Home() {
  return <p data-scaffold-ok>Scaffold running</p>;
}
```

- [ ] **Step 11: Install and build**

```bash
npm install
npm run build
```

Expected: build completes; output lists route `/` as static.

- [ ] **Step 12: Confirm the CSS is reachable at its original path**

```bash
npm start & SERVER=$!
sleep 4
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/assets/css/main.css
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/assets/img/logo.png
kill $SERVER
```

Expected: `200` twice. If either is not 200, the asset move is wrong — fix before continuing.

- [ ] **Step 13: Stand up the comparison baseline**

**Do not compare against `https://www.ntulifoundation.org`.** The deployed site is stale — it
predates commits `f5b013b` and `4be8779`, so it still shows the events section, has no footer
social icons, spells the wordmark `UbuSuSu`, and lists three placeholder videos instead of four
real ones. Comparing against it would surface four intended differences as if they were port
defects.

The correct baseline is this repo's static HTML at the commit before the port began. Task 10
deletes those files, so pin a worktree to them now:

```bash
git worktree add --detach /tmp/ntuli-baseline HEAD
ls /tmp/ntuli-baseline/*.html | wc -l
```

Expected: `6`

Serve it whenever a comparison step calls for `localhost:3200`:

```bash
python3 -m http.server 3200 -d /tmp/ntuli-baseline > /dev/null 2>&1 &
BASELINE=$!
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3200/index.html
```

Expected: `200`. Stop it with `kill $BASELINE` when done.

The worktree is removed in Task 11 once verification is complete.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "Scaffold Next.js app and move assets to public/"
```

---

### Task 2: Root layout

**Files:**
- Modify: `src/app/layout.tsx` (replaces the Task 1 placeholder entirely)
- Create: `src/lib/site.ts`

**Interfaces:**
- Consumes: `public/assets/css/main.css`, `public/assets/css/fonts.css`
- Produces: `SITE` constant `{ origin: string; name: string }` from `@/lib/site`; a root layout that renders `<html lang="en-ZA" className="loading">` and the three stylesheet links

**Context an implementer needs:** the current pages carry an inline script in `<head>` that reads `localStorage` and sets `data-theme="dark"` on `<html>` *before first paint*, so dark mode does not flash. It must stay inline and stay in `<head>` — moving it to a component or deferring it reintroduces the flash. `class="loading"` on `<html>` drives `html.loading { overflow: hidden }` at `main.css:704` and is removed by the ported `main.js` in Task 4.

- [ ] **Step 1: Create the site constants**

```ts
// src/lib/site.ts
export const SITE = {
  origin: "https://www.ntulifoundation.org",
  name: "Ntuli Foundation",
} as const;
```

- [ ] **Step 2: Write the root layout**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { SITE } from "@/lib/site";

const THEME_SCRIPT = `try{var t=localStorage.getItem("ntuli-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.setAttribute("data-theme","dark");}catch(e){}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.origin),
  robots: { index: true, follow: true, "max-image-preview": "large" },
  authors: [{ name: SITE.name }],
  icons: {
    icon: "/assets/img/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: { siteName: SITE.name, locale: "en_ZA", type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport = { themeColor: "#2B2926" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" className="loading">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
        <link rel="preconnect" href="https://p.typekit.net" crossOrigin="" />
        <link rel="stylesheet" href="https://use.typekit.net/kew7yxz.css" />
        <link rel="stylesheet" href="/assets/css/fonts.css" />
        <link rel="stylesheet" href="/assets/css/main.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Verify the theme script is inline in `<head>` and unescaped**

```bash
npm run build
npm start & SERVER=$!
sleep 4
curl -s http://localhost:3000/ | grep -o 'ntuli-theme' | head -1
curl -s http://localhost:3000/ | grep -c 'assets/css/main.css'
kill $SERVER
```

Expected: prints `ntuli-theme`, then `1`. If `ntuli-theme` does not appear, the script was not inlined and dark mode will flash.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Root layout with pre-paint theme script and stylesheet links"
```

---

### Task 3: Nav, Footer and SiteChrome

**Files:**
- Create: `src/components/Nav.tsx`, `src/components/Footer.tsx`, `src/components/SiteChrome.tsx`
- Modify: `public/assets/css/main.css:133-134` — **the only sanctioned CSS change in Phase 1**

**Interfaces:**
- Consumes: `SITE` from `@/lib/site`
- Produces:
  - `<Nav />` — no props
  - `<Footer />` — no props
  - `<SiteChrome variant?: "tinted" | "bone">` — wraps page content with nav, footer, loader and cookie notice

**The CSS change and why it is necessary.** Today the nav's resting background is set by a class on `<body>`, which differs per page:

```css
body.hero-tinted { --nav-rest-bg: var(--bone-soft); }
body.hero-bone   { --nav-rest-bg: var(--bone); }
```

`index.html` has no class, `news.html` has `hero-bone`, the other four have `hero-tinted`. In the App Router `<body>` lives in the root layout and cannot vary per page without calling `headers()`, which would opt every route out of static generation — breaking the architecture. Since these rules only set a custom property, dropping `body` from the selector lets the same property be set on a wrapper `<div>` that sits *above* `.nav` in the tree, so it still inherits. Two words removed; no declaration altered.

- [ ] **Step 1: Make the CSS change**

Replace lines 133–134 of `public/assets/css/main.css`:

```css
.hero-tinted { --nav-rest-bg: var(--bone-soft); }
.hero-bone { --nav-rest-bg: var(--bone); }
```

- [ ] **Step 2: Confirm nothing else in the codebase depended on the `body` prefix**

```bash
grep -rn "hero-tinted\|hero-bone" public/assets/css/ src/ 2>/dev/null
```

Expected: only the two lines just edited. Any other hit must be reconciled before continuing.

- [ ] **Step 3: Write `Nav.tsx`**

Transcribed from `index.html:109-127`. Note `nav-logo` links to `/`, not `index.html`.

```tsx
// src/components/Nav.tsx
import Link from "next/link";

export default function Nav() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link className="nav-logo" href="/" aria-label="The Ntuli Foundation — home">
          <img src="/assets/img/logo.png" alt="The Ntuli Foundation" />
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link href="/what-we-do">What we do</Link>
          <Link href="/our-team">Our team</Link>
          <Link href="/studio">Studio</Link>
          <Link href="/archive">Archive</Link>
          <Link href="/news">News</Link>
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
```

- [ ] **Step 4: Write `Footer.tsx`**

Transcribed from `index.html:327-360`, which is byte-identical across all six pages. Keep the four social links exactly as committed, placeholder handles included — replacing them is Phase 3 work, not this task's.

```tsx
// src/components/Footer.tsx
const SOCIAL_SVG_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="cols">
          <div className="brand">
            <img src="/assets/img/logo-light.png" alt="The Ntuli Foundation" />
            <p>A South African cultural institution grounded in the life, work, and philosophy of Prof Pitika Ntuli.</p>
            <div className="social">
              <a href="https://www.facebook.com/ntulifoundation" target="_blank" rel="noopener" aria-label="The Ntuli Foundation on Facebook">
                <svg {...SOCIAL_SVG_PROPS}>
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/company/ntulifoundation" target="_blank" rel="noopener" aria-label="The Ntuli Foundation on LinkedIn">
                <svg {...SOCIAL_SVG_PROPS}>
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a href="https://x.com/ntulifoundation" target="_blank" rel="noopener" aria-label="The Ntuli Foundation on X">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/ntulifoundation" target="_blank" rel="noopener" aria-label="The Ntuli Foundation on Instagram">
                <svg {...SOCIAL_SVG_PROPS}>
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <div className="k">Contact</div>
            <ul>
              <li><a href="mailto:info@ntulifoundation.org">info@ntulifoundation.org</a></li>
              <li><a href="tel:+27834593423">+27 83 459 3423</a></li>
            </ul>
          </div>
          <div>
            <div className="k">Visit</div>
            <ul>
              <li>146 10th Road, Kew</li>
              <li>Johannesburg, South Africa</li>
            </ul>
          </div>
          <div>
            <div className="k">Newsletter</div>
            <ul><li>Letters from the threshold</li></ul>
            <a className="subscribe" href="mailto:info@ntulifoundation.org?subject=Subscribe">
              Subscribe <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <div className="bottom">
          <span>© 2026 The Ntuli Foundation. All rights reserved.</span>
          <div className="bottom-right">
            <span className="motto">I am because we are.</span>
            <button className="theme-toggle" data-theme-toggle type="button" aria-label="Switch between light and dark mode">
              <svg className="moon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <svg className="sun" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Write `SiteChrome.tsx`**

The loader and cookie notice are transcribed from `index.html:107` and `index.html:361-368`; both appear identically on all six pages.

```tsx
// src/components/SiteChrome.tsx
import Nav from "./Nav";
import Footer from "./Footer";

export default function SiteChrome({
  variant,
  children,
}: {
  variant?: "tinted" | "bone";
  children: React.ReactNode;
}) {
  const variantClass = variant === "tinted" ? "hero-tinted" : variant === "bone" ? "hero-bone" : undefined;

  return (
    <div className={variantClass}>
      <div className="loader" aria-hidden="true"><div className="arch-mark" /></div>
      <Nav />
      {children}
      <Footer />
      <aside className="cookie" role="region" aria-label="Cookie notice">
        <p>We use a small number of cookies to understand how the site is used. Nothing is sold, and nothing is shared with advertisers.</p>
        <div className="cookie-actions">
          <button className="decline" data-choice="declined" type="button">Decline</button>
          <button className="accept" data-choice="accepted" type="button">Accept</button>
        </div>
      </aside>
    </div>
  );
}
```

Task 4 adds the `SiteScripts` import and element to this file. This task must end with `npm run typecheck` and `npm run build` both green on their own.

- [ ] **Step 6: Verify the build is green**

```bash
npm run typecheck && npm run build
```

Expected: both succeed. Nothing renders `SiteChrome` yet — that starts in Task 5.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Shared Nav, Footer and SiteChrome components"
```

---

### Task 4: SiteScripts — the `main.js` port

**Files:**
- Create: `src/components/SiteScripts.tsx`
- Modify: `src/components/SiteChrome.tsx` — add the import and render `<SiteScripts />` as the last child of the wrapper div
- Reference: `public/assets/js/main.js` (deleted in Task 10, kept until then for line-by-line comparison)

**Interfaces:**
- Consumes: `SiteChrome` from Task 3
- Produces: `<SiteScripts />` — no props, client component, rendered once by `SiteChrome`

**What this must reproduce, from `main.js`:** sticky nav (`is-stuck` past 24px), mobile menu toggle, theme toggle writing `localStorage["ntuli-theme"]`, cookie notice with `localStorage["ntuli-cookie-choice"]` and a 1600ms delay, first-load-only loader via `sessionStorage["ntuli-visited"]`, IntersectionObserver reveals at `threshold: 0.12` where anything above `innerHeight * 0.95` shows instantly, the two pinned GSAP timelines, and the reduced-motion fallback.

**The two behavioural changes, both required by the port:**

1. **Every listener and ScrollTrigger is torn down on unmount.** The original binds once on a full page load; under client-side navigation, stale observers and pinned triggers from the previous page would leak and corrupt scroll positions.
2. **`ScrollTrigger.refresh()` runs once fonts and images have settled.** The original relies on the browser having finished layout before the script runs. Pinned triggers measure element positions at creation time, and if webfonts swap in afterwards the pin start/end are wrong. This is the known risk called out in the spec.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SiteScripts() {
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];

    /* ---------- sticky nav ---------- */
    const nav = document.querySelector(".nav");
    if (nav) {
      const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 24);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }

    /* ---------- mobile menu ---------- */
    const navToggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
    const navLinks = document.querySelector(".nav-links");
    if (navToggle && navLinks) {
      const onToggle = () => {
        const open = navLinks.classList.toggle("is-open");
        navToggle.classList.toggle("is-open", open);
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      };
      navToggle.addEventListener("click", onToggle);
      cleanups.push(() => navToggle.removeEventListener("click", onToggle));
    }

    /* ---------- theme ---------- */
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      const onClick = () => {
        const wasDark = document.documentElement.getAttribute("data-theme") === "dark";
        if (wasDark) document.documentElement.removeAttribute("data-theme");
        else document.documentElement.setAttribute("data-theme", "dark");
        try {
          localStorage.setItem("ntuli-theme", wasDark ? "light" : "dark");
        } catch {}
      };
      btn.addEventListener("click", onClick);
      cleanups.push(() => btn.removeEventListener("click", onClick));
    });

    /* ---------- cookie notice ---------- */
    const cookie = document.querySelector(".cookie");
    if (cookie) {
      if (localStorage.getItem("ntuli-cookie-choice")) {
        cookie.remove();
      } else {
        const showTimer = window.setTimeout(() => cookie.classList.add("is-in"), 1600);
        cleanups.push(() => window.clearTimeout(showTimer));

        const onCookieClick = (e: Event) => {
          const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-choice]");
          if (!btn) return;
          localStorage.setItem("ntuli-cookie-choice", btn.dataset.choice!);
          cookie.classList.remove("is-in");
          window.setTimeout(() => cookie.remove(), 700);
        };
        cookie.addEventListener("click", onCookieClick);
        cleanups.push(() => cookie.removeEventListener("click", onCookieClick));
      }
    }

    /* ---------- first-load-only loader ---------- */
    const loader = document.querySelector(".loader");
    if (loader) {
      const seen = sessionStorage.getItem("ntuli-visited");
      if (seen || reducedMotion) {
        loader.remove();
        document.documentElement.classList.remove("loading");
      } else {
        sessionStorage.setItem("ntuli-visited", "1");
        const finish = () => {
          window.setTimeout(() => {
            loader.classList.add("is-done");
            document.documentElement.classList.remove("loading");
            window.setTimeout(() => loader.remove(), 800);
          }, 900);
        };
        if (document.readyState === "complete") finish();
        else {
          window.addEventListener("load", finish);
          cleanups.push(() => window.removeEventListener("load", finish));
        }
      }
    }

    /* ---------- reveal on scroll ---------- */
    const revealEls = document.querySelectorAll(".reveal");
    if (revealEls.length && "IntersectionObserver" in window && !reducedMotion) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 },
      );
      revealEls.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.95) el.classList.add("is-in");
        else io.observe(el);
      });
      cleanups.push(() => io.disconnect());
    } else {
      revealEls.forEach((el) => el.classList.add("is-in"));
    }

    /* ---------- pinned sequences ---------- */
    const ctx = gsap.context(() => {
      const portal = document.querySelector(".portal-section");
      if (portal && !reducedMotion) {
        const archLeft = portal.querySelector(".arch--left");
        const archCenter = portal.querySelector(".arch--center");
        const archRight = portal.querySelector(".arch--right");
        const labels = portal.querySelectorAll(".arch-label");
        const wordmark = portal.querySelector(".portal-wordmark");
        const ochreOverlay = portal.querySelector(".arch-ochre-overlay");

        gsap.set(archLeft, { xPercent: -50, x: -252 });
        gsap.set(archRight, { xPercent: -50, x: 252 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: portal, start: "top top", end: "+=1600", pin: true, scrub: 0.6, anticipatePin: 1 },
        });

        tl.to(archLeft, { x: 0, ease: "none", duration: 1 }, 0)
          .to(archRight, { x: 0, ease: "none", duration: 1 }, 0)
          .to(ochreOverlay, { opacity: 1, ease: "none", duration: 0.5 }, 0.25)
          .to(labels, { opacity: 0.25, ease: "none", duration: 0.5 }, 0.15)
          .to(labels, { opacity: 0, ease: "none", duration: 0.3 }, 0.7)
          .to([archLeft, archRight], { opacity: 0, ease: "none", duration: 0.25 }, 0.8)
          .to(archCenter, { scale: 1.12, transformOrigin: "50% 100%", ease: "none", duration: 0.4 }, 0.75)
          .fromTo(wordmark, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, ease: "none", duration: 0.45 }, 0.72);
      }

      const commitments = document.querySelector(".commitments");
      if (commitments && !reducedMotion) {
        const rows = commitments.querySelectorAll(".commit-row");
        const ctl = gsap.timeline({
          scrollTrigger: { trigger: commitments, start: "top top", end: "+=" + rows.length * 280, pin: true, scrub: 0.6, anticipatePin: 1 },
        });
        rows.forEach((row, i) => {
          ctl.to(row, { opacity: 1, ease: "none", duration: 0.8 }, i);
          if (i > 0) ctl.to(rows[i - 1], { opacity: 0.28, ease: "none", duration: 0.8 }, i);
        });
      }
    });
    cleanups.push(() => ctx.revert());

    /* Pinned triggers measure at creation; webfonts and images settle later. */
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);
    cleanups.push(() => window.removeEventListener("load", refresh));

    /* ---------- reduced motion at rest ---------- */
    if (reducedMotion) {
      document.querySelectorAll<HTMLElement>(".commit-row").forEach((c) => (c.style.opacity = "1"));
      const wm = document.querySelector<HTMLElement>(".portal-wordmark");
      if (wm) wm.style.opacity = "1";
      const oo = document.querySelector<HTMLElement>(".arch-ochre-overlay");
      if (oo) oo.style.opacity = "1";
    }

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
```

- [ ] **Step 2: Wire it into `SiteChrome`**

Add the import alongside the existing `Nav` and `Footer` imports:

```tsx
import SiteScripts from "./SiteScripts";
```

and render it as the **last child of the wrapper div**, after the closing `</aside>` of the cookie notice:

```tsx
      </aside>
      <SiteScripts />
    </div>
```

- [ ] **Step 3: Typecheck and build**

```bash
npm run typecheck && npm run build
```

Expected: both succeed.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Port main.js into a SiteScripts client component"
```

---

### Task 5: Home page

**Files:**
- Create: `src/app/page.tsx` (replaces the Task 1 placeholder)
- Reference: `index.html`

**Interfaces:**
- Consumes: `SiteChrome` from `@/components/SiteChrome`
- Produces: static route `/`

**Transcription Procedure — referenced by Tasks 5, 6, 7, 8 and 9.** Apply these substitutions to the named source lines. They are mechanical and complete; apply them exactly and change nothing else.

| HTML | JSX |
|---|---|
| `class=` | `className=` |
| `for=` | `htmlFor=` |
| `tabindex=` | `tabIndex=` |
| `stroke-width` `stroke-linecap` `stroke-linejoin` | `strokeWidth` `strokeLinecap` `strokeLinejoin` |
| `fill-rule` `clip-rule` | `fillRule` `clipRule` |
| `<img src="assets/…">` | `<img src="/assets/…" />` — **leading slash**, self-closed |
| `<br>` `<meta>` `<link>` | `<br />` `<meta />` `<link />` |
| `style="width:100%"` | `style={{ width: "100%" }}` |
| `<!-- comment -->` | `{/* comment */}` |
| `&rarr;` `&middot;` `&amp;` | literal `→` `·` `&` |
| `href="what-we-do.html"` | `href="/what-we-do"` via `<Link>` |
| `aria-*`, `data-*` | unchanged |

Everything else — element order, nesting, class strings, text content — is copied verbatim.

- [ ] **Step 1: Transcribe the page**

Source: `index.html:129-326` (the `<main>` element and its contents).

Structure:

```tsx
// src/app/page.tsx
import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ntuli Foundation | Art, Philosophy & African Indigenous Knowledge",
  description:
    "The Ntuli Foundation advances African Indigenous Knowledge Systems through the art, poetry and philosophy of Prof Pitika Ntuli — a portal between past and future.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Ntuli Foundation | Art, Philosophy & African Indigenous Knowledge",
    description:
      "A living portal into African Indigenous Knowledge Systems — grounded in the sculpture, poetry and philosophy of Prof Pitika Ntuli.",
    url: "/",
    images: [{ url: "/assets/og/og-home.jpg", width: 1200, height: 630, alt: "The Ntuli Foundation portal mark — light passing through the reversed N" }],
  },
};

export default function Home() {
  return (
    <SiteChrome>
      <main>
        {/* Transcription Procedure → index.html:131-325 */}
      </main>
    </SiteChrome>
  );
}
```

**Preserve these three things specifically:**
- The events section keeps its `hidden` attribute and the comment explaining it: `<section className="events" id="events" hidden>`
- The hero's `<div className="container" style={{ width: "100%" }}>`
- The `scroll-badge` SVG including its `<defs>`, `<path id="badge-circle">` and `<textPath href="#badge-circle">`

- [ ] **Step 2: Add the JSON-LD structured data**

Source: `index.html:46-103`. This appears on the home page only. Keep `sameAs: []` empty — populating it is Phase 3 work, gated on the client supplying real handles.

Place immediately inside `<main>`:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "NGO",
          "@id": `${SITE.origin}/#organisation`,
          name: "Ntuli Foundation",
          url: `${SITE.origin}/`,
          logo: `${SITE.origin}/assets/img/logo.png`,
          description:
            "A South African cultural institution advancing African Indigenous Knowledge Systems through art, education and philosophy, founded on the work of Prof Pitika Ntuli.",
          foundingLocation: { "@type": "Country", name: "South Africa" },
          areaServed: "ZA",
          knowsAbout: [
            "African Indigenous Knowledge Systems",
            "South African sculpture",
            "African philosophy",
            "Cultural heritage",
            "Ubuntu",
          ],
          founder: { "@id": `${SITE.origin}/#pitika-ntuli` },
          sameAs: [],
        },
        {
          "@type": "Person",
          "@id": `${SITE.origin}/#pitika-ntuli`,
          name: "Pitika Ntuli",
          honorificPrefix: "Prof",
          jobTitle: "Sculptor, Poet, Philosopher, Educator",
          nationality: { "@type": "Country", name: "South Africa" },
          affiliation: { "@id": `${SITE.origin}/#organisation` },
          sameAs: ["https://en.wikipedia.org/wiki/Pitika_Ntuli"],
        },
        {
          "@type": "WebSite",
          "@id": `${SITE.origin}/#website`,
          url: `${SITE.origin}/`,
          name: "Ntuli Foundation",
          publisher: { "@id": `${SITE.origin}/#organisation` },
          inLanguage: "en-ZA",
        },
      ],
    }),
  }}
/>
```

- [ ] **Step 3: Compare against the live page**

```bash
npm run build
npm start & SERVER=$!
sleep 4
curl -s http://localhost:3000/ > /tmp/new-home.html
curl -s http://localhost:3200/index.html > /tmp/old-home.html
for c in hero-home hero-copy about focus programmes events latest news-row scroll-badge; do
  printf "%-14s old=%s new=%s\n" "$c" \
    "$(grep -o "class=\"[^\"]*$c" /tmp/old-home.html | wc -l)" \
    "$(grep -o "class=\"[^\"]*$c" /tmp/new-home.html | wc -l)"
done
kill $SERVER
```

Expected: every `old` and `new` count matches. A mismatch means a section was dropped or duplicated.

- [ ] **Step 4: Verify the events section is still hidden**

```bash
npm start & SERVER=$!
sleep 4
curl -s http://localhost:3000/ | grep -c 'id="events" hidden\|hidden.*id="events"'
kill $SERVER
```

Expected: `1`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Port the home page"
```

---

### Task 6: What we do page

**Files:**
- Create: `src/app/what-we-do/page.tsx`
- Reference: `what-we-do.html`

**Interfaces:**
- Consumes: `SiteChrome`
- Produces: static route `/what-we-do`

**This is the highest-risk page in the plan.** It carries both pinned GSAP sequences. The `.portal-section` and `.commitments` class names, and the descendants `.arch--left`, `.arch--center`, `.arch--right`, `.arch-label`, `.portal-wordmark`, `.arch-ochre-overlay` and `.commit-row`, are queried by `SiteScripts` — a renamed or restructured element silently disables the animation rather than throwing.

- [ ] **Step 1: Transcribe the page**

Source: `what-we-do.html` — the `<section class="page-hero">` through the end of `</main>`. Apply the Task 5 transcription rules. Use `variant="tinted"`, matching `body class="hero-tinted"`.

```tsx
// src/app/what-we-do/page.tsx
import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "What we do | Ntuli Foundation",
  description:
    "The UBuSuSu philosophy, six strategic commitments, and education programmes advancing African Indigenous Knowledge Systems.",
  alternates: { canonical: "/what-we-do" },
  openGraph: { title: "What we do | Ntuli Foundation", url: "/what-we-do" },
};

export default function WhatWeDo() {
  return (
    <SiteChrome variant="tinted">
      {/* Transcription Procedure → what-we-do.html, <section class="page-hero"> through </main> */}
    </SiteChrome>
  );
}
```

Keep `<div className="portal-wordmark">UBuSuSu</div>` with that exact capitalisation — it was corrected in commit `f5b013b`.

- [ ] **Step 2: Verify every element the animation queries exists exactly once**

```bash
npm run build
npm start & SERVER=$!
sleep 4
for sel in portal-section arch--left arch--center arch--right arch-label portal-wordmark arch-ochre-overlay commitments commit-row; do
  printf "%-20s %s\n" "$sel" "$(curl -s http://localhost:3000/what-we-do | grep -o "$sel" | wc -l)"
done
kill $SERVER
```

Expected, compared against the same command run on `http://localhost:3200/what-we-do.html`: identical counts. `commit-row` must be 6.

- [ ] **Step 3: Scroll both sequences by hand**

This cannot be automated meaningfully and must not be skipped.

```bash
npm run dev
```

Open `http://localhost:3000/what-we-do` and confirm:
1. The section pins — the page stops scrolling while the three arches converge
2. The ochre overlay fades in as they meet
3. The labels (Ubuntu / Sumud / Sunsum) fade out
4. `UBuSuSu` fades up as the centre arch scales
5. The section releases and normal scrolling resumes
6. Commitments pins and each of the six rows lights in turn, dimming the previous one
7. Both work in dark mode
8. With `prefers-reduced-motion: reduce` (DevTools → Rendering → Emulate CSS media), nothing pins and all rows and the wordmark are visible at full opacity
9. Navigate to `/news` and back — **the pin still works.** This is what the cleanup in Task 4 exists for; if it fails, `ctx.revert()` is not running

Compare side by side with the baseline at `http://localhost:3200/what-we-do.html`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Port the What we do page with both pinned sequences"
```

---

### Task 7: Our team and Studio pages

**Files:**
- Create: `src/app/our-team/page.tsx`, `src/app/studio/page.tsx`
- Reference: `our-team.html`, `studio.html`

**Interfaces:**
- Consumes: `SiteChrome`
- Produces: static routes `/our-team`, `/studio`

These two are static content with no page-specific JavaScript, which is why they share a task.

- [ ] **Step 1: Transcribe Our team**

Source: `our-team.html`, page-hero through `</main>`. Apply the Task 5 rules. `variant="tinted"`.

```tsx
// src/app/our-team/page.tsx
import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Our team | Ntuli Foundation",
  alternates: { canonical: "/our-team" },
};

export default function OurTeam() {
  return <SiteChrome variant="tinted">{/* Transcription Procedure → our-team.html, page-hero through </main> */}</SiteChrome>;
}
```

Copy the `description` and `og:description` values from `our-team.html:8` and its `og:description` meta tag verbatim.

- [ ] **Step 2: Transcribe Studio**

Source: `studio.html`, page-hero through `</main>`. `variant="tinted"`.

```tsx
// src/app/studio/page.tsx
import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "The studio | Ntuli Foundation",
  alternates: { canonical: "/studio" },
};

export default function Studio() {
  return <SiteChrome variant="tinted">{/* Transcription Procedure → studio.html, page-hero through </main> */}</SiteChrome>;
}
```

Copy `description` and `og:description` from `studio.html` verbatim.

- [ ] **Step 3: Verify both against the baseline**

```bash
npm run build
npm start & SERVER=$!
sleep 4
for p in our-team studio; do
  new=$(curl -s "http://localhost:3000/$p" | grep -o 'class="[^"]*"' | wc -l)
  old=$(curl -s "http://localhost:3200/$p.html" | grep -o 'class="[^"]*"' | wc -l)
  printf "%-10s old=%s new=%s\n" "$p" "$old" "$new"
done
kill $SERVER
```

Expected: counts within a few of each other. `new` will be slightly higher only if React emitted an extra wrapper — investigate any gap larger than 2.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Port the Our team and Studio pages"
```

---

### Task 8: News page

**Files:**
- Create: `src/app/news/page.tsx`
- Reference: `news.html`

**Interfaces:**
- Consumes: `SiteChrome`
- Produces: static route `/news`

`news.html` is the only page using `body class="hero-bone"` → `variant="bone"`.

- [ ] **Step 1: Transcribe the page**

Source: `news.html:68-113` — page-hero, the `featured` section, and the `earlier` section.

```tsx
// src/app/news/page.tsx
import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "News | Ntuli Foundation",
  description:
    "From the threshold: books, exhibitions and opinions from the Ntuli Foundation and the studio of Prof Pitika Ntuli.",
  alternates: { canonical: "/news" },
  openGraph: {
    title: "News | Ntuli Foundation",
    description:
      "Books, exhibitions and opinions from the Ntuli Foundation and the studio of Prof Pitika Ntuli.",
    url: "/news",
  },
};

export default function News() {
  return (
    <SiteChrome variant="bone">
      {/* Transcription Procedure → news.html:68-113 */}
    </SiteChrome>
  );
}
```

The three story URLs contain query strings and encoded entities. The SABC link in `news.html:103` contains `&amp;title=…` — in JSX this becomes a literal `&` inside a normal string attribute. Copy the URL exactly, decoding `&amp;` to `&`.

- [ ] **Step 2: Verify the nav background variant applies**

```bash
npm run build
npm start & SERVER=$!
sleep 4
curl -s http://localhost:3000/news | grep -c 'hero-bone'
curl -s http://localhost:3000/what-we-do | grep -c 'hero-tinted'
curl -s http://localhost:3000/ | grep -c 'hero-bone\|hero-tinted'
kill $SERVER
```

Expected: `1`, `1`, `0`. The home page must have neither.

- [ ] **Step 3: Verify all three outbound links survived intact**

```bash
npm start & SERVER=$!
sleep 4
curl -s http://localhost:3000/news | grep -o 'href="http[^"]*"' | sort
kill $SERVER
```

Expected: the Amazon, Melrose Gallery and SABC URLs, matching `news.html`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Port the News page"
```

---

### Task 9: Archive page and the `archive.js` port

**Files:**
- Create: `src/data/archive.ts`, `src/components/ArchiveGrid.tsx`, `src/app/archive/page.tsx`
- Reference: `public/assets/js/archive.js`, `archive.html`

**Interfaces:**
- Consumes: `SiteChrome`
- Produces:
  - `type ArchiveEntry` and `const ARCHIVE: ArchiveEntry[]` from `@/data/archive` — **Phase 3 replaces the array's source with a CMS query and keeps the type**
  - `<ArchiveGrid entries={ARCHIVE} />` — client component
  - static route `/archive`

**Why the grid stays a client component in Phase 1.** The spec requires the archive to be server-rendered for SEO — but that is Phase 3, once entries come from the CMS. Porting the existing client-side behaviour first keeps this task a like-for-like move with no behaviour change to review. The filter buttons, overlay, keyboard navigation and prev/next all carry over.

- [ ] **Step 1: Extract the data into a typed module**

Transcribe all seven entries from `assets/js/archive.js:21-110` verbatim.

```ts
// src/data/archive.ts
export type ArchiveEntry = {
  kind: "Video" | "Writing";
  title: string;
  meta?: string;
  image?: string;
  excerpt?: string;
  body?: string[];
  embed?: { provider: "youtube"; id: string; start?: number } | { provider: "instagram"; url: string };
  link?: { href: string; label: string };
  pdf?: string;
  placeholder?: boolean;
};

export const ARCHIVE: ArchiveEntry[] = [
  // transcribe assets/js/archive.js:22-109 verbatim, changing only
  // "assets/img/…" → "/assets/img/…"
];
```

- [ ] **Step 2: Verify the count and shape**

```bash
npx tsx -e "import('./src/data/archive.ts').then(m=>{console.log(m.ARCHIVE.length); console.log(m.ARCHIVE.filter(e=>e.kind==='Video').length); console.log(m.ARCHIVE.filter(e=>e.kind==='Writing').length)})" 2>/dev/null || npm run typecheck
```

Expected: `7`, `4`, `3`. If `tsx` is unavailable, `npm run typecheck` passing plus a manual count of seven entries is sufficient.

- [ ] **Step 3: Write the grid component**

Port `assets/js/archive.js:112-279`. The escaping helper `esc()` is dropped — React escapes by default.

**Read `archive.html:78-108` before writing this.** Three structural facts from it are easy to get wrong and both break the layout silently:

1. **The close button, both arrows and the counter are direct children of `.overlay`, siblings of `.overlay-panel` — not inside it.** `main.css:943` sets `.overlay-ctrl { position: absolute }`, which resolves against `.overlay` (`position: fixed`, `main.css:910`). Nesting them in the panel positions them against the wrong box.
2. **The filter buttons carry `class="filter-btn"` and the first is labelled `Everything`, not `All`.** `main.css:820` and `:833` style `.filter-btn` and `.filter-btn.is-active`.
3. **The close and arrow controls contain SVG icons**, not text characters.

`.overlay` is `position: fixed`, so rendering it from inside this component rather than at body level as the current HTML does is visually identical.

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ArchiveEntry } from "@/data/archive";

const PLAY_ICON = (
  <svg width="20" height="22" viewBox="0 0 20 22" fill="none" aria-hidden="true">
    <path d="M19 11 0 22V0l19 11Z" fill="#1E2126" />
  </svg>
);

type Filter = "all" | "Video" | "Writing";

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "Everything" },
  { value: "Video", label: "Video" },
  { value: "Writing", label: "Writing" },
];

export default function ArchiveGrid({ entries }: { entries: ArchiveEntry[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [current, setCurrent] = useState(-1);
  const closeRef = useRef<HTMLButtonElement>(null);

  const visible = filter === "all" ? entries : entries.filter((e) => e.kind === filter);
  const isOpen = current >= 0 && current < visible.length;
  const item = isOpen ? visible[current] : undefined;

  const close = useCallback(() => setCurrent(-1), []);
  const step = useCallback(
    (delta: number) =>
      setCurrent((c) => {
        const next = c + delta;
        return next >= 0 && next < visible.length ? next : c;
      }),
    [visible.length],
  );

  /* Scroll lock, and return focus to the card that opened the overlay.
     archive.js did this with an explicit querySelector on close(). */
  useEffect(() => {
    if (!isOpen) return;
    const trigger = document.activeElement as HTMLElement | null;
    document.body.classList.add("overlay-open");
    return () => {
      document.body.classList.remove("overlay-open");
      trigger?.focus?.();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close, step]);

  /* archive.js focused the close control on every open(), including
     prev/next steps. Same here. */
  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen, current]);

  /* Changing filter invalidates the open index. */
  useEffect(() => setCurrent(-1), [filter]);

  return (
    <>
      <div className="archive-filters" role="group" aria-label="Filter the archive">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            className={value === filter ? "filter-btn is-active" : "filter-btn"}
            data-filter={value}
            type="button"
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="archive-grid" data-archive-grid>
        {visible.length === 0 ? (
          <p className="archive-empty">Nothing in this part of the archive yet.</p>
        ) : (
          visible.map((entry, i) => (
            <button key={entry.title} className="archive-card" data-index={i} type="button" onClick={() => setCurrent(i)}>
              {entry.image ? (
                <div className="media">
                  <img src={entry.image} alt="" />
                  {entry.kind === "Video" && <span className="play">{PLAY_ICON}</span>}
                </div>
              ) : (
                <div className="media is-text">
                  <span className="excerpt">{entry.excerpt ?? ""}</span>
                </div>
              )}
              <span className="kind">{entry.kind}</span>
              <h3>{entry.title}</h3>
              <span className="meta">{entry.meta ?? ""}</span>
            </button>
          ))
        )}
      </div>

      {/* Structure mirrors archive.html:91-108 — the controls are siblings
          of .overlay-panel, positioned against .overlay. */}
      <div
        className={`overlay${isOpen ? " is-open" : ""}`}
        data-overlay
        aria-hidden={!isOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Archive item"
      >
        <div className="overlay-backdrop" data-overlay-close onClick={close} />

        <button
          ref={closeRef}
          className="overlay-ctrl overlay-close"
          data-overlay-close
          type="button"
          aria-label="Close"
          onClick={close}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>

        <button
          className="overlay-ctrl overlay-arrow prev"
          data-overlay-prev
          type="button"
          aria-label="Previous item"
          disabled={current <= 0}
          onClick={() => step(-1)}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 4l-8 8 8 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          className="overlay-ctrl overlay-arrow next"
          data-overlay-next
          type="button"
          aria-label="Next item"
          disabled={current === visible.length - 1}
          onClick={() => step(1)}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 4l8 8-8 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <span className="overlay-count" data-overlay-count aria-live="polite">
          {isOpen ? `${current + 1} of ${visible.length}` : ""}
        </span>

        <div className="overlay-panel">
          <div className="overlay-media" data-overlay-media>
            {item && <OverlayMedia item={item} />}
          </div>
          <div className="overlay-body" data-overlay-body>
            {item && (
              <>
                <span className="kind">{item.kind}</span>
                <h2>{item.title}</h2>
                <div className="meta">{item.meta ?? ""}</div>
                <div className="prose">
                  {(item.body ?? []).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                {(item.pdf || item.link) && (
                  <div className="overlay-actions">
                    {item.pdf && (
                      <a className="btn btn-dark" href={item.pdf} target="_blank" rel="noopener">
                        Open the PDF <span aria-hidden="true">→</span>
                      </a>
                    )}
                    {item.link && (
                      <a className="btn btn-outline" href={item.link.href} target="_blank" rel="noopener">
                        {item.link.label} <span aria-hidden="true">→</span>
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function OverlayMedia({ item }: { item: ArchiveEntry }) {
  if (item.embed?.provider === "youtube") {
    const src = `https://www.youtube-nocookie.com/embed/${item.embed.id}${item.embed.start ? `?start=${item.embed.start}` : ""}`;
    return (
      <iframe
        src={src}
        title={item.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  if (item.embed?.provider === "instagram") {
    return <iframe src={`${item.embed.url.replace(/\/?$/, "/")}embed`} title={item.title} allowFullScreen />;
  }
  if (item.placeholder) {
    return (
      <div className="missing">
        <strong>Recording not yet uploaded</strong>
        <span>Add a YouTube or Instagram link to this entry and it will play here.</span>
      </div>
    );
  }
  return item.image ? <img src={item.image} alt="" /> : null;
}
```

The `data-*` attributes are retained even though React now drives the behaviour: they cost nothing, they keep the DOM recognisable against the old markup during screenshot comparison, and Task 11's verification greps for them.

- [ ] **Step 4: Write the page**

```tsx
// src/app/archive/page.tsx
import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";
import ArchiveGrid from "@/components/ArchiveGrid";
import { ARCHIVE } from "@/data/archive";

export const metadata: Metadata = {
  title: "Archive | Ntuli Foundation",
  alternates: { canonical: "/archive" },
};

export default function Archive() {
  return (
    <SiteChrome variant="tinted">
      <section className="page-hero no-pb">
        <div className="container">
          <span className="eyebrow">Archive</span>
          <h1 className="display">The living record.</h1>
          <p className="lead">
            Films, lectures, essays and published writing by Prof Pitika Ntuli, held here so the work stays in
            circulation rather than in storage.
          </p>
        </div>
      </section>

      <main>
        <section className="archive-section" style={{ padding: "128px 0" }}>
          <div className="container">
            <ArchiveGrid entries={ARCHIVE} />
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
```

Three details taken from `archive.html:68-86`, all of which matter: the hero is `page-hero no-pb` and sits **outside** `<main>`; the section is `archive-section` carrying an **inline** `padding: 128px 0`; and `ArchiveGrid` renders the filters, the grid and the overlay, which in the original are three separate blocks.

- [ ] **Step 5: Drive the archive by hand**

```bash
npm run dev
```

At `http://localhost:3000/archive`, confirm against the baseline at `http://localhost:3200/archive.html`:
1. Seven cards; four Video with play badges, three Writing
2. Filters switch correctly and the active button is highlighted
3. Clicking a card opens the overlay with the right entry
4. The YouTube embed plays; **"Eating my Art" starts at 44 seconds**
5. Arrow keys move between entries; the count reads `n of 7`
6. Escape and the backdrop both close it
7. Closing stops playback — the iframe must be gone from the DOM
8. "Palestine in My Heart" shows its "View the book" button
9. Switching filter while the overlay is open closes it rather than showing the wrong entry

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Port the Archive page and its overlay"
```

---

### Task 10: Redirects, 404, and the smoke test

**Files:**
- Modify: `next.config.ts`
- Create: `src/app/not-found.tsx`, `scripts/smoke.mjs`
- Delete: `index.html`, `what-we-do.html`, `our-team.html`, `studio.html`, `archive.html`, `news.html`, `public/assets/js/main.js`, `public/assets/js/archive.js`

**Interfaces:**
- Consumes: every route from Tasks 5–9
- Produces: `npm run smoke`; 301s from all six legacy URLs

- [ ] **Step 1: Add the redirects**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/what-we-do.html", destination: "/what-we-do", permanent: true },
      { source: "/our-team.html", destination: "/our-team", permanent: true },
      { source: "/studio.html", destination: "/studio", permanent: true },
      { source: "/archive.html", destination: "/archive", permanent: true },
      { source: "/news.html", destination: "/news", permanent: true },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 2: Write the 404 page**

```tsx
// src/app/not-found.tsx
import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";

export default function NotFound() {
  return (
    <SiteChrome variant="tinted">
      <section className="page-hero flat">
        <div className="container">
          <span className="eyebrow">404</span>
          <h1 className="display">This page has moved on.</h1>
          <p className="lead">
            The page you were looking for is not here. It may have been renamed, or the link that brought you here may be
            out of date.
          </p>
          <Link className="btn btn-dark" href="/">
            Return home
          </Link>
        </div>
      </section>
    </SiteChrome>
  );
}
```

- [ ] **Step 3: Delete the old HTML and JS**

The ported components are now the only source. Leaving these behind means two copies drifting — the exact problem this project exists to fix.

```bash
git rm index.html what-we-do.html our-team.html studio.html archive.html news.html
git rm public/assets/js/main.js public/assets/js/archive.js
```

- [ ] **Step 4: Write the smoke test**

```js
// scripts/smoke.mjs
import { spawn } from "node:child_process";

const BASE = "http://localhost:3100";

const ROUTES = [
  ["/", "hero-home"],
  ["/what-we-do", "portal-section"],
  ["/our-team", "page-hero"],
  ["/studio", "page-hero"],
  ["/news", "hero-bone"],
  ["/archive", "archive-grid"],
];

const REDIRECTS = [
  ["/index.html", "/"],
  ["/what-we-do.html", "/what-we-do"],
  ["/our-team.html", "/our-team"],
  ["/studio.html", "/studio"],
  ["/archive.html", "/archive"],
  ["/news.html", "/news"],
];

const server = spawn("npx", ["next", "start", "-p", "3100"], { stdio: "ignore" });
let failures = 0;

const fail = (msg) => { console.error(`FAIL  ${msg}`); failures++; };
const pass = (msg) => console.log(`ok    ${msg}`);

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(BASE, { redirect: "manual" });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error("server did not start within 30s");
}

try {
  await waitForServer();

  for (const [path, marker] of ROUTES) {
    const res = await fetch(BASE + path);
    const html = await res.text();
    if (res.status !== 200) fail(`${path} returned ${res.status}`);
    else if (!html.includes(marker)) fail(`${path} is missing marker "${marker}"`);
    else pass(`${path}`);
  }

  for (const [from, to] of REDIRECTS) {
    const res = await fetch(BASE + from, { redirect: "manual" });
    const location = res.headers.get("location");
    if (res.status !== 308 && res.status !== 301) fail(`${from} returned ${res.status}, expected a permanent redirect`);
    else if (!location?.endsWith(to)) fail(`${from} redirected to ${location}, expected ${to}`);
    else pass(`${from} → ${to}`);
  }

  const notFound = await fetch(`${BASE}/definitely-not-a-page`);
  if (notFound.status !== 404) fail(`unknown path returned ${notFound.status}, expected 404`);
  else pass("404 page");

  for (const asset of ["/assets/css/main.css", "/assets/img/logo.png", "/assets/img/logo-light.png"]) {
    const res = await fetch(BASE + asset);
    if (res.status !== 200) fail(`${asset} returned ${res.status}`);
    else pass(asset);
  }
} finally {
  server.kill();
}

console.log(failures === 0 ? "\nAll smoke checks passed." : `\n${failures} smoke check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
```

Next emits `308` for `permanent: true`, which is a permanent redirect and preserves link equity exactly as a `301` does; the test accepts either.

- [ ] **Step 5: Run it**

```bash
npm run build && npm run smoke
```

Expected: every line `ok`, exit 0.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add redirects, 404 page and smoke test; remove the static HTML"
```

---

### Task 11: Visual verification against the pre-port baseline

**Files:**
- Create: `scripts/shots.mjs`

**Interfaces:**
- Consumes: the built site from Task 10
- Produces: side-by-side screenshots for review; no source changes

This task changes no application code. Its deliverable is evidence.

- [ ] **Step 1: Write the screenshot script**

```js
// scripts/shots.mjs
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "/tmp/ntuli-shots";
const PAGES = [
  ["home", "/", "/index.html"],
  ["what-we-do", "/what-we-do", "/what-we-do.html"],
  ["our-team", "/our-team", "/our-team.html"],
  ["studio", "/studio", "/studio.html"],
  ["news", "/news", "/news.html"],
  ["archive", "/archive", "/archive.html"],
];
const WIDTHS = [[1440, 2400], [390, 1600]];

mkdirSync(OUT, { recursive: true });

/* Port 3100: the ported Next.js build. Port 3200: the pre-port HTML
   worktree pinned in Task 1. Both local, so neither is subject to
   network variance or a stale deploy. */
const server = spawn("npx", ["next", "start", "-p", "3100"], { stdio: "ignore" });
const baseline = spawn("python3", ["-m", "http.server", "3200", "-d", "/tmp/ntuli-baseline"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 6000));

const shoot = (url, out, w, h) =>
  spawnSync(CHROME, [
    "--headless", "--disable-gpu", "--hide-scrollbars",
    `--window-size=${w},${h}`, "--virtual-time-budget=8000",
    `--screenshot=${out}`, `--user-data-dir=${OUT}/profile-${Date.now()}`, url,
  ], { stdio: "ignore" });

for (const [name, newPath, oldPath] of PAGES) {
  for (const [w, h] of WIDTHS) {
    shoot(`http://localhost:3100${newPath}`, `${OUT}/${name}-${w}-new.png`, w, h);
    shoot(`http://localhost:3200${oldPath}`, `${OUT}/${name}-${w}-old.png`, w, h);
    console.log(`shot ${name} @ ${w}`);
  }
}

server.kill();
baseline.kill();
console.log(`\nScreenshots in ${OUT}`);
```

- [ ] **Step 2: Generate the screenshots**

```bash
npm run build && node scripts/shots.mjs
open /tmp/ntuli-shots
```

- [ ] **Step 3: Compare every pair and record what differs**

Open each `-old` / `-new` pair. Expected differences are limited to: content below the fold that reveal-on-scroll has not triggered, and the loader on first paint. **Anything else — spacing, type size, colour, image crop, element order — is a port defect and must be fixed before this task is complete.**

There should be **no intended differences**: the baseline is this repo's own HTML at the commit the port started from, so the events section is hidden in both, the footer social icons are present in both, and the wordmark reads `UBuSuSu` in both.

- [ ] **Step 4: Check both themes and reduced motion**

```bash
npm run dev
```

On every one of the six routes: toggle dark mode from the footer and confirm no unstyled or invisible text; reload and confirm the theme persists with no flash of light mode. Then enable reduced-motion emulation and confirm no pinning and no hidden content.

- [ ] **Step 5: Lighthouse before and after**

Both runs are local, so the numbers are comparable — a remote baseline would be measuring the network, not the port.

```bash
LH="--only-categories=performance,accessibility,best-practices,seo --quiet --chrome-flags=--headless"

python3 -m http.server 3200 -d /tmp/ntuli-baseline > /dev/null 2>&1 & BASELINE=$!
sleep 2
npx lighthouse http://localhost:3200/index.html $LH --output=json --output-path=/tmp/lh-old.json
kill $BASELINE

npm run build
npx next start -p 3100 > /dev/null 2>&1 & SERVER=$!
sleep 5
npx lighthouse http://localhost:3100/ $LH --output=json --output-path=/tmp/lh-new.json
kill $SERVER

node -e "for (const f of ['old','new']) { const r = require('/tmp/lh-'+f+'.json'); console.log(f, Object.fromEntries(Object.entries(r.categories).map(([k,v])=>[k, Math.round(v.score*100)]))) }"
```

Record both. Any category that drops by more than 5 points needs an explanation before Phase 2 begins. Performance is expected to *improve*: the two render-blocking GSAP CDN requests are gone.

- [ ] **Step 6: Commit the verification tooling**

```bash
git add scripts/shots.mjs
git commit -m "Add screenshot comparison tooling for port verification"
```

- [ ] **Step 7: Remove the baseline worktree**

Only once every check above has passed — it is the only copy of the pre-port HTML outside git history.

```bash
git worktree remove --force /tmp/ntuli-baseline
git worktree list
```

Expected: `/tmp/ntuli-baseline` no longer listed.

---

## Definition of done

- [ ] `npm run build` succeeds with every route listed as static
- [ ] `npm run typecheck` passes
- [ ] `npm run smoke` passes
- [ ] All six pages screenshot-compared at 1440px and 390px against the `/tmp/ntuli-baseline` worktree, differences accounted for
- [ ] Both pinned GSAP sequences verified by hand, including after client-side navigation away and back
- [ ] Dark mode verified on all six routes with no flash on reload
- [ ] Reduced motion verified
- [ ] Archive overlay driven by hand, including the 44-second start on "Eating my Art"
- [ ] Every legacy `.html` URL returns a permanent redirect
- [ ] Lighthouse recorded before and after
- [ ] `.gitignore` present and `.env` proven ignored

## Handoff: the first preview deploy

Once the checklist above is green, connect the repo to Vercel and deploy this branch to a preview URL. **No DNS change and no custom domain** — the live cPanel site is untouched and stays that way until the Phase 5 cutover. The preview URL is what the client sees to sign off the port before any Payload work begins.

Use the **free Hobby tier** for this. It is a development project with no domain attached, which is what that tier is for; the Pro upgrade is a cutover-day decision, not a today decision.

Create the Vercel account **in the Foundation's name** with the developer as a collaborator, per the spec. Doing it at first deploy costs nothing and is tedious to unpick later.

## What Phase 1 deliberately does not do

Payload, the database, `/admin`, users, media uploads, article pages, section toggles, `sitemap.xml`, and populating `sameAs`. All are Phase 2+. The site at the end of Phase 1 is the site that exists today, running on Next.js, with content still hard-coded in JSX.
