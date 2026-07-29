"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SiteScripts() {
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];

    /* ---------- sticky nav ---------- */
    const nav = document.querySelector(".nav");
    if (nav) {
      const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 24);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }

    /* ---------- mobile menu ---------- */
    const navToggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
    const navLinks = document.querySelector(".nav-links");
    if (navToggle && navLinks) {
      const onToggle = () => {
        const open = navLinks.classList.toggle("is-open");
        navToggle.classList.toggle("is-open", open);
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      };
      navToggle.addEventListener("click", onToggle);
      cleanups.push(() => navToggle.removeEventListener("click", onToggle));
    }

    /* ---------- first-load-only loader ---------- */
    const loader = document.querySelector(".loader");
    if (loader) {
      const seen = sessionStorage.getItem("ntuli-visited");
      if (seen || reducedMotion) {
        loader.remove();
        document.documentElement.classList.remove("loading");
      } else {
        sessionStorage.setItem("ntuli-visited", "1");

        let doneTimer = 0;
        let removeLoaderTimer = 0;
        cleanups.push(() => {
          window.clearTimeout(doneTimer);
          window.clearTimeout(removeLoaderTimer);
        });

        const finish = () => {
          doneTimer = window.setTimeout(() => {
            loader.classList.add("is-done");
            document.documentElement.classList.remove("loading");
            removeLoaderTimer = window.setTimeout(() => loader.remove(), 800);
          }, 900);
        };
        if (document.readyState === "complete") finish();
        else {
          window.addEventListener("load", finish);
          cleanups.push(() => window.removeEventListener("load", finish));
        }
      }
    }

    /* ---------- reveal on scroll ---------- */
    const revealEls = document.querySelectorAll(".reveal");
    if (revealEls.length && "IntersectionObserver" in window && !reducedMotion) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 },
      );
      revealEls.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.95) el.classList.add("is-in");
        else io.observe(el);
      });
      cleanups.push(() => io.disconnect());
    } else {
      revealEls.forEach((el) => el.classList.add("is-in"));
    }

    /* ---------- pinned sequences ---------- */
    const ctx = gsap.context(() => {
      const portal = document.querySelector(".portal-section");
      if (portal && !reducedMotion) {
        const archLeft = portal.querySelector(".arch--left");
        const archCenter = portal.querySelector(".arch--center");
        const archRight = portal.querySelector(".arch--right");
        const labels = portal.querySelectorAll(".arch-label");
        const wordmark = portal.querySelector(".portal-wordmark");
        const ochreOverlay = portal.querySelector(".arch-ochre-overlay");

        gsap.set(archLeft, { xPercent: -50, x: -252 });
        gsap.set(archRight, { xPercent: -50, x: 252 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: portal, start: "top top", end: "+=1600", pin: true, scrub: 0.6, anticipatePin: 1 },
        });

        tl.to(archLeft, { x: 0, ease: "none", duration: 1 }, 0)
          .to(archRight, { x: 0, ease: "none", duration: 1 }, 0)
          .to(ochreOverlay, { opacity: 1, ease: "none", duration: 0.5 }, 0.25)
          .to(labels, { opacity: 0.25, ease: "none", duration: 0.5 }, 0.15)
          .to(labels, { opacity: 0, ease: "none", duration: 0.3 }, 0.7)
          .to([archLeft, archRight], { opacity: 0, ease: "none", duration: 0.25 }, 0.8)
          .to(archCenter, { scale: 1.12, transformOrigin: "50% 100%", ease: "none", duration: 0.4 }, 0.75)
          .fromTo(wordmark, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, ease: "none", duration: 0.45 }, 0.72);
      }

      const commitments = document.querySelector(".commitments");
      if (commitments && !reducedMotion) {
        const rows = commitments.querySelectorAll(".commit-row");
        const ctl = gsap.timeline({
          scrollTrigger: { trigger: commitments, start: "top top", end: "+=" + rows.length * 280, pin: true, scrub: 0.6, anticipatePin: 1 },
        });
        rows.forEach((row, i) => {
          ctl.to(row, { opacity: 1, ease: "none", duration: 0.8 }, i);
          if (i > 0) ctl.to(rows[i - 1], { opacity: 0.28, ease: "none", duration: 0.8 }, i);
        });
      }
    });
    cleanups.push(() => ctx.revert());

    /* Pinned triggers measure at creation; webfonts and images settle later. */
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);
    cleanups.push(() => window.removeEventListener("load", refresh));

    /* ---------- reduced motion at rest ---------- */
    if (reducedMotion) {
      document.querySelectorAll<HTMLElement>(".commit-row").forEach((c) => (c.style.opacity = "1"));
      const wm = document.querySelector<HTMLElement>(".portal-wordmark");
      if (wm) wm.style.opacity = "1";
      const oo = document.querySelector<HTMLElement>(".arch-ochre-overlay");
      if (oo) oo.style.opacity = "1";
    }

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
