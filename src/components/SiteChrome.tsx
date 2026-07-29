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
