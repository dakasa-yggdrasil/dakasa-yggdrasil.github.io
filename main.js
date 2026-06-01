/* Yggdrasil landing — tiny vanilla interactions. No deps, no build. */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Nav: scrolled state + mobile menu ───────────────── */
  var nav = document.getElementById("nav");
  var burger = document.getElementById("burger");
  function onScroll() { nav.classList.toggle("is-scrolled", window.scrollY > 8); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (burger) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ── Copy-to-clipboard buttons ───────────────────────── */
  document.querySelectorAll(".copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy") || "";
      var done = function () {
        var prev = btn.textContent;
        btn.textContent = "Copiado ✓";
        btn.classList.add("is-done");
        setTimeout(function () { btn.textContent = prev; btn.classList.remove("is-done"); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else { fallback(); }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });

  /* ── Reveal on scroll ────────────────────────────────── */
  var revealEls = [].slice.call(document.querySelectorAll(
    ".section__head, .card, .flow, .how__point, .cat__group, .install-strip, .cli__copy, .terminal--tall, .table-wrap, .value__item, .cta__inner"
  ));
  revealEls.forEach(function (el) { el.classList.add("reveal"); });
  if (reduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ── Hero: world-tree node graph ─────────────────────── */
  var canvas = document.getElementById("tree");
  if (!canvas || reduced) return;
  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var nodes = [], links = [], W = 0, H = 0, raf = null;

  var COLORS = ["#34D399", "#2DD4BF", "#A78BFA"];

  function build() {
    var rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    nodes = []; links = [];
    var count = Math.max(18, Math.min(40, Math.floor(W / 34)));
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
        r: 1.1 + Math.random() * 1.8,
        c: COLORS[i % COLORS.length]
      });
    }
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }
    // edges (the branches/roots)
    for (var a = 0; a < nodes.length; a++) {
      for (var b = a + 1; b < nodes.length; b++) {
        var dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 132) {
          ctx.strokeStyle = "rgba(45,212,191," + (0.16 * (1 - d / 132)).toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(nodes[a].x, nodes[a].y); ctx.lineTo(nodes[b].x, nodes[b].y); ctx.stroke();
        }
      }
    }
    // nodes
    for (var k = 0; k < nodes.length; k++) {
      var p = nodes[k];
      ctx.fillStyle = p.c; ctx.globalAlpha = 0.8;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }

  function start() { if (raf) cancelAnimationFrame(raf); build(); frame(); }
  start();

  // pause when off-screen; rebuild on resize (debounced)
  var rt;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(start, 200); }, { passive: true });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { if (raf) cancelAnimationFrame(raf), raf = null; }
    else if (!raf) frame();
  });
})();
