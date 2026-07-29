"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ArchiveEntry } from "@/data/archive";

const PLAY_ICON = (
  <svg width="20" height="22" viewBox="0 0 20 22" fill="none" aria-hidden="true">
    <path d="M19 11 0 22V0l19 11Z" fill="#1E2126" />
  </svg>
);

type Filter = "all" | "Video" | "Writing";

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "Everything" },
  { value: "Video", label: "Video" },
  { value: "Writing", label: "Writing" },
];

export default function ArchiveGrid({ entries }: { entries: ArchiveEntry[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [current, setCurrent] = useState(-1);
  const closeRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  /* The index of the entry currently on screen. `current` is already -1 by
     the time the close cleanup runs, so the last displayed index is latched
     here for the focus restore to read. */
  const shownIndexRef = useRef(-1);

  const visible = filter === "all" ? entries : entries.filter((e) => e.kind === filter);
  const isOpen = current >= 0 && current < visible.length;
  const item = isOpen ? visible[current] : undefined;

  const close = useCallback(() => setCurrent(-1), []);
  const step = useCallback(
    (delta: number) =>
      setCurrent((c) => {
        const next = c + delta;
        return next >= 0 && next < visible.length ? next : c;
      }),
    [visible.length],
  );

  /* Scroll lock, and return focus to the card matching the entry that was on
     screen at close time — not the card that originally opened the overlay,
     since prev/next may have moved on since. archive.js:258 did the same with
     grid.querySelector('[data-index="' + current + '"]'). */
  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add("overlay-open");
    return () => {
      document.body.classList.remove("overlay-open");
      gridRef.current
        ?.querySelector<HTMLElement>(`[data-index="${shownIndexRef.current}"]`)
        ?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, close, step]);

  /* archive.js focused the close control on every open(), including
     prev/next steps. Same here. Latching the displayed index alongside it
     keeps the two in step: React runs every cleanup before any effect body,
     so the close cleanup above still sees the last displayed index. */
  useEffect(() => {
    if (!isOpen) return;
    shownIndexRef.current = current;
    closeRef.current?.focus();
  }, [isOpen, current]);

  /* Changing filter invalidates the open index. */
  useEffect(() => setCurrent(-1), [filter]);

  return (
    <>
      <div className="archive-filters" role="group" aria-label="Filter the archive">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            className={value === filter ? "filter-btn is-active" : "filter-btn"}
            data-filter={value}
            type="button"
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="archive-grid" data-archive-grid ref={gridRef}>
        {visible.length === 0 ? (
          <p className="archive-empty">Nothing in this part of the archive yet.</p>
        ) : (
          visible.map((entry, i) => (
            <button key={entry.title} className="archive-card" data-index={i} type="button" onClick={() => setCurrent(i)}>
              {entry.image ? (
                <div className="media">
                  <img src={entry.image} alt="" />
                  {entry.kind === "Video" && <span className="play">{PLAY_ICON}</span>}
                </div>
              ) : (
                <div className="media is-text">
                  <span className="excerpt">{entry.excerpt ?? ""}</span>
                </div>
              )}
              <span className="kind">{entry.kind}</span>
              <h3>{entry.title}</h3>
              <span className="meta">{entry.meta ?? ""}</span>
            </button>
          ))
        )}
      </div>

      {/* Structure mirrors archive.html:91-108 — the controls are siblings
          of .overlay-panel, positioned against .overlay. */}
      <div
        className={`overlay${isOpen ? " is-open" : ""}`}
        data-overlay
        aria-hidden={!isOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Archive item"
      >
        <div className="overlay-backdrop" data-overlay-close onClick={close} />

        <button
          ref={closeRef}
          className="overlay-ctrl overlay-close"
          data-overlay-close
          type="button"
          aria-label="Close"
          onClick={close}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>

        <button
          className="overlay-ctrl overlay-arrow prev"
          data-overlay-prev
          type="button"
          aria-label="Previous item"
          disabled={current <= 0}
          onClick={() => step(-1)}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 4l-8 8 8 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          className="overlay-ctrl overlay-arrow next"
          data-overlay-next
          type="button"
          aria-label="Next item"
          disabled={current === visible.length - 1}
          onClick={() => step(1)}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 4l8 8-8 8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <span className="overlay-count" data-overlay-count aria-live="polite">
          {isOpen ? `${current + 1} of ${visible.length}` : ""}
        </span>

        <div className="overlay-panel">
          <div className="overlay-media" data-overlay-media>
            {item && <OverlayMedia item={item} />}
          </div>
          <div className="overlay-body" data-overlay-body>
            {item && (
              <>
                <span className="kind">{item.kind}</span>
                <h2>{item.title}</h2>
                <div className="meta">{item.meta ?? ""}</div>
                <div className="prose">
                  {(item.body ?? []).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                {(item.pdf || item.link) && (
                  <div className="overlay-actions">
                    {item.pdf && (
                      <a className="btn btn-dark" href={item.pdf} target="_blank" rel="noopener">
                        Open the PDF <span aria-hidden="true">→</span>
                      </a>
                    )}
                    {item.link && (
                      <a className="btn btn-outline" href={item.link.href} target="_blank" rel="noopener">
                        {item.link.label} <span aria-hidden="true">→</span>
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function OverlayMedia({ item }: { item: ArchiveEntry }) {
  if (item.embed?.provider === "youtube") {
    const src = `https://www.youtube-nocookie.com/embed/${item.embed.id}${item.embed.start ? `?start=${item.embed.start}` : ""}`;
    return (
      <iframe
        src={src}
        title={item.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  if (item.embed?.provider === "instagram") {
    return <iframe src={`${item.embed.url.replace(/\/?$/, "/")}embed`} title={item.title} allowFullScreen />;
  }
  if (item.placeholder) {
    return (
      <div className="missing">
        <strong>Recording not yet uploaded</strong>
        <span>Add a YouTube or Instagram link to this entry and it will play here.</span>
      </div>
    );
  }
  return item.image ? <img src={item.image} alt="" /> : null;
}
