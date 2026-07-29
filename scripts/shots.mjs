// scripts/shots.mjs
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "/tmp/ntuli-shots";
const PAGES = [
  ["home", "/", "/index.html"],
  ["what-we-do", "/what-we-do", "/what-we-do.html"],
  ["our-team", "/our-team", "/our-team.html"],
  ["studio", "/studio", "/studio.html"],
  ["news", "/news", "/news.html"],
  ["archive", "/archive", "/archive.html"],
];
const WIDTHS = [[1440, 2400], [390, 1600]];

mkdirSync(OUT, { recursive: true });

/* Port 3100: the ported Next.js build. Port 3200: the pre-port HTML
   worktree pinned in Task 1. Both local, so neither is subject to
   network variance or a stale deploy. */
const server = spawn("npx", ["next", "start", "-p", "3100"], { stdio: "ignore" });
const baseline = spawn("python3", ["-m", "http.server", "3200", "-d", "/tmp/ntuli-baseline"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 6000));

const shoot = (url, out, w, h) =>
  spawnSync(CHROME, [
    "--headless", "--disable-gpu", "--hide-scrollbars",
    `--window-size=${w},${h}`, "--virtual-time-budget=8000",
    `--screenshot=${out}`, `--user-data-dir=${OUT}/profile-${Date.now()}`, url,
  ], { stdio: "ignore" });

for (const [name, newPath, oldPath] of PAGES) {
  for (const [w, h] of WIDTHS) {
    shoot(`http://localhost:3100${newPath}`, `${OUT}/${name}-${w}-new.png`, w, h);
    shoot(`http://localhost:3200${oldPath}`, `${OUT}/${name}-${w}-old.png`, w, h);
    console.log(`shot ${name} @ ${w}`);
  }
}

server.kill();
baseline.kill();
console.log(`\nScreenshots in ${OUT}`);
