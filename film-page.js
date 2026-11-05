/* =========================================================
   film-page.js
   Reads ?id= from the address, finds the film in window.FILMS,
   and builds the page. Every value is inserted as text,
   so no film data can inject HTML.
   ========================================================= */
(function () {
  "use strict";

  var root = document.getElementById("filmRoot");
  if (!root) return;

  try {
    var films = (Array.isArray(window.FILMS) ? window.FILMS : [])
      .filter(function (f) { return f && typeof f.id === "string" && f.id !== ""; })
      .slice()
      .sort(function (a, b) { return a.year - b.year; });

    var params = new URLSearchParams(window.location.search);
    var id = params.get("id") || "";

    var index = -1;
    for (var i = 0; i < films.length; i++) {
      if (films[i].id === id) { index = i; break; }
    }

    /* ----- Helpers ----- */
    function el(tag, attrs, kids) {
      var node = document.createElement(tag);
      if (attrs) {
        Object.keys(attrs).forEach(function (key) {
          if (key === "class") node.className = attrs[key];
          else if (key === "text") node.textContent = attrs[key];
          else node.setAttribute(key, attrs[key]);
        });
      }
      (kids || []).forEach(function (kid) {
        if (kid === null || kid === undefined || kid === false) return;
        node.appendChild(kid instanceof Node ? kid : document.createTextNode(String(kid)));
      });
      return node;
    }

    function isSafeHttpsUrl(url) {
      try { return new URL(url).protocol === "https:"; } catch (e) { return false; }
    }

    function isSafeImagePath(path) {
      return typeof path === "string" && /^[A-Za-z0-9_\-\/.]+\.(jpg|jpeg|png|webp)$/i.test(path);
    }

    function isValidYoutubeId(value) {
      return typeof value === "string" && /^[A-Za-z0-9_-]{11}$/.test(value);
    }

    function setMetaDescription(text) {
      var meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", text);
    }

    /* ----- Not found ----- */
    function renderNotFound() {
      document.title = "Film not found | Shah Rukh Khan";
      root.appendChild(el("section", { class: "fp-notfound" }, [
        el("div", null, [
          el("p", { class: "eyebrow", text: "Not found" }),
          el("h1", { class: "fp-title", text: "This film is not in the list" }),
          el("p", { text: "The link may be old, or the film may have been removed." }),
          el("a", { class: "btn btn-primary", href: "index.html#films", text: "Back to all films" })
        ])
      ]));
    }

    /* ----- Film page ----- */
    function renderFilm(film) {
      var prev = index > 0 ? films[index - 1] : null;
      var next = index < films.length - 1 ? films[index + 1] : null;
      var hasPoster = isSafeImagePath(film.poster);
      var hasTrailer = isValidYoutubeId(film.trailerId);
      var hasSynopsis = typeof film.synopsis === "string" && film.synopsis.trim() !== "";
      var awards = Array.isArray(film.awards)
        ? film.awards.filter(function (a) { return typeof a === "string" && a.trim() !== ""; })
        : [];

      document.title = film.title + " | Shah Rukh Khan";
      setMetaDescription(film.title + " (" + film.year + "): details, cast and awards.");

      /* Hero */
      var backdrop = el("div", { class: "fp-backdrop" });
      if (hasPoster) backdrop.style.backgroundImage = 'url("' + film.poster + '")';

      var posterBox = el("div", { class: "fp-poster" }, [
        el("span", { class: "fp-poster-title", text: film.title })
      ]);
      if (hasPoster) {
        var img = el("img", { src: film.poster, alt: film.title + " poster" });
        img.onerror = function () { img.remove(); };
        posterBox.insertBefore(img, posterBox.firstChild);
      }

      var chips = [String(film.year)];
      if (film.role) chips.push(film.role);
      if (film.director) chips.push("Dir. " + film.director);

      var actions = [];
      if (hasTrailer) actions.push(el("a", { class: "btn btn-primary", href: "#trailer", text: "Watch trailer" }));
      actions.push(el("a", { class: "btn btn-ghost", href: "index.html#films", text: "Back to films" }));

      var info = el("div", { class: "fp-info" }, [
        el("p", { class: "eyebrow", text: "Filmography" }),
        el("h1", { class: "fp-title", text: film.title }),
        el("div", { class: "fp-chips" }, chips.map(function (c) {
          return el("span", { class: "fp-chip", text: c });
        })),
        el("div", { class: "fp-actions" }, actions)
      ]);

      var hero = el("section", { class: "fp-hero" }, [
        backdrop,
        el("div", { class: "container fp-hero-grid" }, [posterBox, info])
      ]);

      /* Main content */
      var synopsisCard = el("div", { class: "fp-card" }, [
        el("h2", { text: "Synopsis" }),
        el("p", {
          class: hasSynopsis ? "" : "fp-empty",
          text: hasSynopsis
            ? film.synopsis
            : "Synopsis coming soon. Add a verified summary for this film in films-data.js."
        })
      ]);

      var awardsBody = awards.length
        ? el("ul", { class: "fp-awards" }, awards.map(function (a) { return el("li", { text: a }); }))
        : el("p", { class: "fp-empty", text: "No awards added yet. Add verified awards in films-data.js." });

      var awardsCard = el("div", { class: "fp-card" }, [
        el("h2", { text: "Awards and recognition" }),
        awardsBody
      ]);

      var factRows = [
        ["Release year", String(film.year)],
        ["Role", film.role || "-"],
        ["Director", film.director || "-"]
      ].map(function (row) {
        return el("li", null, [
          el("span", { text: row[0] }),
          el("span", { text: row[1] })
        ]);
      });

      if (isSafeHttpsUrl(film.source)) {
        factRows.push(el("li", null, [
          el("span", { text: "Source" }),
          el("a", { href: film.source, target: "_blank", rel: "noopener noreferrer", text: "View source" })
        ]));
      }

      var factsCard = el("div", { class: "fp-card" }, [
        el("h2", { text: "Quick facts" }),
        el("ul", { class: "fp-facts" }, factRows)
      ]);

      var content = el("section", { class: "fp-section" }, [
        el("div", { class: "container fp-grid-2" }, [
          el("div", { class: "fp-stack" }, [synopsisCard, awardsCard]),
          factsCard
        ])
      ]);

      root.appendChild(hero);
      root.appendChild(content);

      /* Trailer */
      if (hasTrailer) {
        root.appendChild(el("section", { class: "fp-section alt", id: "trailer" }, [
          el("div", { class: "container" }, [
            el("p", { class: "eyebrow", text: "Trailer" }),
            el("h2", { class: "section-title", text: "Watch the official trailer" }),
            el("div", { class: "fp-video" }, [
              el("iframe", {
                src: "https://www.youtube-nocookie.com/embed/" + film.trailerId,
                title: film.title + " trailer",
                allow: "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
                allowfullscreen: ""
              })
            ])
          ])
        ]));
      }

      /* Previous and next films */
      var pagerLinks = [];
      if (prev) {
        pagerLinks.push(el("a", { class: "prev", href: "film.html?id=" + encodeURIComponent(prev.id) }, [
          el("small", { text: "Previous film" }),
          el("strong", { text: prev.title })
        ]));
      }
      if (next) {
        pagerLinks.push(el("a", { class: "next", href: "film.html?id=" + encodeURIComponent(next.id) }, [
          el("small", { text: "Next film" }),
          el("strong", { text: next.title })
        ]));
      }
      if (pagerLinks.length) {
        root.appendChild(el("section", { class: "fp-section" }, [
          el("div", { class: "container" }, [
            el("nav", { class: "fp-pager", "aria-label": "Other films" }, pagerLinks)
          ])
        ]));
      }
    }

    if (index === -1) renderNotFound();
    else renderFilm(films[index]);
  } catch (err) {
    console.error("Film page failed:", err);
    root.textContent = "Sorry, this page could not be loaded. Please go back and try again.";
  }
})();
/* =========================================================
   FILM DETAIL PAGE
   ========================================================= */
body.film-page { background: var(--bg); }

.fp-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: var(--header-h);
  z-index: 100;
  background: rgba(11, 11, 15, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}

.fp-header-inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fp-back {
  font-size: 0.9rem;
  color: var(--muted);
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  transition: color 0.25s, border-color 0.25s;
}
.fp-back:hover { color: var(--gold); border-color: var(--gold); }

/* Hero */
.fp-hero {
  position: relative;
  min-height: 92vh;
  padding: calc(var(--header-h) + 60px) 0 80px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: linear-gradient(160deg, #1a1a24 0%, #0b0b0f 100%);
}

.fp-backdrop {
  position: absolute;
  inset: -40px;
  background-size: cover;
  background-position: center 30%;
  filter: blur(28px) brightness(0.35);
  transform: scale(1.1);
}

.fp-hero .container { position: relative; z-index: 1; }

.fp-hero-grid {
  display: grid;
  grid-template-columns: minmax(220px, 340px) 1fr;
  gap: 56px;
  align-items: center;
}

.fp-poster {
  position: relative;
  aspect-ratio: 2 / 3;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
  background: linear-gradient(145deg, #2a2a38, #13131a);
  display: flex;
  align-items: flex-end;
  padding: 22px;
}

.fp-poster img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fp-poster-title {
  position: relative;
  z-index: 1;
  font-family: Georgia, serif;
  font-size: 1.3rem;
  line-height: 1.3;
  color: var(--text);
}

.fp-title {
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  color: var(--text);
  margin-bottom: 16px;
}

.fp-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 26px;
}

.fp-chip {
  padding: 6px 14px;
  border: 1px solid rgba(212, 168, 75, 0.35);
  border-radius: 999px;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gold);
}

.fp-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* Sections */
.fp-section { padding: 80px 0; }
.fp-section.alt { background: var(--bg-alt); }

.fp-grid-2 {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 40px;
  align-items: start;
}

.fp-stack { display: grid; gap: 24px; }

.fp-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 28px;
  box-shadow: var(--shadow);
}

.fp-card h2 {
  font-size: 1.5rem;
  margin-bottom: 14px;
  color: var(--text);
}

.fp-empty { color: var(--muted); font-style: italic; }

.fp-facts {
  list-style: none;
  margin: 0;
  padding: 0;
}

.fp-facts li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.95rem;
}
.fp-facts li:last-child { border-bottom: none; }
.fp-facts li > span:first-child { color: var(--muted); }
.fp-facts li > span:last-child,
.fp-facts li > a { color: var(--text); text-align: right; }
.fp-facts a { color: var(--gold); }
.fp-facts a:hover { text-decoration: underline; }

.fp-awards {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.fp-awards li {
  padding: 12px 16px;
  border-left: 3px solid var(--gold);
  background: var(--bg-alt);
  border-radius: 10px;
  color: var(--text);
}

.fp-video {
  position: relative;
  padding-top: 56.25%;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  margin-top: 24px;
  background: #000;
}

.fp-video iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

/* Previous and next */
.fp-pager {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: space-between;
}

.fp-pager a {
  flex: 1 1 260px;
  padding: 20px 24px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface);
  transition: border-color 0.3s, transform 0.3s var(--ease);
}
.fp-pager a:hover {
  border-color: rgba(212, 168, 75, 0.5);
  transform: translateY(-3px);
}
.fp-pager a.next { text-align: right; }
.fp-pager small {
  display: block;
  margin-bottom: 6px;
  color: var(--gold);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.72rem;
}
.fp-pager strong {
  font-family: Georgia, serif;
  font-weight: 400;
  font-size: 1.1rem;
  color: var(--text);
}

/* Not found */
.fp-notfound {
  min-height: 70vh;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 140px 20px 80px;
}

/* Film card links on the home page */
.film-link {
  display: block;
  height: 100%;
  color: inherit;
  border-radius: 20px;
}
.film-link:focus-visible { outline: 2px solid var(--gold); outline-offset: 4px; }

/* Entrance for the film page */
.fp-hero-grid { animation: fadeUp 0.9s var(--ease) both; }

/* Responsive */
@media (max-width: 860px) {
  .fp-hero-grid,
  .fp-grid-2 { grid-template-columns: 1fr; }

  .fp-hero-grid { text-align: center; gap: 36px; }
  .fp-poster { max-width: 260px; margin: 0 auto; }
  .fp-chips,
  .fp-actions { justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
  .fp-hero-grid { animation: none; }
}