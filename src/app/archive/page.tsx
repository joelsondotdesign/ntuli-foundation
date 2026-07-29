import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";
import ArchiveGrid from "@/components/ArchiveGrid";
import { ARCHIVE } from "@/data/archive";

export const metadata: Metadata = {
  title: "Archive | Ntuli Foundation",
  description:
    "The living record: films, lectures, essays and published writing by Prof Pitika Ntuli, held and activated by the Ntuli Foundation.",
  alternates: { canonical: "/archive" },
  openGraph: {
    title: "Archive | Ntuli Foundation",
    description:
      "Films, lectures, essays and published writing by Prof Pitika Ntuli — the Foundation's living record.",
    url: "/archive",
  },
};

export default function Archive() {
  return (
    <SiteChrome variant="tinted">
      <section className="page-hero no-pb">
        <div className="container">
          <span className="eyebrow">Archive</span>
          <h1 className="display">The living record.</h1>
          <p className="lead">
            Films, lectures, essays and published writing by Prof Pitika Ntuli, held here so the work stays in
            circulation rather than in storage.
          </p>
        </div>
      </section>

      <main>
        <section className="archive-section" style={{ padding: "128px 0" }}>
          <div className="container">
            <ArchiveGrid entries={ARCHIVE} />
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
