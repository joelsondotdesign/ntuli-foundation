import type { Metadata } from "next";
import Link from "next/link";
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

        {/* Hero */}
        <section className="hero-home">
          <img className="n-bg" src="/assets/img/n-bg.png" alt="" aria-hidden="true" />
          <img className="hero-sculpture" src="/assets/img/hero-sculpture.png" alt="Carved bone sculpture by Pitika Ntuli" />
          <div className="container" style={{ width: "100%" }}>
            <div className="hero-copy">
              <h1 className="display">Living archives<br />ancestral voices<br />shared futures</h1>
              <p>Grounded in the philosophy of UBuSuSu, our work unfolds across the archive, studio, education, community, and global dialogue: intergenerational sites of living knowledge.</p>
              <Link className="btn btn-dark" href="/what-we-do">Explore our work</Link>
            </div>
          </div>
          <div className="scroll-badge" aria-hidden="true">
            <svg viewBox="0 0 100 100">
              <defs><path id="badge-circle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" /></defs>
              <text><textPath href="#badge-circle">Scroll to walk through —</textPath></text>
            </svg>
            <span className="badge-arrow">↓</span>
          </div>
        </section>

        {/* About */}
        <section className="about">
          <div className="container grid reveal">
            <div className="label">About<br />The Foundation</div>
            <p className="statement">The purpose of the Ntuli Foundation is to deliver public benefit in the areas of culture, heritage, and education, ensuring that African philosophical, artistic, and spiritual knowledge systems are preserved, activated, and transmitted to future generations. All assets and activities of the Foundation are applied exclusively towards these objectives.</p>
          </div>
        </section>

        {/* Studio photo */}
        <section className="photo-panel">
          <div className="container reveal">
            <div className="frame"><img src="/assets/img/studio-warehouse.jpg" alt="The studio workshop in Kew, Johannesburg — hundreds of sculptures standing where the chisel left them" /></div>
          </div>
        </section>

        {/* What we do: sticky left title, scrolling rows right */}
        <section className="wwd-band">
          <div className="container wwd-grid">
            <div className="wwd-left">
              <span className="eyebrow">What we do</span>
              <h2 className="h2">Four rooms,<br />one passage.</h2>
              <p className="note">Intergenerational sites of living knowledge: held, activated, and handed on.</p>
            </div>
            <div className="wwd-rows">
              <div className="row reveal">
                <span className="num">01</span>
                <div><h3>Living archives</h3><p>Holding and activating African knowledge through preservation, digitisation, and publication.</p></div>
              </div>
              <div className="row reveal">
                <span className="num">02</span>
                <div><h3>Studio practice</h3><p>Advancing artistic creation, mentorship, and intergenerational making.</p></div>
              </div>
              <div className="row reveal">
                <span className="num">03</span>
                <div><h3>Knowledge transmission</h3><p>Education, research, fellowship, and institutional partnership.</p></div>
              </div>
              <div className="row reveal">
                <span className="num">04</span>
                <div><h3>Public & global recognition</h3><p>Exhibitions, community engagement, and international cultural exchange.</p></div>
              </div>
            </div>
          </div>
        </section>

        {/* Focus areas */}
        <section className="focus">
          <div className="container">
            <span className="eyebrow">Focus Areas</span>
            <h2 className="h2 navy">Where the work lives.</h2>
            <div className="focus-grid">
              <div className="focus-card reveal">
                <img src="/assets/img/focus-living-archives-photo.png" alt="A gathering among the sculptures and paintings in the studio" />
                <h3>Living archives</h3>
                <p>To preserve and digitise Professor Ntuli&rsquo;s work, establishing the studio as a primary archival and pedagogical site.</p>
              </div>
              <div className="focus-card reveal">
                <img src="/assets/img/focus-global-culture-photo.png" alt="Professor Pitika Ntuli speaking at a public event" />
                <h3>Global culture reach</h3>
                <p>To position African philosophical and artistic knowledge within both continental and global cultural institutions and frameworks.</p>
              </div>
              <div className="focus-card reveal">
                <img src="/assets/img/focus-living-space-photo.jpg" alt="Learners in the studio holding up their paintings" />
                <h3>Studio as a living space</h3>
                <p>To activate the studio as a dynamic site for education, performance, and meaningful community engagement.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quote + visit strip */}
        <section className="quote-band">
          <div className="container">
            <p className="quote reveal">We do this work not as an institution keeping objects, <span className="accent">but as a return.</span></p>
            <p className="sub">Where lineage becomes living knowledge held, activated, and handed on.</p>
            <div className="visit-strip reveal">
              <div><div className="k">Opening hours</div><div className="v">Walkthroughs by appointment</div></div>
              <div><div className="k">When you visit</div><div className="v">146 10th Road, Kew, Johannesburg</div></div>
              <div><div className="k">Book</div><a className="v text-link" href="mailto:info@ntulifoundation.org">Book a walkthrough <span className="arrow">→</span></a></div>
            </div>
          </div>
        </section>

        {/* Donate */}
        <section className="donate">
          <div className="container">
            <div className="panel reveal">
              <p className="tag">This work belongs to all of us</p>
              <h2>Help carry it forward.</h2>
              <p>From bold concepts to early pilots, we support ideas with potential to scale across African communities, providing catalytic funding, strategic partnerships, and evidence-based learning.</p>
              <div className="actions">
                <a className="btn btn-light" href="mailto:info@ntulifoundation.org?subject=Donation">Donate</a>
                <a className="btn btn-outline on-navy" href="mailto:info@ntulifoundation.org?subject=Volunteering">Volunteer with us</a>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming events — temporarily hidden until real dates are confirmed.
             Remove the `hidden` attribute below to bring the section back. */}
        <section className="events" id="events" hidden>
          <div className="container">
            <div className="head">
              <div>
                <span className="eyebrow">Upcoming events</span>
                <h2 className="h2 navy">Come and stand in the room.</h2>
              </div>
              <a className="text-link" href="mailto:info@ntulifoundation.org?subject=Events">Enquire about a date <span className="arrow">→</span></a>
            </div>

            <div className="event-row reveal">
              <div className="event-date"><span className="day">15</span><span className="month">Aug 2026</span></div>
              <div className="event-body">
                <h3>Studio walkthrough: the great hall of making</h3>
                <p className="where">146 10th Road, Kew, Johannesburg · 10:00</p>
              </div>
              <a className="btn btn-outline event-cta" href="mailto:info@ntulifoundation.org?subject=Studio%20walkthrough%20booking">Book a place</a>
            </div>

            <div className="event-row reveal">
              <div className="event-date"><span className="day">12</span><span className="month">Sep 2026</span></div>
              <div className="event-body">
                <h3>School art lab: hands in the material</h3>
                <p className="where">The teaching floor, Kew · Schools programme</p>
              </div>
              <span className="status event-cta">By invitation</span>
            </div>

            <div className="event-row reveal">
              <div className="event-date"><span className="day">03</span><span className="month">Oct 2026</span></div>
              <div className="event-body">
                <h3>Archival training: preserving a community collection</h3>
                <p className="where">The archive room, Kew · Applications open</p>
              </div>
              <a className="btn btn-outline event-cta" href="mailto:info@ntulifoundation.org?subject=Archival%20training%20application">Apply</a>
            </div>
          </div>
        </section>

        {/* Latest */}
        <section className="latest">
          <div className="container">
            <div className="head">
              <div>
                <span className="eyebrow">Latest</span>
                <h2 className="h2 navy">From the threshold</h2>
              </div>
              <Link className="text-link" href="/news">All news <span className="arrow">→</span></Link>
            </div>
            <a className="news-row reveal" href="https://www.amazon.fr/-/en/Pitika-Ntuli/dp/0639878504" target="_blank" rel="noopener">
              <div className="thumb"><img src="/assets/img/news-book.jpg" alt="Palestine in My Heart — book cover" /></div>
              <div>
                <div className="meta"><span>30 apr 2026</span><span className="chip">Book</span></div>
                <h3>Palestine in My Heart: a new poetry collection by Pitika Ntuli</h3>
              </div>
              <span className="go" aria-hidden="true">→</span>
            </a>
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
