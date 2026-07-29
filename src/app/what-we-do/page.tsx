import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "What we do | Ntuli Foundation",
  description:
    "How the Ntuli Foundation advances African Indigenous Knowledge Systems: the UBuSuSu philosophy, six strategic commitments, education programmes and global alignment.",
  alternates: { canonical: "/what-we-do" },
  openGraph: {
    title: "What we do | Ntuli Foundation",
    description:
      "The UBuSuSu philosophy, six strategic commitments, and education programmes advancing African Indigenous Knowledge Systems.",
    url: "/what-we-do",
  },
};

export default function WhatWeDo() {
  return (
    <SiteChrome variant="tinted">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">What we do — The philosophy</span>
          <h1 className="display">Knowledge, kept<br /><em>living and moving.</em></h1>
          <p className="lead">The Ntuli Foundation is a public-benefit cultural and educational institution dedicated to African Indigenous Knowledge Systems. Our work spans art, heritage, research, education, and community engagement.</p>
        </div>
      </section>

      <main>

        {/* UBuSuSu portal — pinned until the arches merge */}
        <section className="portal-section">
          <div className="portal-stage">
            <div className="portal-arches">
              <div className="arch arch--left">
                <img src="/assets/img/arch-bone-1.svg" alt="" aria-hidden="true" />
                <span className="arch-label">Ubuntu</span>
              </div>
              <div className="arch arch--right">
                <img src="/assets/img/arch-bone-2.svg" alt="" aria-hidden="true" />
                <span className="arch-label">Sunsun</span>
              </div>
              <div className="arch arch--center">
                <img src="/assets/img/arch-bone-1.svg" alt="" aria-hidden="true" />
                <img className="arch-ochre-overlay" src="/assets/img/arch-ochre.svg" alt="" aria-hidden="true" />
                <span className="arch-label">Sumud</span>
              </div>
              <div className="portal-wordmark">UBuSuSu</div>
            </div>
            <div className="portal-copy">
              <h3>Our triadic philosophy.</h3>
              <p>It reframes education as re-membering, and positions artistic expression as a method of research, pedagogy, and social transformation.</p>
            </div>
          </div>
        </section>

        {/* Six commitments — pinned while the cards light up */}
        <section className="commitments">
          <div className="commitments-stage">
            <div className="container">
              <div className="commitments-head">
                <span className="eyebrow">Strategic objectives</span>
                <h2 className="h2">Six commitments, one direction.</h2>
              </div>
              <div className="commit-rows">
                <div className="commit-row"><span className="cnum">01</span><p>Promote artistic and cultural heritage as living knowledge.</p><span className="ckey">Living heritage</span></div>
                <div className="commit-row"><span className="cnum">02</span><p>Preserve the documents and materials that anchor artistic and cultural heritage.</p><span className="ckey">Preservation</span></div>
                <div className="commit-row"><span className="cnum">03</span><p>Support research, education, and public engagement grounded in AIKS: through mentorship, fellowships, and training.</p><span className="ckey">Education & research</span></div>
                <div className="commit-row"><span className="cnum">04</span><p>Foster local, continental, and global cultural exchange and diplomacy.</p><span className="ckey">Cultural diplomacy</span></div>
                <div className="commit-row"><span className="cnum">05</span><p>Leverage digital technologies to expand access to heritage and learning.</p><span className="ckey">Digital access</span></div>
                <div className="commit-row"><span className="cnum">06</span><p>Advocate for the sustainability of the cultural and heritage sector.</p><span className="ckey">Sector advocacy</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Education & global alignment */}
        <section className="education">
          <div className="container">
            <div className="grid">
              <div className="col reveal">
                <h3>Education sits at the centre of our work.</h3>
                <p>Re-membering through school outreach, archival training, short courses and university partnerships — our programmes include research workshops across South Africa, Zimbabwe, Ghana, and Tunisia, as well as fellowships, mentorship, object-based learning, university seminars, and open-access digital resources.</p>
              </div>
              <div className="col reveal">
                <h3>Aligned with the frameworks that carry knowledge across borders.</h3>
                <p>Our work aligns with UNESCO priorities, the African Union’s Agenda 2063, and global frameworks for protecting intangible cultural heritage and advancing more equitable knowledge systems.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Programmes */}
        <section className="programmes">
          <div className="container">
            <span className="eyebrow">Programmes</span>
            <h2 className="h2 navy">Seen through the portal.</h2>
            <div style={{ height: "48px" }}></div>
            <div className="prog-grid">
              <div className="prog-card reveal">
                <img src="/assets/img/prog-school-photo.jpg" alt="Sculptors at work on a monumental stone piece in the workshop" />
                <h3>School & outreach</h3>
                <p>Hands-on art labs, curriculum-aligned projects, and youth fellowships.</p>
              </div>
              <div className="prog-card reveal">
                <img src="/assets/img/prog-archival-photo.png" alt="Learners gathered in a circle among the sculptures" />
                <h3>Archival & digital heritage training</h3>
                <p>Teaching preservation methods, digital cataloguing, and community archive management.</p>
              </div>
              <div className="prog-card reveal">
                <img src="/assets/img/prog-fellowship-photo.jpg" alt="Ink drawing by Pitika Ntuli" />
                <h3>Fellowship & resources</h3>
                <p>Preservation methods, metadata standards, and community-run digital catalogues.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </SiteChrome>
  );
}
