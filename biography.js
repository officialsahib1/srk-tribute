/* =========================================================
   biography.js
   Effects for the biography page.
   Every feature runs in its own safe block, so one problem
   cannot stop the others.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ----- Small helpers ----- */
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function safe(name, fn) {
    try {
      fn();
    } catch (err) {
      console.error(name + " failed:", err);
    }
  }

  // Runs fn at most once per animation frame
  function throttleFrame(fn) {
    var queued = false;
    return function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () {
        queued = false;
        fn();
      });
    };
  }

  /* ----- Footer year ----- */
  function setupYear() {
    var year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* ----- Header shadow, reading bar, and scroll depth for the hero ----- */
  function setupScroll() {
    var header = $("#siteHeader");
    var bar = $("#scrollProgress");
    var hero = $("#bioHero");

    var update = function () {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      var viewH = window.innerHeight || 1;
      var max = document.documentElement.scrollHeight - viewH;

      if (header) header.classList.toggle("scrolled", y > 20);
      if (bar) bar.style.width = max > 0 ? ((y / max) * 100).toFixed(2) + "%" : "0%";

      // The background layers drift upward slightly as the page scrolls
      if (hero && !reduceMotion) {
        hero.style.setProperty("--sy", (Math.min(y, 1200) * 0.18).toFixed(1) + "px");
      }
    };

    var onScroll = throttleFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* ----- Scroll-in animations (data-reveal) ----- */
  function setupReveal() {
    // Children of a [data-stagger] box get the same animation,
    // with a small delay so they appear one after another.
    $$("[data-stagger]").forEach(function (box) {
      var mode = box.getAttribute("data-stagger") || "up";
      Array.prototype.forEach.call(box.children, function (child, i) {
        if (!child.hasAttribute("data-reveal")) {
          child.setAttribute("data-reveal", mode);
        }
        child.style.setProperty("--delay", Math.min(i, 8) * 110 + "ms");
      });
    });

    var targets = $$("[data-reveal]");

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ----- Hero depth: the background follows the mouse, smoothly ----- */
  function setupHeroDepth() {
    var hero = $("#bioHero");
    if (!hero) return;

    // Each orb has its own depth value (set in the HTML as data-depth)
    $$(".bio-orb[data-depth]").forEach(function (orb) {
      orb.style.setProperty("--d", orb.getAttribute("data-depth") + "px");
    });

    if (reduceMotion || !finePointer) return;

    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;
    var running = false;

    function tick() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      hero.style.setProperty("--mx", currentX.toFixed(4));
      hero.style.setProperty("--my", currentY.toFixed(4));

      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        window.requestAnimationFrame(tick);
      } else {
        running = false;
      }
    }

    function start() {
      if (!running) {
        running = true;
        window.requestAnimationFrame(tick);
      }
    }

    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      if (!r.width || !r.height) return;
      targetX = clamp((e.clientX - r.left) / r.width - 0.5, -0.5, 0.5);
      targetY = clamp((e.clientY - r.top) / r.height - 0.5, -0.5, 0.5);
      start();
    });

    hero.addEventListener("pointerleave", function () {
      targetX = 0;
      targetY = 0;
      start();
    });
  }

  /* ----- 3D tilt and cursor light for a card or the portrait ----- */
  function attachTilt(el, maxDeg) {
    var frameId = null;
    var nx = 0.5;
    var ny = 0.5;

    function apply() {
      frameId = null;
      el.style.setProperty("--ry", ((nx - 0.5) * maxDeg * 2).toFixed(2) + "deg");
      el.style.setProperty("--rx", ((0.5 - ny) * maxDeg * 2).toFixed(2) + "deg");
      el.style.setProperty("--mx", (nx * 100).toFixed(1) + "%");
      el.style.setProperty("--my", (ny * 100).toFixed(1) + "%");
    }

    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      nx = clamp((e.clientX - r.left) / r.width, 0, 1);
      ny = clamp((e.clientY - r.top) / r.height, 0, 1);
      if (frameId === null) frameId = window.requestAnimationFrame(apply);
    });

    el.addEventListener("pointerleave", function () {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = null;
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    });
  }

  function setupTilts() {
    if (reduceMotion || !finePointer) return;

    $$(".bio-card").forEach(function (card) {
      attachTilt(card, 6);
    });

    var portrait = $("#bioPortrait");
    if (portrait) attachTilt(portrait, 8);
  }

  /* ----- Flip cards ----- */
  // Computers: the card flips while the mouse is over it.
  // Touch screens and keyboards: tap or press Enter / Space to flip.
  function setupFlips() {
    $$(".flip").forEach(function (card) {
      if (finePointer) {
        card.addEventListener("pointerenter", function (e) {
          if (e.pointerType === "mouse") card.classList.add("is-flipped");
        });
        card.addEventListener("pointerleave", function (e) {
          if (e.pointerType === "mouse") card.classList.remove("is-flipped");
        });
      } else {
        card.addEventListener("click", function () {
          card.classList.toggle("is-flipped");
        });
      }

      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.classList.toggle("is-flipped");
        }
      });
    });
  }

  /* ----- Portrait: show the placeholder if the image is missing ----- */
  function setupPortrait() {
    var box = $("#bioPortrait");
    var img = box ? box.querySelector("img") : null;
    if (!box || !img) return;

    var markMissing = function () {
      box.classList.add("no-photo");
      img.style.display = "none";
    };

    img.addEventListener("error", markMissing);

    // The image may already have failed before this script ran
    if (img.complete && img.naturalWidth === 0) markMissing();
  }

  /* =========================================================
     START
     ========================================================= */
  document.addEventListener("DOMContentLoaded", function () {
    safe("Year", setupYear);
    safe("Scroll effects", setupScroll);
    safe("Hero depth", setupHeroDepth);
    safe("Tilt effects", setupTilts);
    safe("Flip cards", setupFlips);
    safe("Portrait", setupPortrait);
    safe("Scroll animations", setupReveal);
  });
})();