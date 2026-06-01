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

  /* ── Hero: a luminous world-tree — curved limbs, flowing light, pointer halo ── */
  (function heroTree() {
    var canvas = document.getElementById("heroCanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var heroEl = canvas.closest(".hero") || canvas.parentElement;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var nodes = [], edges = [], pulses = [], raf = null;
    var ptr = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, on: false, acc: 0 };
    var R = 165, R2 = R * R;
    var TEAL = [79, 209, 197], AQUA = [45, 212, 191], VIOLET = [167, 139, 250], LIGHT = [233, 246, 244];

    function lerp(a, b, t) { return a + (b - a) * t; }
    function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
    function mix(c1, c2, t) { return [lerp(c1[0], c2[0], t) | 0, lerp(c1[1], c2[1], t) | 0, lerp(c1[2], c2[2], t) | 0]; }
    function bez(A, e, B, t) { return [A.x + (B.x - A.x) * t, A.y + (B.y - A.y) * t]; }

    function addNode(x, y, depth) { nodes.push({ bx: x, by: y, x: x, y: y, depth: depth, heat: 0, ph: Math.random() * 6.2832, out: [] }); return nodes.length - 1; }
    function addEdge(a, b) {
      var i = edges.length, B = nodes[b], side = B.x < W * 0.5 ? -1 : 1;
      edges.push({ a: a, b: b, heat: 0, cx: 0, cy: 0, bow: (0.18 + Math.random() * 0.22) * side });
      nodes[a].out.push(i); return i;
    }

    function build() {
      nodes = []; edges = [];
      var rx = W * 0.5, up = -Math.PI / 2;
      var root = addNode(rx, H * 1.12, 0);
      var trunkA = addNode(rx, H * 0.72, 1);          // lower trunk
      addEdge(root, trunkA);
      var trunkB = addNode(rx + W * 0.02, H * 0.52, 1); // gentle bend, upper trunk
      addEdge(trunkA, trunkB);
      var maxD = 4;
      function grow(parent, ang, len, d) {
        if (d > maxD || len < H * 0.045 || nodes.length > 110) return;
        var p = nodes[parent];
        var c = addNode(p.x + Math.cos(ang) * len, p.y + Math.sin(ang) * len, d);
        addEdge(parent, c);
        var nb = d >= maxD ? 0 : (Math.random() < 0.7 ? 2 : 1);
        if (d === 2 && Math.random() < 0.3) nb = 3;
        var spread = lerp(0.6, 0.44, (d - 2) / 2);
        for (var k = 0; k < nb; k++) {
          var off = nb === 1 ? (Math.random() - 0.5) * 0.32 : lerp(-spread, spread, k / (nb - 1));
          grow(c, ang + off, len * (0.8 - 0.02 * d) * (0.9 + Math.random() * 0.18), d + 1);
        }
      }
      // two low limbs sweep wide; an open canopy fans from the upper trunk
      grow(trunkA, up - 0.95, H * 0.15, 2);
      grow(trunkA, up + 0.95, H * 0.15, 2);
      grow(trunkB, up - 0.55, H * 0.17, 2);
      grow(trunkB, up - 0.18, H * 0.18, 2);
      grow(trunkB, up + 0.18, H * 0.18, 2);
      grow(trunkB, up + 0.55, H * 0.17, 2);
    }

    function spawn(fromNode, col) {
      if (pulses.length > 24) return;
      var n = nodes[fromNode];
      if (!n || !n.out.length) return;
      pulses.push({ e: n.out[(Math.random() * n.out.length) | 0], t: 0, col: col, sp: 0.006 + Math.random() * 0.006 });
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
    function reset() { size(); build(); pulses = []; for (var i = 0; i < 13; i++) spawn(0, i % 2 ? AQUA : TEAL); }

    function aurora(ts) {
      var ax = W * (0.5 + 0.14 * Math.sin(ts * 0.00016)), ay = H * (0.58 + 0.08 * Math.cos(ts * 0.00012));
      var g = ctx.createRadialGradient(ax, ay, 0, ax, ay, Math.max(W, H) * 0.55);
      g.addColorStop(0, rgba(VIOLET, 0.05)); g.addColorStop(0.45, rgba(TEAL, 0.045)); g.addColorStop(1, rgba(TEAL, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }

    function frame(ts) {
      raf = requestAnimationFrame(frame);
      if (ptr.tx > -1e3) { ptr.x += (ptr.tx - ptr.x) * 0.14; ptr.y += (ptr.ty - ptr.y) * 0.14; }
      ctx.clearRect(0, 0, W, H);
      aurora(ts);
      // luminous root anchor at the base of the trunk
      var rg = ctx.createRadialGradient(W * 0.5, H * 1.0, 0, W * 0.5, H * 1.0, H * 0.55);
      rg.addColorStop(0, rgba(TEAL, 0.09)); rg.addColorStop(0.6, rgba(TEAL, 0.03)); rg.addColorStop(1, rgba(TEAL, 0));
      ctx.fillStyle = rg; ctx.fillRect(0, H * 0.42, W, H * 0.58);
      var i, k, n, e, A, B;

      // gentle breathing
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        var amp = n.depth > 1 ? Math.min(7, n.depth * 1.5) : 0;
        n.x = n.bx + Math.sin(ts * 0.0006 + n.ph) * amp;
        n.y = n.by + Math.cos(ts * 0.00052 + n.ph) * amp * 0.55;
      }
      // straight limbs: just the midpoint (for light sampling)
      for (i = 0; i < edges.length; i++) {
        e = edges[i]; A = nodes[e.a]; B = nodes[e.b];
        e.mx = (A.x + B.x) * 0.5; e.my = (A.y + B.y) * 0.5;
      }
      // advance the travelling light; each head is a MOVING POINT LIGHT
      var src = [];
      for (i = pulses.length - 1; i >= 0; i--) {
        var pl = pulses[i]; pl.t += pl.sp; e = edges[pl.e];
        if (pl.t >= 1) {
          var nb = nodes[e.b];
          if (nb.out.length) { pl.e = nb.out[(Math.random() * nb.out.length) | 0]; pl.t = 0; e = edges[pl.e]; }
          else { pulses.splice(i, 1); continue; }
        }
        var hh = bez(nodes[e.a], e, nodes[e.b], pl.t);
        pl.hx = hh[0]; pl.hy = hh[1];
        src.push({ x: hh[0], y: hh[1], r: 100 });
      }
      if (pulses.length < 13 && Math.random() < 0.11) spawn(0, Math.random() < 0.5 ? TEAL : AQUA);
      if (ptr.on) src.push({ x: ptr.x, y: ptr.y, r: 160 });

      // light intensity at a point = nearest source falloff (inverse-distance, clamped)
      function lightAt(x, y) {
        var m = 0;
        for (var s = 0; s < src.length; s++) {
          var o = src[s], dx = x - o.x, dy = y - o.y, d2 = dx * dx + dy * dy;
          if (d2 < o.r * o.r) { var v = 1 - Math.sqrt(d2) / o.r; if (v > m) m = v; }
        }
        return m;
      }

      // each node lit by how close the moving light is (its own limb AND neighbours), with a short afterglow
      for (i = 0; i < nodes.length; i++) { n = nodes[i]; var L = lightAt(n.x, n.y), dec = n.heat * 0.86; n.heat = dec > L ? dec : L; }

      // limbs — brightness from the light that actually reaches the limb, not an on/off per branch
      ctx.lineCap = "round";
      for (i = 0; i < edges.length; i++) {
        e = edges[i]; A = nodes[e.a]; B = nodes[e.b];
        var em = lightAt(e.mx, e.my), na = (A.heat + B.heat) * 0.5, h = em > na ? em : na;
        ctx.strokeStyle = rgba(mix(TEAL, LIGHT, h), 0.06 + h * 0.62);
        ctx.lineWidth = 0.7 + h * 1.9;
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      }
      // nodes glow softly by their own light level
      for (i = 1; i < nodes.length; i++) {
        n = nodes[i]; var tip = n.out.length === 0, nh = n.heat;
        if (nh > 0.18) { ctx.shadowBlur = 12 * nh; ctx.shadowColor = rgba(TEAL, 0.8 * nh); } else ctx.shadowBlur = 0;
        if (tip || nh > 0.05) {
          ctx.fillStyle = rgba(mix(TEAL, LIGHT, nh), (tip ? 0.42 : 0.16) + nh * 0.58);
          ctx.beginPath(); ctx.arc(n.x, n.y, (tip ? 1.5 : 0.9) * (1 + nh * 1.7), 0, 6.2832); ctx.fill();
        }
      }
      ctx.shadowBlur = 0;

      // the light itself: comet head + gradient tail along its limb + an ambient spill halo
      for (i = 0; i < pulses.length; i++) {
        var p = pulses[i]; e = edges[p.e]; if (!e) continue; A = nodes[e.a]; B = nodes[e.b];
        var t1 = p.t, t0 = t1 - 0.42; if (t0 < 0) t0 = 0;
        for (k = 0; k < 7; k++) {
          var pa = bez(A, e, B, lerp(t0, t1, k / 7)), pb = bez(A, e, B, lerp(t0, t1, (k + 1) / 7)), aa = k / 7;
          ctx.strokeStyle = rgba(p.col, aa * aa * 0.5); ctx.lineWidth = 0.5 + aa * 2;
          ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
        }
        var hx = p.hx, hy = p.hy;
        if (hx === undefined) { var h0 = bez(A, e, B, t1); hx = h0[0]; hy = h0[1]; }
        var sg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 66);
        sg.addColorStop(0, rgba(p.col, 0.11)); sg.addColorStop(1, rgba(p.col, 0));
        ctx.fillStyle = sg; ctx.fillRect(hx - 66, hy - 66, 132, 132);
        ctx.shadowBlur = 20; ctx.shadowColor = rgba(p.col, 1);
        ctx.fillStyle = rgba(LIGHT, 0.98);
        ctx.beginPath(); ctx.arc(hx, hy, 2.3, 0, 6.2832); ctx.fill();
        ctx.shadowBlur = 0;
      }

      // pointer halo
      if (ptr.on) {
        var gg = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, 140);
        gg.addColorStop(0, rgba(TEAL, 0.1)); gg.addColorStop(1, rgba(TEAL, 0));
        ctx.fillStyle = gg; ctx.fillRect(ptr.x - 140, ptr.y - 140, 280, 280);
      }
    }

    function drawStatic() {
      size(); build();
      ctx.clearRect(0, 0, W, H); aurora(0); ctx.lineCap = "round";
      for (var i = 0; i < edges.length; i++) {
        var a = nodes[edges[i].a], b = nodes[edges[i].b];
        ctx.strokeStyle = rgba(TEAL, 0.17); ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      for (i = 1; i < nodes.length; i++) { var tip = nodes[i].out.length === 0; ctx.fillStyle = rgba(TEAL, tip ? 0.5 : 0.3); ctx.beginPath(); ctx.arc(nodes[i].x, nodes[i].y, tip ? 1.5 : 1, 0, 6.2832); ctx.fill(); }
    }

    if (reduced) { drawStatic(); return; }

    reset();
    raf = requestAnimationFrame(frame);

    heroEl.addEventListener("pointermove", function (ev) {
      var r = canvas.getBoundingClientRect();
      ptr.tx = ev.clientX - r.left; ptr.ty = ev.clientY - r.top; ptr.on = true;
      if (ptr.x < -1e3) { ptr.x = ptr.tx; ptr.y = ptr.ty; }
      if (++ptr.acc % 6 === 0) { var nn = nearest(ptr.tx, ptr.ty, 140); if (nn > 0) spawn(nn, Math.random() < 0.5 ? VIOLET : AQUA); }
    }, { passive: true });
    heroEl.addEventListener("pointerleave", function () { ptr.on = false; ptr.tx = ptr.ty = -1e4; });

    var rz; window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(reset, 220); }, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = null; } }
      else if (!raf) raf = requestAnimationFrame(frame);
    });
  })();
})();
