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
        btn.textContent = "Copied ✓";
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

  /* ── Hero: an elegant neural network — a hexagonal nucleus seeds signal that cascades outward
        through a blue-noise synapse field, fading into the dark at the edges ── */
  (function heroNeural() {
    var canvas = document.getElementById("heroCanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var heroEl = canvas.closest(".hero") || canvas.parentElement;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, cx = 0, cy = 0, nucR = 0, soma = 0, hubs = [], tick = 0;
    var nodes = [], edges = [], pulses = [], raf = null;
    var ptr = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, on: false, acc: 0 };
    var TEAL = [79, 209, 197], AQUA = [120, 232, 221], VIOLET = [167, 139, 250], LIGHT = [233, 246, 244];
    var TAU = Math.PI * 2, DEG = Math.PI / 180;

    function lerp(a, b, t) { return a + (b - a) * t; }
    function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
    function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
    function mix(c1, c2, t) { return [lerp(c1[0], c2[0], t) | 0, lerp(c1[1], c2[1], t) | 0, lerp(c1[2], c2[2], t) | 0]; }
    function ptOn(A, B, t) { return [A.x + (B.x - A.x) * t, A.y + (B.y - A.y) * t]; }
    function aN(x, y, rad, kind) { nodes.push({ x: x, y: y, r: rad, kind: kind, heat: 0, fire: 0, d: 0, fade: 1, out: [] }); return nodes.length - 1; }
    function aE(a, b, w, core) { var i = edges.length, A = nodes[a], B = nodes[b]; edges.push({ a: a, b: b, mx: (A.x + B.x) / 2, my: (A.y + B.y) / 2, w: w, core: !!core, wt: 0.5 + Math.random() * 0.5 }); nodes[a].out.push(i); return i; }
    function d2(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return dx * dx + dy * dy; }
    function diag() { return Math.hypot(W, H) * 0.5; }
    function fadeAt(d) { return clamp(1.18 - d / (diag() * 0.96), 0.18, 1); }
    function minRad(d) { var t = clamp(d / (Math.min(W, H) * 0.66), 0, 1); return lerp(Math.min(W, H) * 0.05, Math.min(W, H) * 0.112, t); }

    /* the nucleus: hexagonal membrane + dense inner ring + brilliant nucleolus */
    function buildNucleus() {
      soma = aN(cx, cy, Math.max(W, H) * 0.0072 + 3, "soma");
      hubs = [];
      for (var k = 0; k < 6; k++) { var a = k * 60 * DEG; hubs.push(aN(cx + nucR * Math.cos(a), cy + nucR * Math.sin(a), 2.6, "hub")); }
      for (k = 0; k < 6; k++) aE(hubs[k], hubs[(k + 1) % 6], 1.4, true);
      var inner = [], IN = 9, ir = nucR * 0.54;
      for (k = 0; k < IN; k++) { var a2 = TAU * k / IN + 0.2, rad = ir * (0.92 + 0.12 * Math.random()); inner.push(aN(cx + rad * Math.cos(a2), cy + rad * Math.sin(a2), 1.6, "nucleus")); }
      for (k = 0; k < IN; k++) { aE(soma, inner[k], 1.1, true); aE(inner[k], inner[(k + 1) % IN], 0.95, true); }
      for (k = 0; k < IN; k++) aE(inner[k], nearestHub(nodes[inner[k]].x, nodes[inner[k]].y), 1.0, true);
    }
    function nearestHub(x, y) { var th = Math.atan2(y - cy, x - cx) / DEG, k = Math.round((((th) % 360) + 360) % 360 / 60) % 6; return hubs[k]; }
    function hexPath(scale) { ctx.beginPath(); for (var k = 0; k < 6; k++) { var hn = nodes[hubs[k]], hx = cx + (hn.x - cx) * scale, hy = cy + (hn.y - cy) * scale; k ? ctx.lineTo(hx, hy) : ctx.moveTo(hx, hy); } ctx.closePath(); }

    /* blue-noise (Poisson-disk) neuron field, density graded by distance from the nucleus */
    function placeNeurons() {
      var pts = [], cell = Math.min(W, H) * 0.045, grid = {};
      function ok(x, y) {
        var d = Math.hypot(x - cx, y - cy); if (d < nucR * 1.18) return false;
        var mr = minRad(d), gx = (x / cell) | 0, gy = (y / cell) | 0;
        for (var ax = gx - 2; ax <= gx + 2; ax++) for (var ay = gy - 2; ay <= gy + 2; ay++) { var arr = grid[ax + "|" + ay]; if (arr) for (var q = 0; q < arr.length; q++) { var p = arr[q], dx = p.x - x, dy = p.y - y; if (dx * dx + dy * dy < mr * mr) return false; } }
        return true;
      }
      var darts = Math.round(W * H / (cell * cell)) * 36;
      for (var i = 0; i < darts; i++) { var x = Math.random() * W, y = Math.random() * H; if (ok(x, y)) { var gx = (x / cell) | 0, gy = (y / cell) | 0, kk = gx + "|" + gy; (grid[kk] || (grid[kk] = [])).push({ x: x, y: y }); pts.push({ x: x, y: y, d: Math.hypot(x - cx, y - cy) }); } }
      return pts;
    }
    /* proximity graph: each neuron links to its nearest neighbours, edges directed outward (signal flows out) */
    function connect(pts, nidx) {
      var cell = Math.min(W, H) * 0.14, grid = {}, i;
      for (i = 0; i < pts.length; i++) { var gx = (pts[i].x / cell) | 0, gy = (pts[i].y / cell) | 0, kk = gx + "|" + gy; (grid[kk] || (grid[kk] = [])).push(i); }
      var seen = {};
      for (i = 0; i < pts.length; i++) {
        var P = pts[i], gx = (P.x / cell) | 0, gy = (P.y / cell) | 0, cand = [];
        for (var ax = gx - 1; ax <= gx + 1; ax++) for (var ay = gy - 1; ay <= gy + 1; ay++) { var arr = grid[ax + "|" + ay]; if (arr) for (var q = 0; q < arr.length; q++) { var j = arr[q]; if (j !== i) cand.push(j); } }
        cand.sort(function (a, b) { return d2(P, pts[a]) - d2(P, pts[b]); });
        var maxD = 1.95 * minRad(P.d), made = 0;
        for (var c = 0; c < cand.length && made < 3; c++) {
          var j = cand[c]; if (d2(P, pts[j]) > maxD * maxD) break;
          var a = Math.min(i, j), b = Math.max(i, j), key = a + "_" + b; if (seen[key]) continue; seen[key] = 1;
          var innerN = P.d <= pts[j].d ? nidx[i] : nidx[j], outerN = (innerN === nidx[i]) ? nidx[j] : nidx[i];
          aE(innerN, outerN, 0.9, false); made++;
        }
      }
    }

    function build() {
      nodes = []; edges = []; pulses = []; cx = W / 2; cy = H * 0.5; nucR = Math.max(60, 0.135 * Math.min(W, H));
      buildNucleus();
      var pts = placeNeurons(), nidx = [], i;
      for (i = 0; i < pts.length; i++) { var id = aN(pts[i].x, pts[i].y, 1.6, "neuron"); nodes[id].d = pts[i].d; nodes[id].fade = fadeAt(pts[i].d); nidx.push(id); }
      connect(pts, nidx);
      for (i = 0; i < pts.length; i++) if (pts[i].d < nucR * 1.85) aE(nearestHub(pts[i].x, pts[i].y), nidx[i], 0.95, true);
      var deg = []; for (i = 0; i < nodes.length; i++) deg[i] = 0;
      for (i = 0; i < edges.length; i++) { deg[edges[i].a]++; deg[edges[i].b]++; }
      for (i = 0; i < nodes.length; i++) if (nodes[i].kind === "neuron") nodes[i].r = 1.5 + Math.min(deg[i], 7) * 0.28;
      for (i = 0; i < 14; i++) spawn(soma, i % 2 ? AQUA : TEAL);
    }
    function spawn(f, c) { if (pulses.length > 70) return; var n = nodes[f]; if (!n || !n.out.length) return; pulses.push({ e: n.out[(Math.random() * n.out.length) | 0], t: 0, col: c, sp: 0.012 + Math.random() * 0.012, hx: undefined, hy: undefined }); }
    function nearest(x, y, md) { var b = -1, bd = md * md; for (var i = 0; i < nodes.length; i++) { if (!nodes[i].out.length) continue; var dx = nodes[i].x - x, dy = nodes[i].y - y, d = dx * dx + dy * dy; if (d < bd) { bd = d; b = i; } } return b; }
    function reset() { var rc = canvas.getBoundingClientRect(); W = rc.width; H = rc.height; canvas.width = Math.max(1, W * DPR); canvas.height = Math.max(1, H * DPR); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); build(); if (reduced) frame(); }
    function aurora() { var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.6); g.addColorStop(0, rgba(TEAL, 0.07)); g.addColorStop(0.45, rgba(VIOLET, 0.035)); g.addColorStop(1, rgba(TEAL, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }

    function frame() {
      if (!reduced) raf = requestAnimationFrame(frame);
      tick++;
      if (ptr.tx > -1e3) { ptr.x += (ptr.tx - ptr.x) * 0.14; ptr.y += (ptr.ty - ptr.y) * 0.14; }
      ctx.clearRect(0, 0, W, H); aurora();
      var i, k, n, e, A, B, src = [];
      if (reduced) {
        src.push({ x: cx, y: cy, r: nucR * 2.8 });
      } else {
        for (i = pulses.length - 1; i >= 0; i--) {
          var pl = pulses[i]; pl.t += pl.sp; e = edges[pl.e]; if (!e) { pulses.splice(i, 1); continue; }
          if (pl.t >= 1) {
            var nb = nodes[e.b]; nb.fire = 1;
            if (nb.out.length) {
              pl.e = nb.out[(Math.random() * nb.out.length) | 0]; pl.t = 0; e = edges[pl.e];
              if (pulses.length < 70) for (var oi = 0; oi < nb.out.length; oi++) { if (nb.out[oi] === pl.e) continue; if (Math.random() < 0.26 && pulses.length < 70) pulses.push({ e: nb.out[oi], t: 0, col: Math.random() < 0.14 ? VIOLET : pl.col, sp: pl.sp * (0.9 + Math.random() * 0.3), hx: undefined, hy: undefined }); }
            } else { pulses.splice(i, 1); continue; }
          }
          var hd = ptOn(nodes[e.a], nodes[e.b], pl.t); pl.hx = hd[0]; pl.hy = hd[1]; src.push({ x: hd[0], y: hd[1], r: 94 });
        }
        if (pulses.length < 20 && Math.random() < 0.5) spawn(soma, Math.random() < 0.5 ? TEAL : AQUA);
        if (ptr.on) src.push({ x: ptr.x, y: ptr.y, r: 165 });
      }
      function L(x, y) { var m = 0; for (var s = 0; s < src.length; s++) { var o = src[s], dx = x - o.x, dy = y - o.y, dd = dx * dx + dy * dy; if (dd < o.r * o.r) { var v = 1 - Math.sqrt(dd) / o.r; if (v > m) m = v; } } return m; }
      for (i = 0; i < nodes.length; i++) { n = nodes[i]; var l = L(n.x, n.y); if (reduced) { n.heat = l; } else { var dec = n.heat * 0.88; n.heat = dec > l ? dec : l; n.fire = n.fire > 0.004 ? n.fire * 0.9 : 0; } }
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      /* synapses — thin, weighted, fade toward edges, brighten on signal */
      for (i = 0; i < edges.length; i++) {
        e = edges[i]; A = nodes[e.a]; B = nodes[e.b]; var em = L(e.mx, e.my), na = (A.heat + B.heat) * 0.5, fr = (A.fire + B.fire) * 0.5, h = Math.max(em, na, fr), fd = (A.fade + B.fade) * 0.5;
        if (e.core) { ctx.strokeStyle = rgba(mix(TEAL, LIGHT, h), 0.32 + h * 0.6); ctx.lineWidth = e.w * (0.8 + h * 0.9); }
        else { ctx.strokeStyle = rgba(mix(TEAL, LIGHT, h), ((0.05 + 0.12 * e.wt) + h * 0.62) * fd); ctx.lineWidth = e.w * (0.5 + 0.5 * e.wt) + h * 1.2; }
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      }
      /* neurons — size hierarchy, fire flash, edge fade */
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i]; if (n.kind === "soma" || n.kind === "hub") continue;
        var nh = Math.max(n.heat, n.fire), fd2 = n.kind === "nucleus" ? 1 : n.fade, rr = n.r + nh * 1.8;
        if (nh > 0.08) { ctx.shadowBlur = 15 * nh; ctx.shadowColor = rgba(mix(TEAL, AQUA, n.fire), 0.95 * nh); } else ctx.shadowBlur = 0;
        var col = mix(TEAL, LIGHT, nh);
        ctx.fillStyle = rgba([6, 12, 13], fd2); ctx.beginPath(); ctx.arc(n.x, n.y, rr, 0, TAU); ctx.fill();
        ctx.strokeStyle = rgba(col, (0.4 + nh * 0.6) * fd2); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(n.x, n.y, rr, 0, TAU); ctx.stroke();
        ctx.fillStyle = rgba(col, (0.4 + nh * 0.6) * fd2); ctx.beginPath(); ctx.arc(n.x, n.y, rr * (0.42 + n.fire * 0.3), 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      }
      /* hub pads (membrane vertices) */
      for (i = 0; i < 6; i++) { n = nodes[hubs[i]]; var nh2 = Math.max(n.heat, n.fire, 0.3); ctx.shadowBlur = 12 * nh2; ctx.shadowColor = rgba(TEAL, 0.8 * nh2); ctx.fillStyle = rgba([6, 12, 13], 1); ctx.beginPath(); ctx.arc(n.x, n.y, n.r + nh2, 0, TAU); ctx.fill(); ctx.strokeStyle = rgba(mix(TEAL, LIGHT, nh2), 0.7); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(n.x, n.y, n.r + nh2, 0, TAU); ctx.stroke(); ctx.shadowBlur = 0; }
      /* NUCLEUS: bloom · membrane · nucleolus (breathing) */
      var breathe = 0.5 + 0.5 * Math.sin(tick * 0.035), sl = L(cx, cy), sb = 0.62 + sl * 0.38, sN = nodes[soma], mh = Math.max(sl, nodes[hubs[0]].fire, nodes[hubs[3]].fire);
      var sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, nucR * 1.25); sg.addColorStop(0, rgba(LIGHT, 0.09 + sl * 0.1 + breathe * 0.03)); sg.addColorStop(0.32, rgba(TEAL, 0.1 + sl * 0.08)); sg.addColorStop(1, rgba(TEAL, 0)); ctx.fillStyle = sg; ctx.fillRect(cx - nucR * 1.3, cy - nucR * 1.3, 2.6 * nucR, 2.6 * nucR);
      ctx.strokeStyle = rgba(TEAL, 0.12 + mh * 0.16); ctx.lineWidth = 1.0; hexPath(1.18); ctx.stroke();
      ctx.shadowBlur = 13 * (0.4 + mh * 0.6); ctx.shadowColor = rgba(TEAL, 0.6); ctx.strokeStyle = rgba(mix(TEAL, LIGHT, mh), 0.55 + mh * 0.4); ctx.lineWidth = 1.7; hexPath(1.0); ctx.stroke(); ctx.shadowBlur = 0;
      ctx.strokeStyle = rgba(TEAL, 0.2 + sl * 0.2); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, sN.r * 1.9 + sl * 2 + breathe * 1.5, 0, TAU); ctx.stroke();
      ctx.strokeStyle = rgba(TEAL, 0.1); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, sN.r * 3.0 + breathe * 2, 0, TAU); ctx.stroke();
      ctx.shadowBlur = 26 * sb; ctx.shadowColor = rgba(AQUA, sb); ctx.fillStyle = rgba([6, 12, 13], 1); ctx.beginPath(); ctx.arc(cx, cy, sN.r + sl * 2, 0, TAU); ctx.fill(); ctx.strokeStyle = rgba(LIGHT, 0.85 + sl * 0.15); ctx.lineWidth = 1.7; ctx.beginPath(); ctx.arc(cx, cy, sN.r + sl * 2, 0, TAU); ctx.stroke();
      var ng = ctx.createRadialGradient(cx, cy, 0, cx, cy, sN.r); ng.addColorStop(0, rgba(LIGHT, 0.97)); ng.addColorStop(1, rgba(AQUA, 0.55 + breathe * 0.2)); ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(cx, cy, sN.r * (0.6 + breathe * 0.08), 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      /* travelling signals */
      for (i = 0; i < pulses.length; i++) {
        var p = pulses[i]; e = edges[p.e]; if (!e) continue; A = nodes[e.a]; B = nodes[e.b]; var t1 = p.t, t0 = t1 - 0.5; if (t0 < 0) t0 = 0;
        for (k = 0; k < 7; k++) { var pa = ptOn(A, B, lerp(t0, t1, k / 7)), pb = ptOn(A, B, lerp(t0, t1, (k + 1) / 7)), aa = k / 7; ctx.strokeStyle = rgba(p.col, aa * aa * 0.6); ctx.lineWidth = 0.7 + aa * 2.0; ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke(); }
        var hx = p.hx, hy = p.hy; if (hx === undefined) { var h0 = ptOn(A, B, t1); hx = h0[0]; hy = h0[1]; }
        var grd = ctx.createRadialGradient(hx, hy, 0, hx, hy, 52); grd.addColorStop(0, rgba(p.col, 0.14)); grd.addColorStop(1, rgba(p.col, 0)); ctx.fillStyle = grd; ctx.fillRect(hx - 52, hy - 52, 104, 104);
        ctx.shadowBlur = 16; ctx.shadowColor = rgba(p.col, 1); ctx.fillStyle = rgba(LIGHT, 0.98); ctx.beginPath(); ctx.arc(hx, hy, 2.1, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      }
      if (ptr.on) { var gg = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, 150); gg.addColorStop(0, rgba(TEAL, 0.09)); gg.addColorStop(1, rgba(TEAL, 0)); ctx.fillStyle = gg; ctx.fillRect(ptr.x - 150, ptr.y - 150, 300, 300); }
    }

    reset();
    if (reduced) { frame(); return; }
    raf = requestAnimationFrame(frame);

    heroEl.addEventListener("pointermove", function (ev) {
      var r = canvas.getBoundingClientRect();
      ptr.tx = ev.clientX - r.left; ptr.ty = ev.clientY - r.top; ptr.on = true;
      if (ptr.x < -1e3) { ptr.x = ptr.tx; ptr.y = ptr.ty; }
      if (++ptr.acc % 5 === 0) { var nn = nearest(ptr.tx, ptr.ty, 150); if (nn >= 0) spawn(nn, Math.random() < 0.5 ? VIOLET : AQUA); }
    }, { passive: true });
    heroEl.addEventListener("pointerleave", function () { ptr.on = false; ptr.tx = ptr.ty = -1e4; });

    var rz; window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(reset, 220); }, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = null; } }
      else if (!raf && !reduced) raf = requestAnimationFrame(frame);
    });
  })();
})();
