import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "The studio | Ntuli Foundation",
  description:
    "One man's studio, a continent's memory room: visit the Ntuli studio at 146 10th Road, Kew, Johannesburg — walkthroughs by appointment.",
  alternates: { canonical: "/studio" },
  openGraph: {
    title: "The studio | Ntuli Foundation",
    description:
      "One man's studio, a continent's memory room — visit the Ntuli studio in Kew, Johannesburg.",
    url: "/studio",
  },
};

export default function Studio() {
  return (
    <SiteChrome variant="tinted">
      <section className="page-hero with-media">
        <div className="container">
          <span className="eyebrow">The studio — 146 10th Road, Kew, Johannesburg</span>
          <h1 className="display">One man’s studio.<br /><em>A continent’s memory room.</em></h1>
          <p className="lead">Hundreds of works in bone, bronze, stone, and wood stand where the chisel left them.</p>
          <div className="hero-media">
            <div className="frame"><img src="/assets/img/studio-hall.jpg" alt="Bone sculptures exhibited in a great hall" /></div>
            <div className="photo-caption">
              <span>The workshop — the great hall of making</span>
              <span className="right">Walkthroughs by appointment.</span>
            </div>
          </div>
        </div>
      </section>

      <main>

        {/* The walkthrough */}
        <section className="container">
          <div className="walkthrough">
            <div className="container">
              <span className="eyebrow">The walkthrough</span>
              <h2 className="h2">Four rooms, walked in order.</h2>
              <div style={{ height: "8px" }}></div>
              <div className="walk-rows">
                <div className="row reveal">
                  <span className="big-num">01</span>
                  <div><h3>The yard</h3><p>Stone figures stand among the trees — the first works you meet, weathering in the open.</p></div>
                </div>
                <div className="row reveal">
                  <span className="big-num">02</span>
                  <div><h3>The workshop</h3><p>The great hall of making — hundreds of works standing where the chisel left them.</p></div>
                </div>
                <div className="row reveal">
                  <span className="big-num">03</span>
                  <div><h3>The archive room</h3><p>Where each work is photographed, measured, and annotated — the studio becoming its own record.</p></div>
                </div>
                <div className="row reveal">
                  <span className="big-num">04</span>
                  <div><h3>The teaching floor</h3><p>Learners in a circle among the sculptures — the room where the knowledge is handed on.</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The materials */}
        <section className="materials">
          <div className="container">
            <span className="eyebrow">The Materials</span>
            <div className="materials-grid">
              <div className="material reveal"><h3>Bone</h3><p>Memory of the body — ancestors made tangible.</p></div>
              <div className="material reveal"><h3>Bronze</h3><p>Endurance — the poured and the permanent, made to outlast forgetting.</p></div>
              <div className="material reveal"><h3>Metal</h3><p>Industry re-membered into witness — waste reassembled until it speaks.</p></div>
              <div className="material reveal"><h3>Stone</h3><p>Deep time, carved patiently — the land itself given a face.</p></div>
              <div className="material reveal"><h3>Wood</h3><p>The living grain of tradition — what grew, shaped into what remembers.</p></div>
              <div className="material reveal"><h3>Found objects</h3><p>What history left behind — gathered, reassembled, and made to speak.</p></div>
            </div>
          </div>
        </section>

      </main>
    </SiteChrome>
  );
}
