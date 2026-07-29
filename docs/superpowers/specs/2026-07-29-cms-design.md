# Making the Ntuli Foundation site client-editable

**Date:** 2026-07-29
**Status:** Approved — ready for implementation planning

## The problem

The site is six hand-written HTML pages. Every content change requires a developer to
edit HTML and upload files over FTP to a cPanel host. The Foundation cannot add a news
item, announce an event, or publish a video without going through us.

Three specific symptoms make the case:

1. **The same three stories are maintained in three places.** "Palestine in My Heart",
   "Junkyard Dogs" and "Freedom Charter at 70" exist as hand-written HTML in
   `index.html`, again in `news.html`, and a third time as `Writing` entries in
   `assets/js/archive.js`. The copies have already drifted in wording, in a site nobody
   has started editing yet.
2. **The nav and footer are copy-pasted into six files.** Adding four social icons meant
   editing six files. A `UBuSuSu` capitalisation error existed on one page and not others.
3. **The Archive is invisible to search engines.** It renders client-side from a
   JavaScript array, so crawlers see an empty grid. Every video and piece of writing in
   it is currently unindexed.

## Goals

The client can, without a developer:

- Publish, edit and unpublish **news** — either a link to coverage elsewhere, or a full
  article hosted on the site
- Add and remove **upcoming events**
- Add **archive** entries — YouTube videos and writing, with PDFs
- Change **site settings** — contact details, social links, footer text
- **Show or hide** certain page sections
- **Manage who else has access** to the admin

## Non-goals

- Editing structural page copy (hero, About, What we do, UBuSuSu, Our team, Studio).
  These stay hard-coded and change on request. Making every heading editable triples the
  build and hands a non-technical user enough rope to break pages they touch twice a year.
- An events archive. Past events drop off the site entirely.
- Redesigning anything. The existing design ships unchanged.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Hosting | **Vercel** | cPanel offers only Apache/PHP/MySQL. An `/admin` with real auth there means writing PHP — explicitly rejected. Vercel gives a Node runtime, atomic deploys, rollback and preview URLs on one host. |
| Domain | **Stays at domains.co.za**, DNS repointed | Keeps the client's registrar relationship. `A` + `CNAME` records only — **not** a nameserver change — so MX records are untouched and email cannot break. |
| CMS | **Payload 3, self-hosted in the Next.js app** | Only option that delivers own-domain `/admin`, own login, and built-in user management. MIT licensed, no per-seat fees, no third-party account the Foundation depends on. |
| Database | **Neon Postgres, `eu-central-1` (Frankfurt)** | No Africa region exists. Frankfurt is ~150–170ms from Johannesburg vs 230ms+ for US regions. Region is **permanent** once created. Affects admin responsiveness, not public page loads. |
| Media storage | **Vercel Blob** | 1GB included; far more than this site needs. |
| Email | **The Foundation's existing domains.co.za SMTP** | Sends perhaps a dozen password resets a year. Not worth a new vendor or touching mail DNS. |
| News items | **Link-out *or* on-site article, per item** | The Foundation intends to publish its own writing; the Archive already carries body text and PDFs. |
| News/Archive overlap | **A checkbox on News: "Also list in the Archive"** | One entry surfacing in both places. Directly fixes the drift documented above. |

### Rejected alternatives

- **Astro + Sanity** — user management lives in Sanity's dashboard, not ours; free tier
  caps editors. Fails the stated requirement.
- **Git-backed CMS (Sveltia/Decap)** — free and simple, but editors need GitHub accounts.
  No username/password user management. Wrong for this brief.

## Architecture

One Next.js app in this repo, deployed to Vercel. Public site and admin are the same
application, which is why `/admin` needs no second host, second domain, or CORS.

```
src/
├── app/
│   ├── (site)/
│   │   ├── layout.tsx             ← nav + footer, ONE copy
│   │   ├── page.tsx               ← home
│   │   ├── what-we-do/page.tsx
│   │   ├── our-team/page.tsx
│   │   ├── studio/page.tsx
│   │   ├── archive/page.tsx
│   │   ├── news/page.tsx
│   │   └── news/[slug]/page.tsx   ← NEW — article pages
│   └── (payload)/admin/…          ← /admin
├── collections/                   ← News, Events, Archive, Media, Users
├── globals/SiteSettings.ts
└── components/                    ← Nav, Footer, NewsRow, EventRow, ArchiveGrid, SiteScripts
public/assets/                     ← css, fonts, img — paths unchanged
payload.config.ts
```

### Constraints that protect the design

- **`main.css` moves byte-for-byte to `public/assets/css/` and is never rewritten.** Same
  path, same selectors. Markup becomes JSX with *identical class names and structure*. No
  Tailwind, no CSS modules. If the stylesheet and class names don't change, the design
  cannot drift during the port.
- **Fonts and images keep their existing paths.**
- **`main.js` is ported into a client component**, not loaded via `<script>`. Script-tagging
  is less work but leaves IntersectionObserver and ScrollTrigger instances stale after
  client-side navigation. Ported properly it binds on mount and cleans up on unmount.
- **Every existing URL keeps working.** `what-we-do.html` → `/what-we-do`, with 301
  redirects from the old `.html` paths.

### Known risk

The two pinned GSAP ScrollTrigger sequences on What we do (`.portal-section` and
`.commitments`) are the most delicate thing on the site. Pinning is sensitive to layout
timing and needs `ScrollTrigger.refresh()` once fonts and images settle. Budget real time;
verify against the live site rather than assuming.

`main.js` (204 lines) also carries: sticky nav, mobile menu, theme toggle, cookie notice,
first-load-only loader (`sessionStorage`), IntersectionObserver reveals, and a
reduced-motion fallback. All must survive.

## Content model

### News — "From the threshold"

| Field | Notes |
|---|---|
| Title | |
| Date | Ordering and the `30 apr 2026` line |
| Category | Dropdown → the chip. Book, Exhibition, Opinion, Interview, Announcement. Fixed list; extended in code, not by the client, so the design stays consistent |
| Image | Thumbnail + alt text |
| This story is | Radio: `A link to an article elsewhere` / `An article on this site` |
| Link URL | Required if link-out; hidden otherwise |
| Body | Rich text; required if article; hidden otherwise |
| Summary | 1–2 sentences. Featured card + SEO description |
| Also list in the Archive | Checkbox |

The newest published item is automatically the featured story on `/news`; the newest three
appear on the home page. Nothing to configure.

On-site articles get `/news/<slug>`, slug auto-derived from the title and editable.

### Events

| Field | Notes |
|---|---|
| Title | |
| Date and time | Drives the `15` / `Aug 2026` block and auto-hiding |
| Location | e.g. `146 10th Road, Kew, Johannesburg` |
| Action | Dropdown: `Button with a link` / `Status label` / `Nothing` |
| Button label / URL | Reproduces the three existing variants: Book a place, By invitation, Apply |

### Archive

| Field | Notes |
|---|---|
| Type | `Video` or `Writing` — drives the existing filter |
| Title | |
| Credit line | Free text, e.g. `2026 · Poetry collection · Botsotso`. Format shown as a hint |
| YouTube link | **Full URL pasted from the browser** |
| Instagram link | Optional, for reels |
| Image | Optional |
| Description | Rich text |
| PDF | Optional upload → the "Open the PDF" button |
| Outbound link | Optional URL + button label |

Two behaviours built in rather than asked of the client:

- The YouTube field accepts the **whole URL** (`youtube.com/watch?v=EQwz7M7ZlqM&t=44s`);
  the video ID *and* start time are extracted server-side. The client never learns what a
  video ID is.
- **A video with no uploaded image takes its thumbnail from YouTube automatically.**

The archive page renders **server-side**, merging Archive entries with News items flagged
"Also list in the Archive".

`assets/js/archive.js` is retired once its seven entries are migrated. Its rendering logic
is replaced by server-rendered markup; its overlay/lightbox behaviour (keyboard
navigation, prev/next, focus handling) is ported into a client component and kept.

### Site settings (global)

Contact email · phone · address · four social URLs · footer blurb · motto · section
visibility toggles.

**A blank social URL hides that icon.** This resolves the placeholder handles currently
committed in the footer.

### Users

Email, name, password, role — **Admin** or **Editor**.

- Editor: manages content
- Admin: manages content **and** users

Only Admins see the Users section, so an Editor cannot lock anyone out. New users receive
an email to set their own password; nobody types a password on someone else's behalf. The
first Admin is seeded during setup.

## Section visibility

Three layers, solving different problems:

1. **Section toggles** in Site settings — Home → Upcoming events, Home → From the
   threshold, Cookie notice. Hides the block; content untouched.
2. **Per-item Draft/Published state** — built into Payload. Drafts never appear publicly.
3. **Auto-hide when empty** — if every event's date has passed, the section hides itself
   even with the toggle on. Prevents an "Upcoming events" heading above nothing, or a
   home page advertising last year's event. The toggle is the manual override; this is the
   safety net.

Toggles are deliberately limited to content feeds. Hero, About and focus areas are
structural — a toggle there is a switch for making the home page look broken.

## Data flow

Pages are **built as static HTML and served from Vercel's CDN**. No visitor request touches
the database.

On publish, a Payload hook revalidates only the affected paths — an event revalidates the
home page; an article revalidates the home page, `/news`, that article, and `/archive` if
flagged. Live in seconds; no full rebuild.

**This engineers out the risk identified when choosing Payload:** Payload on serverless can
exhaust database connections when every request queries the database. Here the database is
touched when content *changes*, not when the site is *read*. Neon's **pooled** connection
string is used, not the direct one.

**Consequence:** if the database is down, the public site stays up on its last built pages.
A broken CMS and a broken website become separate events.

## SEO

- **The Archive becomes indexable for the first time** (currently client-rendered, so
  invisible to crawlers)
- Per-article `title`, description, canonical URL and share image, auto-derived from
  content, overridable per item
- **`sameAs` populates from Site settings**, closing the `⚠ sameAs on the NGO node is
  empty` comment at `index.html:45`
- **Event structured data** → eligible for rich results with dates and locations in Google
- **`sitemap.xml` generated from published content.** None exists today
- **301 redirects** from every old `.html` URL

## Error handling

| Situation | Behaviour |
|---|---|
| Database down | Site serves last built pages. Only `/admin` affected |
| Bad YouTube URL | Rejected on save with a plain-English message |
| "Link elsewhere" saved with no URL | Save blocked, field flagged |
| Image missing or slow | Space reserved; no layout shift |
| Bad content published | Unpublish is one click; Vercel rollback restores any deploy |
| Page not found | 404 styled as part of the site |

## Delivery phases

1. **Port to Next.js with content hard-coded.** No CMS. The site should be
   indistinguishable from what's live. *If anything breaks here, it's the port, not the
   CMS* — separating those failure modes is worth the extra step.
2. **Payload, users, admin.** Collections, roles, media library, branded login. Not yet
   wired to the public site.
3. **Wire pages to real data**, and migrate existing content in — three news stories,
   seven archive entries, three events, contact details, social URLs. The client should
   open the admin on day one and find their site already in it.
4. **The rest** — section toggles, article pages, SEO, sitemap, redirects, preview, 404.
5. **Cutover.**

## Verification before cutover

- Every page screenshot-compared against the live site: desktop and mobile, light and dark
- **The two pinned GSAP sequences scrolled by hand**, both themes, reduced-motion on
- First-load-only loader, mobile nav, cookie notice, theme toggle
- Every old `.html` URL returns a 301
- **The admin driven as an Editor, not as a developer** — create, edit, preview and publish
  one of each type; upload an image and a PDF; paste a YouTube URL
- Lighthouse before and after, so any regression is a number rather than an opinion

**On automated tests:** this repo has no test framework and this is a content site — most
of its risk is visual and behavioural, which unit tests do not catch. Rather than pretend
otherwise, the safety net is: TypeScript across the Payload schema and page queries (so a
renamed field breaks the build, not the site), screenshot comparison against the live site,
and the manual checklist above. Two automated checks are worth having and are cheap: a
build-time check that every old `.html` path returns a 301, and a smoke test that each page
renders without error. Anything beyond that is ceremony for a site of this size.

## Cutover

1. Deploy to a Vercel preview URL; test fully while the live site carries on untouched
2. Lower DNS TTL at domains.co.za a day ahead
3. Add an `A` record and a `CNAME` — **not** a nameserver change. **MX records are never
   touched, so email cannot break**
4. Vercel issues SSL automatically
5. **Leave the cPanel files in place for two weeks.** Rollback is reverting one DNS record;
   the old site is still sitting there intact
6. Decommission only once stable

## Cost

| | |
|---|---|
| Vercel Pro | **$20/month** |
| Neon Postgres | Free tier is sufficient |
| Blob storage (images + PDFs) | Within included allowance |
| Transactional email | Free (existing SMTP) |
| **Total** | **~$20/month** |

Vercel's free Hobby tier is **non-commercial use only**. An organisation's official site on
its own domain does not qualify, regardless of nonprofit status. **Build entirely on free
Hobby; upgrade to Pro at cutover**, when the domain is attached. Nothing is paid until
launch.

## Operational requirements

| What | When | Notes |
|---|---|---|
| Vercel account | End of Phase 1 | **In the Foundation's name**, developer as collaborator |
| Neon account | Phase 2 | Same ownership principle. Already created, Frankfurt ✓ |
| SMTP credentials | Phase 2 | Host, port, username, password from domains.co.za mail |
| domains.co.za DNS login | Cutover | Must exist and be findable before the day |
| Real social media URLs | Phase 3 | Replaces the placeholder handles currently committed |

**Credential handling.** This repo has **no `.gitignore`** — a `.env` file here would be
committed by `git add -A`. A proper `.gitignore` is the first task in Phase 1, before any
credential touches the directory. Secrets live in `.env.local` (git-ignored) and Vercel
environment variables; values never appear in committed files.

**Handover.** A short written guide plus a screen recording of the four things the client
will actually do: add a news item, add an event, add an archive video, change contact
details. Non-technical clients don't read documentation but will rewatch a five-minute
video.
