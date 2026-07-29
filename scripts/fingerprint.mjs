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
 * BASELINE — as of Task 2b (Footer social links corrected: Facebook and
 * LinkedIn removed, X and Instagram handles corrected, YouTube added).
 * This is the contract Task 11 checks against. If a task changes page content
 * on purpose, update these and say so; if they move unexpectedly, that is a
 * regression in visible markup.
 *
 *   /             0715b85f0f6ce6438ce9a1af4d716e4f66e43d889583913951f7ef6e1c5231b3
 *   /what-we-do   1f716c6251d2af46132f4cbc0509fe660b40315d12bbcdcc6feffe0eeb20e57d
 *   /our-team     bbbf155808de81b8efdc5130973e1506705e85a87592c921ca0418498959188d
 *   /studio       9f36880aa5001cd6027de62e6b11f517ab3b97da828e2730e75a1138db92ce38
 *   /news         c42b737ad0dbd5a4d21eec0b7aed94cbd95ffb82977813c09366cdc44ec9c74a
 *   /archive      6cb61257d84f911acb001e016c3a85cb05fc4cc9f63a021a9acef1ab48af3b6f
 *
 * Scope caveat: this hashes rendered markup plus the two hand-authored inline
 * scripts (THEME_SCRIPT and the JSON-LD). It does NOT guard the RSC payload, so
 * a change that alters only client-component wiring and leaves the visible DOM
 * identical will not move these — the CookieNotice timer fix is one such case.
 * Verify those by behaviour (Puppeteer), not by fingerprint.
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

  // 1. Strip Next's GENERATED scripts only — never "everything but an allowlist".
  //
  //    The rule is inverted deliberately. An allowlist is default-unsafe: every
  //    hand-authored script has to be remembered, and forgetting one silently
  //    drops it from the contract. That bit us once already — an earlier
  //    everything-but-ld+json rule erased the inline THEME_SCRIPT from
  //    src/app/(site)/layout.tsx, which is exactly the script whose localStorage
  //    key, if renamed, gives dark-mode users a flash of light on every reload.
  //    That regression would have moved no fingerprint at all.
  //
  //    Generated scripts carry one of two signatures, confirmed by enumerating
  //    all 30 script tags on `/`:
  //      - a `src` pointing into /_next/     (9 tags: content-hashed chunks)
  //      - a body containing `self.__next_f` (19 tags: RSC flight payload, which
  //        is where the random per-build `"b":"<id>"` lives)
  //    The remaining 2 are hand-authored and kept: THEME_SCRIPT and the JSON-LD
  //    block. Anything hand-authored added later is guarded by default.
  out = out.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (match, attrs, body) => {
    const isNextChunk = /\bsrc\s*=\s*["'][^"']*\/_next\//i.test(attrs);
    const isFlightPayload = /self\.__next_f/.test(body);
    return isNextChunk || isFlightPayload ? "" : match;
  });

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
