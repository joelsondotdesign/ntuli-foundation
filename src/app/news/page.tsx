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
      <section className="page-hero flat">
        <div className="container">
          <span className="eyebrow">News</span>
          <h1 className="display">From the threshold.</h1>
          <p className="lead">Books, exhibitions, and opinions — news from the Foundation and the studio.</p>
        </div>
      </section>

      <main>

        {/* Featured story */}
        <section className="featured">
          <div className="container grid">
            <div className="thumb reveal"><img src="/assets/img/news-book.jpg" alt="Palestine in My Heart — book cover" /></div>
            <div className="reveal">
              <div className="meta"><span>30 apr 2026</span><span className="chip">Book</span></div>
              <h2>Palestine in My Heart: a new poetry collection by Pitika Ntuli</h2>
              <p>A new poetry collection from sculptor-poet Pitika Ntuli, blending lyrical empathy and satire in solidarity with Palestine — illustrated with his own sculptures. Published by Botsotso.</p>
              <a className="btn btn-outline" href="https://www.amazon.fr/-/en/Pitika-Ntuli/dp/0639878504" target="_blank" rel="noopener">View the book <span aria-hidden="true">→</span></a>
            </div>
          </div>
        </section>

        {/* Earlier stories */}
        <section className="earlier">
          <div className="container">
            <a className="news-row reveal" href="https://themelrosegallery.com/viewing-room/49-junkyard-dogs-with-pitika-ntuli-and-willie-bester/" target="_blank" rel="noopener">
              <div className="thumb"><img src="/assets/img/news-junkyard.webp" alt="Junkyard Dogs — sculpture from the exhibition" /></div>
              <div>
                <div className="meta"><span>26 apr 2026</span><span className="chip">Exhibition</span></div>
                <h3>Junkyard Dogs: Pitika Ntuli and Willie Bester turn waste into witness</h3>
              </div>
              <span className="go" aria-hidden="true">→</span>
            </a>
            <a className="news-row reveal" href="http://web.sabc.co.za/sabc/home/channelafrica/news/details?id=753e6f0e-8657-4dfc-afcf-3ad3aaf99c82&title=SA%20has%20betrayed%20Freedom%20Charter:%20Professor%20%C2%A0" target="_blank" rel="noopener">
              <div className="thumb"><img src="/assets/img/news-freedom.jpg" alt="Prof Pitika Ntuli speaking on the Freedom Charter" /></div>
              <div>
                <div className="meta"><span>20 apr 2026</span><span className="chip">Opinion</span></div>
                <h3>Freedom Charter at 70: Prof Pitika Ntuli says its value has been lost</h3>
              </div>
              <span className="go" aria-hidden="true">→</span>
            </a>
          </div>
        </section>

      </main>
    </SiteChrome>
  );
}
