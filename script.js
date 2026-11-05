/* =========================================================
   script.js (complete file)
   Film data is in films-data.js, so it loads first in index.html.
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const films = (Array.isArray(window.FILMS) ? window.FILMS : [])
    .filter((f) => f && typeof f.id === "string" && f.id !== "");

  const FILMS_PER_PAGE = 6;
  const filmState = { decade: "all", shown: FILMS_PER_PAGE };

  function safe(name, fn) {
    try {
      fn();
    } catch (err) {
      console.error(`${name} failed:`, err);
    }
  }

  /* =========================================================
     1. HEADER MENU
     ========================================================= */
  function setupMenu() {
    const wrap = document.getElementById("menuWrap");
    const btn = document.getElementById("menuBtn");
    const panel = document.getElementById("menuPanel");
    const header = document.getElementById("siteHeader");
    if (!wrap || !btn || !panel) return;

    let pinned = false;
    let closeTimer = null;

    const isOpen = () => panel.classList.contains("open");

    const setOpen = (open) => {
      panel.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", String(open));
      if (header) header.classList.toggle("menu-open", open);
    };

    const close = () => {
      clearTimeout(closeTimer);
      pinned = false;
      setOpen(false);
    };

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      clearTimeout(closeTimer);
      if (isOpen() && pinned) {
        close();
      } else {
        pinned = true;
        setOpen(true);
      }
    });

    if (finePointer) {
      wrap.addEventListener("mouseenter", () => {
        clearTimeout(closeTimer);
        setOpen(true);
      });
      wrap.addEventListener("mouseleave", () => {
        if (pinned) return;
        closeTimer = setTimeout(() => setOpen(false), 250);
      });
    }

    panel.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));

    document.addEventListener("click", (e) => {
      if (isOpen() && !wrap.contains(e.target)) close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) {
        close();
        btn.focus();
      }
    });
  }

  /* =========================================================
     2. FILMS: cards, filters, show more, tilt and sheen
     ========================================================= */
  function decadeOf(year) {
    return `${Math.floor(year / 10) * 10}s`;
  }

  function attachFilmTilt(tilt) {
    if (reduceMotion || !finePointer) return;

    tilt.addEventListener("mousemove", (e) => {
      const r = tilt.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      tilt.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
      tilt.style.setProperty("--rx", `${(0.5 - y) * 12}deg`);
      tilt.style.setProperty("--mx", `${x * 100}%`);
      tilt.style.setProperty("--my", `${y * 100}%`);
    });

    tilt.addEventListener("mouseleave", () => {
      tilt.style.setProperty("--rx", "0deg");
      tilt.style.setProperty("--ry", "0deg");
    });
  }

  function buildFilmCard(film, index) {
    const card = document.createElement("article");
    card.className = "film-card";
    card.style.setProperty("--i", String(index));

    const link = document.createElement("a");
    link.className = "film-link";
    link.href = `film.html?id=${encodeURIComponent(film.id)}`;
    link.setAttribute("aria-label", `${film.title}, details`);

    const tilt = document.createElement("div");
    tilt.className = "film-tilt";

    const poster = document.createElement("div");
    poster.className = "poster";

    const title = document.createElement("span");
    title.className = "poster-title";
    title.textContent = film.title;
    poster.appendChild(title);

    if (film.poster) {
      const img = document.createElement("img");
      img.src = film.poster;
      img.alt = `${film.title} poster`;
      img.loading = "lazy";
      img.onerror = () => img.remove();
      poster.prepend(img);
    }

    const info = document.createElement("div");
    info.className = "film-info";

    const h3 = document.createElement("h3");
    h3.textContent = film.title;

    const meta = document.createElement("p");
    meta.className = "film-meta";
    meta.textContent = `${film.year} · ${film.role}`;

    info.append(h3, meta);
    tilt.append(poster, info);
    link.appendChild(tilt);
    card.appendChild(link);

    attachFilmTilt(tilt);
    return card;
  }

  function renderFilms() {
    const grid = document.getElementById("filmGrid");
    const moreBtn = document.getElementById("filmMoreBtn");
    if (!grid) return;

    if (!grid.dataset.watching) {
      grid.dataset.watching = "1";
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries, obs) => {
          if (entries.some((e) => e.isIntersecting)) {
            grid.classList.add("is-live");
            obs.disconnect();
          }
        }, { threshold: 0.12 });
        io.observe(grid);
      } else {
        grid.classList.add("is-live");
      }
    }

    const list = films
      .filter((f) => filmState.decade === "all" || decadeOf(f.year) === filmState.decade)
      .sort((a, b) => a.year - b.year);

    const visible = list.slice(0, filmState.shown);

    grid.innerHTML = "";
    visible.forEach((film, i) => grid.appendChild(buildFilmCard(film, i)));

    if (moreBtn) {
      const remaining = list.length - visible.length;
      moreBtn.hidden = list.length <= FILMS_PER_PAGE;
      if (remaining > 0) {
        moreBtn.dataset.mode = "more";
        moreBtn.textContent = `Show more films (${remaining} more)`;
      } else {
        moreBtn.dataset.mode = "less";
        moreBtn.textContent = "Show fewer films";
      }
    }
  }

  function setupFilmControls() {
    const filters = document.getElementById("filmFilters");
    const moreBtn = document.getElementById("filmMoreBtn");

    if (filters) {
      filters.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (!chip) return;

        filmState.decade = chip.dataset.filter || "all";
        filmState.shown = FILMS_PER_PAGE;

        filters.querySelectorAll(".chip").forEach((c) => {
          const active = c === chip;
          c.classList.toggle("is-active", active);
          c.setAttribute("aria-pressed", String(active));
        });

        renderFilms();
      });
    }

    if (moreBtn) {
      moreBtn.addEventListener("click", () => {
        if (moreBtn.dataset.mode === "less") {
          filmState.shown = FILMS_PER_PAGE;
          renderFilms();
          const section = document.getElementById("films");
          if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        filmState.shown += FILMS_PER_PAGE;
        renderFilms();
      });
    }
  }

  /* =========================================================
     3. AWARD CARDS: 3D tilt and cursor light (desktop only)
     ========================================================= */
  function setupAwardTilt() {
    if (reduceMotion || !finePointer) return;

    document.querySelectorAll(".award-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--ry", `${(x - 0.5) * 14}deg`);
        card.style.setProperty("--rx", `${(0.5 - y) * 12}deg`);
        card.style.setProperty("--mx", `${x * 100}%`);
        card.style.setProperty("--my", `${y * 100}%`);
        card.style.setProperty("--z", "10px");
      });

      card.addEventListener("mouseleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        card.style.setProperty("--z", "0px");
      });
    });
  }

  /* =========================================================
     4. SCROLL ANIMATIONS (data-reveal)
     ========================================================= */
  function setupReveal() {
    document.querySelectorAll("[data-stagger]").forEach((box) => {
      [...box.children].forEach((child, i) => {
        child.dataset.reveal = box.dataset.stagger;
        child.style.setProperty("--delay", `${Math.min(i, 8) * 110}ms`);
      });
    });

    const targets = document.querySelectorAll("[data-reveal]");

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

    targets.forEach((el) => observer.observe(el));
  }

  /* =========================================================
     5. SCROLL EFFECTS: header, progress bar, parallax, depth
     ========================================================= */
  function setupScrollEffects() {
    const header = document.getElementById("siteHeader");
    const bar = document.getElementById("scrollProgress");
    const hero = document.getElementById("home");
    const sections = document.querySelectorAll(".section");
    let queued = false;

    function update() {
      queued = false;
      const y = window.scrollY;
      const vh = window.innerHeight;

      if (header) header.classList.toggle("scrolled", y > 40);

      if (bar) {
        const max = document.documentElement.scrollHeight - vh;
        bar.style.width = max > 0 ? `${(y / max) * 100}%` : "0%";
      }

      if (!reduceMotion) {
        if (hero) hero.style.setProperty("--py", `${Math.min(y, 900) * 0.35}px`);

        sections.forEach((section) => {
          const rect = section.getBoundingClientRect();
          const progress = Math.min(Math.max((vh - rect.top) / vh, 0), 1);
          const tilt = (1 - progress) * 5;
          const scale = 0.96 + progress * 0.04;
          section.style.transform =
            progress >= 1 ? "none" : `perspective(1400px) rotateX(${tilt}deg) scale(${scale})`;
        });
      }
    }

    const onScroll = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* =========================================================
     6. COUNT-UP NUMBERS
     ========================================================= */
  function setupCounters() {
    const counters = document.querySelectorAll(".stat-number[data-count]");
    const show = (el) => (el.textContent = Number(el.dataset.count).toLocaleString());

    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach(show);
      return;
    }

    const animate = (el, target, duration = 1500) => {
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
        else show(el);
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target, Number(entry.target.dataset.count));
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach((el) => observer.observe(el));
  }

  /* =========================================================
     7. FOOTER YEAR
     ========================================================= */
  function setYear() {
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  /* =========================================================
     START
     ========================================================= */
  document.addEventListener("DOMContentLoaded", () => {
    safe("Menu", setupMenu);
    safe("Films", renderFilms);
    safe("Film controls", setupFilmControls);
    safe("Award effects", setupAwardTilt);
    safe("Scroll animations", setupReveal);
    safe("Scroll effects", setupScrollEffects);
    safe("Counters", setupCounters);
    safe("Footer year", setYear);
  });
})();