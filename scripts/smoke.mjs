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

const server = spawn("npx", ["next", "start", "-p", "3100"], { stdio: "ignore", detached: true });
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

  /* Basic reachability only. This deliberately does NOT claim to catch a stale
     admin importMap: that failure surfaces as a server-side console error, not
     in the status code or the rendered HTML, so no HTTP probe can see it —
     tested, not assumed. `npm run check:generated` is what catches that. */
  const admin = await fetch(`${BASE}/admin`, { redirect: "manual" });
  if (![200, 302, 307].includes(admin.status)) {
    fail(`/admin returned ${admin.status}`);
  } else if (admin.status === 200) {
    const html = await admin.text();
    if (/not found in importMap/i.test(html)) {
      fail("/admin renders an importMap error — run: npm run generate:importmap");
    } else if (!/create-first-user|payload/i.test(html)) {
      fail("/admin returned 200 but rendered no recognisable admin markup");
    } else {
      pass("/admin renders");
    }
  } else {
    pass(`/admin redirects (${admin.status})`);
  }

  const api = await fetch(`${BASE}/api/users?depth=0`);
  if (![200, 401, 403].includes(api.status)) fail(`/api/users returned ${api.status}`);
  else pass("/api/users responds");
} finally {
  // `next start` spawns its own worker process; killing only the `npx`
  // process it's spawned under can leave that worker holding port 3100
  // and break the *next* run. Spawned `detached`, so `server.pid` is the
  // process group leader — kill the whole group.
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {}
}

console.log(failures === 0 ? "\nAll smoke checks passed." : `\n${failures} smoke check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
