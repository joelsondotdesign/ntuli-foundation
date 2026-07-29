import { spawn } from "node:child_process";

const BASE = "http://localhost:3100";

const ROUTES = [
  ["/", "hero-home"],
  ["/what-we-do", "portal-section"],
  ["/our-team", "page-hero"],
  ["/studio", "page-hero"],
  ["/news", "hero-bone"],
  ["/archive", "archive-grid"],
];

const REDIRECTS = [
  ["/index.html", "/"],
  ["/what-we-do.html", "/what-we-do"],
  ["/our-team.html", "/our-team"],
  ["/studio.html", "/studio"],
  ["/archive.html", "/archive"],
  ["/news.html", "/news"],
];

const server = spawn("npx", ["next", "start", "-p", "3100"], { stdio: "ignore" });
let failures = 0;

const fail = (msg) => { console.error(`FAIL  ${msg}`); failures++; };
const pass = (msg) => console.log(`ok    ${msg}`);

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(BASE, { redirect: "manual" });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error("server did not start within 30s");
}

try {
  await waitForServer();

  for (const [path, marker] of ROUTES) {
    const res = await fetch(BASE + path);
    const html = await res.text();
    if (res.status !== 200) fail(`${path} returned ${res.status}`);
    else if (!html.includes(marker)) fail(`${path} is missing marker "${marker}"`);
    else pass(`${path}`);
  }

  for (const [from, to] of REDIRECTS) {
    const res = await fetch(BASE + from, { redirect: "manual" });
    const location = res.headers.get("location");
    if (res.status !== 308 && res.status !== 301) fail(`${from} returned ${res.status}, expected a permanent redirect`);
    else if (!location?.endsWith(to)) fail(`${from} redirected to ${location}, expected ${to}`);
    else pass(`${from} → ${to}`);
  }

  const notFound = await fetch(`${BASE}/definitely-not-a-page`);
  if (notFound.status !== 404) fail(`unknown path returned ${notFound.status}, expected 404`);
  else pass("404 page");

  for (const asset of ["/assets/css/main.css", "/assets/img/logo.png", "/assets/img/logo-light.png"]) {
    const res = await fetch(BASE + asset);
    if (res.status !== 200) fail(`${asset} returned ${res.status}`);
    else pass(asset);
  }
} finally {
  server.kill();
}

console.log(failures === 0 ? "\nAll smoke checks passed." : `\n${failures} smoke check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
