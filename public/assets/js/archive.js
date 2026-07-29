/* The Ntuli Foundation — Archive
   ---------------------------------------------------------------
   Everything the archive shows is defined in ARCHIVE below. To add a
   piece, copy an entry and fill it in — no other file needs touching.

     kind      "Video" | "Writing"  (shown on the card, drives filtering)
     title     headline
     meta      date / publication / venue line
     image     thumbnail path (use a real still wherever possible)
     excerpt   one or two sentences, shown on writing cards
     body      array of paragraphs shown inside the overlay
     embed     { provider: "youtube", id: "…", start: 44 }  ← video id,
               optional start time in seconds
               { provider: "instagram", url: "…" } ← reel permalink
               omit entirely for a piece with no recording yet
     link      { href, label } optional outbound link
     pdf       optional URL or path to a PDF of the full text — shown
               as a prominent "Open the PDF" button in the overlay
   --------------------------------------------------------------- */

var ARCHIVE = [
  {
    kind: "Writing",
    title: "Palestine in My Heart",
    meta: "2026 · Poetry collection · Botsotso",
    image: "assets/img/news-book.jpg",
    excerpt:
      "A collection blending lyrical empathy and satire in solidarity with Palestine, illustrated with the poet's own sculptures.",
    body: [
      "A new poetry collection from sculptor-poet Pitika Ntuli, blending lyrical empathy and satire in solidarity with Palestine — illustrated with his own sculptures.",
      "Published by Botsotso, the collection continues a lifelong practice in which poem and sculpture are made in the same breath: the written line and the carved line reaching for the same act of witness."
    ],
    link: {
      href: "https://www.amazon.fr/-/en/Pitika-Ntuli/dp/0639878504",
      label: "View the book"
    }
  },
  {
    kind: "Writing",
    title: "Freedom Charter at 70: its value has been lost",
    meta: "2026 · Opinion · SABC Channel Africa",
    image: "assets/img/news-freedom.jpg",
    excerpt:
      "Prof Ntuli reflects on seventy years of the Freedom Charter, and on the distance between the promise and the country that followed.",
    body: [
      "Marking the seventieth anniversary of the Freedom Charter, Prof Pitika Ntuli reflects on promises abandoned, the drift of neo-colonialism, and the urgent need for an ideology capable of carrying the charter forward.",
      "The full interview is published by SABC Channel Africa."
    ],
    link: {
      href: "http://web.sabc.co.za/sabc/home/channelafrica/news/details?id=753e6f0e-8657-4dfc-afcf-3ad3aaf99c82&title=SA%20has%20betrayed%20Freedom%20Charter:%20Professor%20%C2%A0",
      label: "Read the interview"
    }
  },
  {
    kind: "Writing",
    title: "Junkyard Dogs: turning waste into witness",
    meta: "2026 · Exhibition · The Melrose Gallery",
    image: "assets/img/news-junkyard.webp",
    excerpt:
      "Pitika Ntuli and Willie Bester reassemble industrial waste into fierce, unflinching sculpture.",
    body: [
      "Two South African icons, Pitika Ntuli and Willie Bester, reassemble industrial waste into fierce, unflinching sculptures — industry re-membered into witness.",
      "Presented as a viewing room by The Melrose Gallery."
    ],
    link: {
      href: "https://themelrosegallery.com/viewing-room/49-junkyard-dogs-with-pitika-ntuli-and-willie-bester/",
      label: "Enter the viewing room"
    }
  },
  {
    kind: "Video",
    title: "Eating my Art",
    meta: "Documentary \u00b7 HISTORY AFRICA",
    image: "https://i.ytimg.com/vi/EQwz7M7ZlqM/hqdefault.jpg",
    embed: { provider: "youtube", id: "EQwz7M7ZlqM", start: 44 },
    body: [
      "Prof Pitika Ntuli on a practice where nothing is wasted and everything is transformed: bone, the material of memory, carved into works that feed the spirit."
    ]
  },
  {
    kind: "Video",
    title: "Never lose the child inside you",
    meta: "Conversation \u00b7 Sir Max Network",
    image: "https://i.ytimg.com/vi/rj-FctAmgjk/hqdefault.jpg",
    embed: { provider: "youtube", id: "rj-FctAmgjk" },
    body: [
      "Prof Ntuli on play, curiosity and the child's eye as the wellspring of a lifetime of making."
    ]
  },
  {
    kind: "Video",
    title: "Resurrecting memory through sculpture",
    meta: "Podcast, episode 24 \u00b7 Sir Max Network",
    image: "https://i.ytimg.com/vi/-F5ePSm3HHc/hqdefault.jpg",
    embed: { provider: "youtube", id: "-F5ePSm3HHc" },
    body: [
      "A long-form conversation with Prof Pitika Ntuli on sculpture as an act of re-membering: recovering what history scattered and giving it form again."
    ]
  },
  {
    kind: "Video",
    title: "Pitika Ntuli: sculptor, poet and former freedom fighter",
    meta: "Interview \u00b7 eNCA",
    image: "https://i.ytimg.com/vi/r_zSByDvknI/hqdefault.jpg",
    embed: { provider: "youtube", id: "r_zSByDvknI" },
    body: [
      "eNCA profiles Prof Ntuli across the three lives he has lived at once: the sculptor, the poet, and the freedom fighter in exile."
    ]
  }
];

(function () {
  "use strict";

  var grid = document.querySelector("[data-archive-grid]");
  if (!grid) return;

  var overlay = document.querySelector("[data-overlay]");
  var filters = document.querySelectorAll("[data-filter]");
  var visible = ARCHIVE.slice();
  var current = -1;

  var PLAY_ICON =
    '<svg width="20" height="22" viewBox="0 0 20 22" fill="none" aria-hidden="true">' +
    '<path d="M19 11 0 22V0l19 11Z" fill="#1E2126"/></svg>';

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- grid ---------- */

  function cardMarkup(item, i) {
    var media = item.image
      ? '<div class="media"><img src="' + esc(item.image) + '" alt="" />' +
        (item.kind === "Video" ? '<span class="play">' + PLAY_ICON + "</span>" : "") +
        "</div>"
      : '<div class="media is-text"><span class="excerpt">' + esc(item.excerpt || "") + "</span></div>";

    return (
      '<button class="archive-card" data-index="' + i + '" type="button">' +
      media +
      '<span class="kind">' + esc(item.kind) + "</span>" +
      "<h3>" + esc(item.title) + "</h3>" +
      '<span class="meta">' + esc(item.meta || "") + "</span>" +
      "</button>"
    );
  }

  function render(list) {
    visible = list;
    grid.innerHTML = list.length
      ? list.map(cardMarkup).join("")
      : '<p class="archive-empty">Nothing in this part of the archive yet.</p>';
  }

  render(ARCHIVE);

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filters.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var kind = btn.dataset.filter;
      render(kind === "all" ? ARCHIVE.slice() : ARCHIVE.filter(function (it) { return it.kind === kind; }));
    });
  });

  grid.addEventListener("click", function (e) {
    var card = e.target.closest(".archive-card");
    if (card) open(parseInt(card.dataset.index, 10));
  });

  /* ---------- overlay ---------- */

  if (!overlay) return;

  var mediaSlot = overlay.querySelector("[data-overlay-media]");
  var bodySlot = overlay.querySelector("[data-overlay-body]");
  var countSlot = overlay.querySelector("[data-overlay-count]");
  var prevBtn = overlay.querySelector("[data-overlay-prev]");
  var nextBtn = overlay.querySelector("[data-overlay-next]");
  var panel = overlay.querySelector(".overlay-panel");

  function mediaMarkup(item) {
    if (item.embed && item.embed.provider === "youtube") {
      return (
        '<iframe src="https://www.youtube-nocookie.com/embed/' + esc(item.embed.id) +
        (item.embed.start ? "?start=" + parseInt(item.embed.start, 10) : "") +
        '" title="' + esc(item.title) +
        '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      );
    }
    if (item.embed && item.embed.provider === "instagram") {
      return (
        '<iframe src="' + esc(item.embed.url.replace(/\/?$/, "/")) + 'embed" title="' +
        esc(item.title) + '" allowfullscreen></iframe>'
      );
    }
    if (item.placeholder) {
      return (
        '<div class="missing"><strong>Recording not yet uploaded</strong>' +
        "<span>Add a YouTube or Instagram link to this entry in archive.js and it will play here.</span></div>"
      );
    }
    return item.image ? '<img src="' + esc(item.image) + '" alt="" />' : "";
  }

  function actionsMarkup(item) {
    var actions = [];
    if (item.pdf) {
      actions.push(
        '<a class="btn btn-dark" href="' + esc(item.pdf) + '" target="_blank" rel="noopener">Open the PDF <span aria-hidden="true">→</span></a>'
      );
    }
    if (item.link) {
      actions.push(
        '<a class="btn btn-outline" href="' + esc(item.link.href) + '" target="_blank" rel="noopener">' +
        esc(item.link.label) + ' <span aria-hidden="true">→</span></a>'
      );
    }
    return actions.length ? '<div class="overlay-actions">' + actions.join("") + "</div>" : "";
  }

  function open(i) {
    current = i;
    var item = visible[i];
    if (!item) return;

    mediaSlot.innerHTML = mediaMarkup(item);
    bodySlot.innerHTML =
      '<span class="kind">' + esc(item.kind) + "</span>" +
      "<h2>" + esc(item.title) + "</h2>" +
      '<div class="meta">' + esc(item.meta || "") + "</div>" +
      '<div class="prose">' +
      (item.body || []).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") +
      "</div>" +
      actionsMarkup(item);

    countSlot.textContent = i + 1 + " of " + visible.length;
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === visible.length - 1;

    overlay.classList.add("is-open");
    document.body.classList.add("overlay-open");
    overlay.setAttribute("aria-hidden", "false");
    if (panel) panel.scrollTop = 0;
    overlay.querySelector(".overlay-close").focus();
  }

  function close() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overlay-open");
    /* stop any playing embed */
    setTimeout(function () { mediaSlot.innerHTML = ""; }, 300);
    var card = grid.querySelector('[data-index="' + current + '"]');
    if (card) card.focus();
  }

  function step(delta) {
    var next = current + delta;
    if (next >= 0 && next < visible.length) open(next);
  }

  overlay.addEventListener("click", function (e) {
    if (e.target.closest("[data-overlay-close]") || e.target.classList.contains("overlay-backdrop")) close();
    if (e.target.closest("[data-overlay-prev]")) step(-1);
    if (e.target.closest("[data-overlay-next]")) step(1);
  });

  document.addEventListener("keydown", function (e) {
    if (!overlay.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
})();
