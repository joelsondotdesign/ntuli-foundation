import Nav from "./Nav";
import Footer from "./Footer";
import SiteScripts from "./SiteScripts";
import CookieNotice from "./CookieNotice";

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
      <CookieNotice />
      <SiteScripts />
    </div>
  );
}
