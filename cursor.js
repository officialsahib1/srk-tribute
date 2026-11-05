/* =========================================================
   cursor-fx.js
   A soft, layered colour glow that trails the mouse cursor.
   - Three glow layers follow the cursor at different speeds,
     so they trail behind it like a ribbon.
   - Over links and cards, the glow grows and shifts colour.
   - A click sends out a small ring.
   Runs only on computers with a mouse, and not when the visitor
   has reduced motion turned on.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  var HOT_SELECTOR = "a, button, .film-tilt, .award-card, .g-item, .v-card, .chip, .bio-card, .flip";

  function init() {
    if (reduceMotion || !finePointer || !document.body) return;

    /* ----- Build the layer ----- */
    var layer = document.createElement("div");
    layer.className = "cfx";
    layer.setAttribute("aria-hidden", "true");

    // Each glow follows the cursor at its own speed (ease).
    // A higher ease means it follows more closely.
    var configs = [
      { cls: "cfx-a", ease: 0.14 },
      { cls: "cfx-b", ease: 0.08 },
      { cls: "cfx-c", ease: 0.045 }
    ];

    var blobs = configs.map(function (c) {
      var el = document.createElement("span");
      el.className = "cfx-blob " + c.cls;
      layer.appendChild(el);
      return { el: el, ease: c.ease, x: 0, y: 0 };
    });

    document.body.appendChild(layer);

    /* ----- Positions and animation loop ----- */
    var targetX = window.innerWidth / 2;
    var targetY = window.innerHeight / 2;
    blobs.forEach(function (b) {
      b.x = targetX;
      b.y = targetY;
    });

    var running = false;

    function frame() {
      var moving = false;

      blobs.forEach(function (b) {
        var dx = targetX - b.x;
        var dy = targetY - b.y;
        b.x += dx * b.ease;
        b.y += dy * b.ease;

        if (Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2) moving = true;

        b.el.style.transform =
          "translate3d(" + b.x.toFixed(1) + "px, " + b.y.toFixed(1) + "px, 0)";
      });

      if (moving) {
        window.requestAnimationFrame(frame);
      } else {
        running = false;   // stop the loop when the glow has settled
      }
    }

    function start() {
      if (!running) {
        running = true;
        window.requestAnimationFrame(frame);
      }
    }

    /* ----- Mouse movement ----- */
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;

      targetX = e.clientX;
      targetY = e.clientY;

      layer.classList.add("is-on");

      var target = e.target;
      var hot = target && typeof target.closest === "function"
        ? target.closest(HOT_SELECTOR)
        : null;
      layer.classList.toggle("is-hot", !!hot);

      start();
    }, { passive: true });

    // Hide the glow when the mouse leaves the browser window
    document.addEventListener("mouseout", function (e) {
      if (!e.relatedTarget) layer.classList.remove("is-on");
    });

    /* ----- Click ring ----- */
    function spawnRing(x, y) {
      var ring = document.createElement("span");
      ring.className = "cfx-ring";
      ring.style.left = x + "px";
      ring.style.top = y + "px";
      layer.appendChild(ring);

      // Remove the ring when its animation ends, with a fallback timer
      var remove = function () {
        if (ring.parentNode) ring.parentNode.removeChild(ring);
      };
      ring.addEventListener("animationend", remove);
      window.setTimeout(remove, 1000);
    }

    document.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      spawnRing(e.clientX, e.clientY);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();