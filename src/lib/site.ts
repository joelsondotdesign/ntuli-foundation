// src/lib/site.ts
import type { Metadata } from "next";

export const SITE = {
  origin: "https://www.ntulifoundation.org",
  name: "Ntuli Foundation",
} as const;

// Single source of truth for the Open Graph / Twitter fields that are
// shared across every page. Next.js shallow-merges `metadata.openGraph`
// and `metadata.twitter` between the root layout and each page — a
// page-level `openGraph` object *replaces* the root layout's `openGraph`
// rather than extending it. So these defaults are re-applied by
// `pageMetadata()` on every page rather than left to inherit from the
// root layout.
export const SITE_OPENGRAPH_DEFAULTS = {
  siteName: SITE.name,
  locale: "en_ZA",
  type: "website",
} as const;

export const SITE_TWITTER_DEFAULTS = {
  card: "summary_large_image",
} as const;

const OG_IMAGE_ALT =
  "The Ntuli Foundation portal mark — light passing through the reversed N";

// og:image carries width/height (baseline emits og:image:width/height);
// twitter:image intentionally omits them (baseline has no
// twitter:image:width/height) — Next.js only emits those meta tags when
// the image descriptor includes the corresponding field.
const SITE_OG_IMAGE = {
  url: "/assets/og/og-home.jpg",
  width: 1200,
  height: 630,
  alt: OG_IMAGE_ALT,
} as const;

const SITE_TWITTER_IMAGE = {
  url: "/assets/og/og-home.jpg",
  alt: OG_IMAGE_ALT,
} as const;

export function pageMetadata({
  title,
  description,
  path,
  ogDescription,
  twitterDescription,
}: {
  /** Page `<title>`, also used verbatim as og:title / twitter:title. */
  title: string;
  /** `<meta name="description">` — independent from ogDescription. */
  description: string;
  /** Site-relative path, e.g. "/" or "/what-we-do". Used for canonical + og:url. */
  path: string;
  /** og:description, when it differs from `description`. Defaults to `description`. */
  ogDescription?: string;
  /** twitter:description, when it differs from og:description. Defaults to og:description. */
  twitterDescription?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...SITE_OPENGRAPH_DEFAULTS,
      title,
      description: ogDescription ?? description,
      url: path,
      images: [SITE_OG_IMAGE],
    },
    twitter: {
      ...SITE_TWITTER_DEFAULTS,
      description: twitterDescription ?? ogDescription ?? description,
      images: [SITE_TWITTER_IMAGE],
    },
  };
}
