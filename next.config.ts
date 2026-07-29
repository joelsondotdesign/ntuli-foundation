import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/what-we-do.html", destination: "/what-we-do", permanent: true },
      { source: "/our-team.html", destination: "/our-team", permanent: true },
      { source: "/studio.html", destination: "/studio", permanent: true },
      { source: "/archive.html", destination: "/archive", permanent: true },
      { source: "/news.html", destination: "/news", permanent: true },
    ];
  },
};

export default withPayload(nextConfig);
