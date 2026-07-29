"use client";

import { useEffect, useRef, useState } from "react";

export default function CookieNotice() {
  const [decided, setDecided] = useState(true);
  const [shown, setShown] = useState(false);
  const showTimer = useRef(0);
  const hideTimer = useRef(0);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("ntuli-cookie-choice");
    } catch {}
    if (!stored) {
      setDecided(false);
      showTimer.current = window.setTimeout(() => setShown(true), 1600);
    }
    return () => {
      window.clearTimeout(showTimer.current);
      window.clearTimeout(hideTimer.current);
    };
  }, []);

  const choose = (choice: string) => {
    try {
      localStorage.setItem("ntuli-cookie-choice", choice);
    } catch {}
    // Cancel the pending auto-show. The buttons are reachable by keyboard while
    // the banner is still translated off-screen, so a choice can land before the
    // 1600ms timer fires. Left running, it would setShown(true) afterwards, flip
    // the `decided && !shown` guard below back to false, and the dismissed banner
    // would reappear with `is-in` and stay there.
    window.clearTimeout(showTimer.current);
    setShown(false);
    hideTimer.current = window.setTimeout(() => setDecided(true), 700);
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
