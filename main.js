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

  /* ── Docs sidebar toggle (mobile) ────────────────────── */
  var docSide = document.querySelector(".doc-side");
  var docToggle = document.querySelector(".doc-side__toggle");
  if (docSide && docToggle) {
    docToggle.addEventListener("click", function () {
      var open = docSide.classList.toggle("is-open");
      docToggle.setAttribute("aria-expanded", open ? "true" : "false");
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

  /* ── Hero: branching world-tree, traveling light, pointer-reactive ── */
  (function heroTree() {
    var canvas = document.getElementById("heroCanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var heroEl = canvas.closest(".hero") || canvas.parentElement;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var nodes = [], edges = [], pulses = [], raf = null;
    var ptr = { x: -1e4, y: -1e4, on: false, acc: 0 };
    var TEAL = [79, 209, 197], AQUA = [45, 212, 191], VIOLET = [167, 139, 250], LIGHT = [233, 245, 244];

    function lerp(a, b, t) { return a + (b - a) * t; }
    function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
    function mix(c1, c2, t) { return [lerp(c1[0], c2[0], t) | 0, lerp(c1[1], c2[1], t) | 0, lerp(c1[2], c2[2], t) | 0]; }
    function addNode(x, y) { nodes.push({ x: x, y: y, heat: 0, r: 1.1 + Math.random() * 1.3, out: [] }); return nodes.length - 1; }
    function addEdge(a, b) { var i = edges.length; edges.push({ a: a, b: b, heat: 0 }); nodes[a].out.push(i); return i; }

    function build() {
      nodes = []; edges = [];
      var rootX = W * 0.5;
      var root = addNode(rootX, H * 1.04);
      var trunk = addNode(rootX, H * 0.7);
      addEdge(root, trunk);
      var maxD = 6;
      function grow(parent, ang, len, d) {
        if (d > maxD || len < H * 0.02 || nodes.length > 240) return;
        var p = nodes[parent];
        var c = addNode(p.x + Math.cos(ang) * len, p.y + Math.sin(ang) * len);
        addEdge(parent, c);
        var nb = d >= maxD - 1 ? 0 : (Math.random() < 0.68 ? 2 : (Math.random() < 0.5 ? 1 : 3));
        var spread = lerp(0.82, 0.42, d / maxD);
        for (var k = 0; k < nb; k++) {
          var off = nb === 1 ? (Math.random() - 0.5) * 0.5 : lerp(-spread, spread, k / (nb - 1));
          grow(c, ang + off + (Math.random() - 0.5) * 0.12, len * (0.7 + Math.random() * 0.12), d + 1);
        }
      }
      var up = -Math.PI / 2;
      grow(trunk, up - 0.52, H * 0.12, 1);
      grow(trunk, up, H * 0.135, 1);
      grow(trunk, up + 0.52, H * 0.12, 1);
    }

    function spawn(fromNode, col) {
      if (pulses.length > 26) return;
      var n = nodes[fromNode];
      if (!n || !n.out.length) return;
      pulses.push({ e: n.out[(Math.random() * n.out.length) | 0], t: 0, col: col, sp: 0.014 + Math.random() * 0.012 });
    }

    function nearest(x, y, maxd) {
      var best = -1, bd = maxd * maxd;
      for (var i = 1; i < nodes.length; i++) {
        if (!nodes[i].out.length) continue;
        var dx = nodes[i].x - x, dy = nodes[i].y - y, d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = i; }
      }
      return best;
    }

    function size() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.max(1, W * DPR); canvas.height = Math.max(1, H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    function reset() { size(); build(); pulses = []; for (var i = 0; i < 8; i++) spawn(0, TEAL); }

    function frame() {
      raf = requestAnimationFrame(frame);
      ctx.clearRect(0, 0, W, H);
      var R = 150, R2 = R * R, i, n, e;

      for (i = 0; i < nodes.length; i++) {
        n = nodes[i]; n.heat *= 0.90;
        if (ptr.on) { var dx = n.x - ptr.x, dy = n.y - ptr.y, d2 = dx * dx + dy * dy; if (d2 < R2) { var hh = 1 - Math.sqrt(d2) / R; if (hh > n.heat) n.heat = hh; } }
      }
      for (i = 0; i < edges.length; i++) edges[i].heat *= 0.88;

      for (i = pulses.length - 1; i >= 0; i--) {
        var pl = pulses[i]; pl.t += pl.sp;
        e = edges[pl.e]; if (e) { e.heat = 1; if (nodes[e.b].heat < 0.9) nodes[e.b].heat = 0.9; }
        if (pl.t >= 1) { var node = nodes[edges[pl.e].b]; if (node.out.length) { pl.e = node.out[(Math.random() * node.out.length) | 0]; pl.t = 0; } else pulses.splice(i, 1); }
      }
      if (pulses.length < 9 && Math.random() < 0.06) spawn(0, TEAL);

      ctx.lineCap = "round";
      for (i = 0; i < edges.length; i++) {
        e = edges[i]; var a = nodes[e.a], b = nodes[e.b];
        var h = e.heat > (a.heat + b.heat) * 0.5 ? e.heat : (a.heat + b.heat) * 0.5;
        ctx.strokeStyle = rgba(mix(TEAL, LIGHT, h), 0.05 + h * 0.55);
        ctx.lineWidth = 0.7 + h * 1.7;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      for (i = 1; i < nodes.length; i++) {
        n = nodes[i];
        if (n.heat > 0.25) { ctx.shadowBlur = 10 * n.heat; ctx.shadowColor = rgba(TEAL, 0.7 * n.heat); } else ctx.shadowBlur = 0;
        ctx.fillStyle = rgba(mix(TEAL, LIGHT, n.heat), 0.22 + n.heat * 0.78);
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (1 + n.heat * 1.9), 0, 6.2832); ctx.fill();
      }
      ctx.shadowBlur = 0;
      for (i = 0; i < pulses.length; i++) {
        var p = pulses[i], ed = edges[p.e]; if (!ed) continue;
        var A = nodes[ed.a], B = nodes[ed.b];
        ctx.shadowBlur = 14; ctx.shadowColor = rgba(p.col, 0.95);
        ctx.fillStyle = rgba([245, 255, 252], 0.95);
        ctx.beginPath(); ctx.arc(lerp(A.x, B.x, p.t), lerp(A.y, B.y, p.t), 2.1, 0, 6.2832); ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function drawStatic() {
      size(); build(); ctx.clearRect(0, 0, W, H); ctx.lineCap = "round";
      for (var i = 0; i < edges.length; i++) { var a = nodes[edges[i].a], b = nodes[edges[i].b]; ctx.strokeStyle = rgba(TEAL, 0.16); ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      for (i = 1; i < nodes.length; i++) { ctx.fillStyle = rgba(TEAL, 0.42); ctx.beginPath(); ctx.arc(nodes[i].x, nodes[i].y, nodes[i].r, 0, 6.2832); ctx.fill(); }
    }

    if (reduced) { drawStatic(); return; }

    reset();
    raf = requestAnimationFrame(frame);

    heroEl.addEventListener("pointermove", function (ev) {
      var r = canvas.getBoundingClientRect();
      ptr.x = ev.clientX - r.left; ptr.y = ev.clientY - r.top; ptr.on = true;
      if (++ptr.acc % 5 === 0) { var nn = nearest(ptr.x, ptr.y, 130); if (nn > 0) spawn(nn, Math.random() < 0.5 ? VIOLET : AQUA); }
    }, { passive: true });
    heroEl.addEventListener("pointerleave", function () { ptr.on = false; ptr.x = ptr.y = -1e4; });

    var rz; window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(reset, 220); }, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = null; } }
      else if (!raf) raf = requestAnimationFrame(frame);
    });
  })();
})();
