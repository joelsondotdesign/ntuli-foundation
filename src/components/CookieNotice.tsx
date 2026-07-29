"use client";

import { useEffect, useState } from "react";

export default function CookieNotice() {
  const [decided, setDecided] = useState(true);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("ntuli-cookie-choice");
    } catch {}
    if (stored) return;
    setDecided(false);
    const t = window.setTimeout(() => setShown(true), 1600);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!decided || shown) return;
    const t = window.setTimeout(() => setShown(false), 700);
    return () => window.clearTimeout(t);
  }, [decided, shown]);

  const choose = (choice: string) => {
    try {
      localStorage.setItem("ntuli-cookie-choice", choice);
    } catch {}
    setShown(false);
    window.setTimeout(() => setDecided(true), 700);
  };

  if (decided && !shown) return null;

  return (
    <aside className={`cookie${shown ? " is-in" : ""}`} role="region" aria-label="Cookie notice">
      <p>We use a small number of cookies to understand how the site is used. Nothing is sold, and nothing is shared with advertisers.</p>
      <div className="cookie-actions">
        <button className="decline" data-choice="declined" type="button" onClick={() => choose("declined")}>Decline</button>
        <button className="accept" data-choice="accepted" type="button" onClick={() => choose("accepted")}>Accept</button>
      </div>
    </aside>
  );
}
