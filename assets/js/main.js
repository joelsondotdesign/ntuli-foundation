/* The Ntuli Foundation — interactions
   - Loading animation on FIRST page load only (sessionStorage flag);
     navigating between pages never shows it again.
   - Subtle reveal-on-scroll for section content.
   - What we do page: two pinned, scroll-driven sequences
     (UbuSuSu portal merge + six commitments card fade), built with
     GSAP ScrollTrigger. Sections stay fixed until their animation
     completes, then release.
   - Sticky navigation that gains a backdrop once the page scrolls.
   - Cookie notice that slides in quietly, remembered in localStorage.
   - Archive overlay: filterable grid, keyboard-navigable modal.
*/

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- sticky nav ---------- */

  var nav = document.querySelector(".nav");
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle("is-stuck", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- cookie notice ---------- */

  var cookie = document.querySelector(".cookie");
  if (cookie) {
    if (localStorage.getItem("ntuli-cookie-choice")) {
      cookie.remove();
    } else {
      /* let the page settle before it drifts in */
      setTimeout(function () { cookie.classList.add("is-in"); }, 1600);
      cookie.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-choice]");
        if (!btn) return;
        localStorage.setItem("ntuli-cookie-choice", btn.dataset.choice);
        cookie.classList.remove("is-in");
        setTimeout(function () { cookie.remove(); }, 700);
      });
    }
  }

  /* ---------- first-load-only loader ---------- */

  var loader = document.querySelector(".loader");
  if (loader) {
    var seen = sessionStorage.getItem("ntuli-visited");
    if (seen || reducedMotion) {
      loader.remove();
      document.documentElement.classList.remove("loading");
    } else {
      sessionStorage.setItem("ntuli-visited", "1");
      window.addEventListener("load", function () {
        setTimeout(function () {
          loader.classList.add("is-done");
          document.documentElement.classList.remove("loading");
          setTimeout(function () { loader.remove(); }, 800);
        }, 900);
      });
    }
  }

  /* ---------- reveal on scroll ---------- */

  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window && !reducedMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) {
      /* anything already in (or above) the first viewport shows instantly —
         the observer only animates content scrolled into view later */
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.95) {
        el.classList.add("is-in");
      } else {
        io.observe(el);
      }
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- pinned scroll sequences (what we do page) ---------- */

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  /* Portal: three arches converge into one while the section is pinned. */
  var portal = document.querySelector(".portal-section");
  if (portal && !reducedMotion) {
    var archLeft = portal.querySelector(".arch--left");
    var archCenter = portal.querySelector(".arch--center");
    var archRight = portal.querySelector(".arch--right");
    var labels = portal.querySelectorAll(".arch-label");
    var wordmark = portal.querySelector(".portal-wordmark");

    /* starting spread */
    gsap.set(archLeft, { xPercent: -50, x: -252 });
    gsap.set(archRight, { xPercent: -50, x: 252 });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: portal,
        start: "top top",
        end: "+=1600",
        pin: true,
        scrub: 0.6,
        anticipatePin: 1
      }
    });

    var ochreOverlay = portal.querySelector(".arch-ochre-overlay");

    tl.to(archLeft, { x: 0, ease: "none", duration: 1 }, 0)
      .to(archRight, { x: 0, ease: "none", duration: 1 }, 0)
      .to(ochreOverlay, { opacity: 1, ease: "none", duration: 0.5 }, 0.25)
      .to(labels, { opacity: 0.25, ease: "none", duration: 0.5 }, 0.15)
      .to(labels, { opacity: 0, ease: "none", duration: 0.3 }, 0.7)
      .to([archLeft, archRight], { opacity: 0, ease: "none", duration: 0.25 }, 0.8)
      .to(archCenter, { scale: 1.12, transformOrigin: "50% 100%", ease: "none", duration: 0.4 }, 0.75)
      .fromTo(
        wordmark,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, ease: "none", duration: 0.45 },
        0.72
      );
  }

  /* Six commitments: the section pins and the highlight walks down the
     list, lighting one row at a time as the user scrolls. */
  var commitments = document.querySelector(".commitments");
  if (commitments && !reducedMotion) {
    var rows = commitments.querySelectorAll(".commit-row");
    var ctl = gsap.timeline({
      scrollTrigger: {
        trigger: commitments,
        start: "top top",
        end: "+=" + (rows.length * 280),
        pin: true,
        scrub: 0.6,
        anticipatePin: 1
      }
    });
    rows.forEach(function (row, i) {
      ctl.to(row, { opacity: 1, ease: "none", duration: 0.8 }, i);
      if (i > 0) {
        ctl.to(rows[i - 1], { opacity: 0.28, ease: "none", duration: 0.8 }, i);
      }
    });
  }

  /* Reduced motion: show everything at rest. */
  if (reducedMotion) {
    document.querySelectorAll(".commit-row").forEach(function (c) { c.style.opacity = 1; });
    var wm = document.querySelector(".portal-wordmark");
    if (wm) wm.style.opacity = 1;
    var oo = document.querySelector(".arch-ochre-overlay");
    if (oo) oo.style.opacity = 1;
  }
})();
