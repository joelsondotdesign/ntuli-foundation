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
