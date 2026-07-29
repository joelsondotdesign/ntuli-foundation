import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Our team | Ntuli Foundation",
  description:
    "The keepers of the portal: Prof Pitika Ntuli, Antoinette Ntuli, and the team carrying the Ntuli Foundation's work across art, heritage and education.",
  alternates: { canonical: "/our-team" },
  openGraph: {
    title: "Our team | Ntuli Foundation",
    description:
      "Prof Pitika Ntuli, Antoinette Ntuli, and the team carrying the Foundation's work across art, heritage and education.",
    url: "/our-team",
  },
};

export default function OurTeam() {
  return (
    <SiteChrome variant="tinted">
      <section className="page-hero centered no-pb">
        <div className="container">
          <h1 className="display">The keepers<br /><em>of the portal.</em></h1>
          <p className="lead">Custodians, makers, and scholars, the people who hold the<br />Foundation’s work and carry it forward.</p>
        </div>
      </section>

      <main>

        {/* Founders */}
        <section className="team-section">
          <div className="container">
            <span className="eyebrow">The founders</span>
            <div className="founders-grid">
              <div className="person reveal">
                <img src="/assets/img/founder-pitika-grinder.webp" alt="Professor Pitika Ntuli at work with an angle grinder, sparks flying" />
                <h3>Professor Pitika Ntuli</h3>
                <div className="role">Founder &amp; Director</div>
                <p className="bio">An internationally acclaimed South African sculptor, poet, philosopher, and educator whose practice explores African spirituality, identity, and the enduring legacy of colonialism. Working across bone, bronze, metal, stone, and wood, he is the intellectual anchor of the Foundation, guiding its work through the philosophy of UBuSuSu.</p>
              </div>
              <div className="person reveal">
                <img src="/assets/img/founder-antoinette@2x.webp" alt="Antoinette Ntuli speaking at a book event" />
                <h3>Antoinette Ntuli</h3>
                <div className="role">Founder &amp; Director</div>
                <p className="bio">A writer, poet, and cultural producer whose forty-year collaboration with Professor Ntuli has shaped their shared artistic, intellectual, and spiritual journey. A committed social justice practitioner, she serves as custodian of the Foundation’s living archive, transmitting knowledge across generations.</p>
              </div>
            </div>
          </div>
        </section>

        {/* The team */}
        <section className="team-section on-bone">
          <div className="container">
            <span className="eyebrow">The Team</span>
            <div className="people-grid">
              <div className="person reveal">
                <img src="/assets/img/team-ruzy-photo.png" alt="Ruzy Rusike" />
                <h3>Ruzy Rusike</h3>
                <div className="role">Executive Director</div>
                <p className="bio">A curator, researcher, and arts leader engaging African modernism, heritage, and museum futures, and Director of the Southern African Foundation for Contemporary Art.</p>
              </div>
              <div className="person reveal">
                <img src="/assets/img/team-viwe-photo.png" alt="Viwe Mgedezi" />
                <h3>Viwe Mgedezi</h3>
                <div className="role">Director</div>
                <p className="bio">A knowledge management executive and researcher interrogating Western-oriented knowledge frameworks: recovering what risks being lost between generations.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </SiteChrome>
  );
}
