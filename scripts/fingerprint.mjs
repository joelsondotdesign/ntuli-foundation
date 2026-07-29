import { spawn } from "node:child_process";
import { createHash } from "node:crypto";

/*
 * Fingerprints the rendered markup of the six public routes.
 *
 * This exists because a raw md5 of the response body is NOT stable across
 * builds: `next build` embeds a fresh random build id in the RSC payload on
 * every invocation, and chunk filenames are content-hashed. Two builds of
 * byte-identical source therefore produce different md5s, which would make a
 * checksum contract fire false alarms.
 *
 * So we hash the *visible markup* instead: strip the volatile build artefacts,
 * then hash what is left. A fingerprint change now means the DOM actually
 * changed, which is the thing worth guarding.
 *
 * Note: we deliberately do NOT pin `generateBuildId` to make the raw hash
 * stable — a constant build id would break cache-busting on deploy, which is a
 * far worse trade than normalising here.
 *
 * ---------------------------------------------------------------------------
 * BASELINE — as of Task 2 (extraction of CookieNotice and ThemeToggle).
 * This is the contract Task 11 checks against. If a task changes page content
 * on purpose, update these and say so; if they move unexpectedly, that is a
 * regression in visible markup.
 *
 *   /             735dbe13713712317c65a325fe30fa3b4599c95f2cfae58399da8fec56341e6e
 *   /what-we-do   0dc07888a0f8745f066fefe36be89718dc2bec6d5d9e6c6e9a023d8c4ade5fa5
 *   /our-team     0f74edd5ac268e4972ac274f5330b4034ca35f19df769291742848f215ad097c
 *   /studio       71be3d140ec220182eeb1ce5c87a4b26a04e635503bdc9a1abef589fa3538576
 *   /news         cc6e70b7ae1e2c778860be8719faaf7eac17a44c0fe24e92931786b78fa8f7fc
 *   /archive      e04b2786458706de30516821c579b326b5dd169b7f203ee414fd053a9fe3e6e2
 *
 * Scope caveat: this hashes markup outside <script> tags (plus the JSON-LD
 * block). It does not guard the RSC payload, so a change that alters only
 * client-component wiring and no visible DOM will NOT move these.
 * ---------------------------------------------------------------------------
 */

// Port 3101, not smoke's 3100, so `npm run smoke` and `npm run fingerprint`
// can run independently without fighting over the port.
const BASE = "http://localhost:3101";

const ROUTES = ["/", "/what-we-do", "/our-team", "/studio", "/news", "/archive"];

/**
 * Strip everything that varies between builds of identical source.
 */
function normalise(html) {
  let out = html;

  // 1. Script blocks. These carry the RSC flight payload (`self.__next_f.push`),
  //    which embeds the random per-build id as `"b":"<random>"`, plus chunk
  //    `src` URLs. All build artefact, no visible markup.
  //
  //    Exception: `application/ld+json` is kept. It is literal source content
  //    (SEO structured data), it is stable across builds, and a CMS change that
  //    silently broke it is exactly the kind of regression this should catch.
  out = out.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (match, attrs) =>
    /application\/ld\+json/i.test(attrs) ? match : "",
  );

  // 2. Content-hashed asset URLs, e.g.
  //    /_next/static/chunks/01dkdyukbdpqq.js
  //    /_next/static/chunks/turbopack-39j1p7vep75n6.js
  //    /_next/static/media/<font>.woff2
  //    These survive in <link rel="preload"> tags, which step 1 does not touch.
  //    Replacing only the URL (not the tag) keeps the tag *count* significant,
  //    so an added or removed preload still moves the fingerprint.
  out = out.replace(/\/_next\/static\/[^"'\s)>]+/g, "/_next/static/NORMALISED");

  // 3. Normalise line endings and trailing whitespace only. Internal whitespace
  //    is left alone deliberately — collapsing it could mask a real markup change.
  out = out.replace(/\r\n/g, "\n").trim();

  return out;
}

function fingerprint(html) {
  return createHash("sha256").update(normalise(html), "utf8").digest("hex");
}

const server = spawn("npx", ["next", "start", "-p", "3101"], { stdio: "ignore", detached: true });
let failed = false;

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

  for (const route of ROUTES) {
    const res = await fetch(BASE + route);
    if (res.status !== 200) {
      console.error(`FAIL  ${route} returned ${res.status}`);
      failed = true;
      continue;
    }
    const html = await res.text();
    console.log(`${route.padEnd(13)} ${fingerprint(html)}`);
  }
} catch (err) {
  console.error(`FAIL  ${err.message}`);
  failed = true;
} finally {
  // `next start` spawns its own worker process; killing only the `npx`
  // process it's spawned under can leave that worker holding port 3101
  // and break the *next* run. Spawned `detached`, so `server.pid` is the
  // process group leader — kill the whole group.
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {}
}

process.exit(failed ? 1 : 0);
