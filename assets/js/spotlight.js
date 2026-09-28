/*
 * Spotlight theme for the lab pages (Writeups, Blog, Homelab, whoami).
 * Loaded when <html> has data-spot (layouts/_default/baseof.html). On Home and
 * Resume (homeSpotlight in params.toml) only part 1, the cursor glow, runs;
 * everything after it is for data-room="lab" pages.
 * Styles: assets/css/site/95-spotlight.css and assets/css/lab/<page>.css.
 *
 * Everything here is an extra. Without JavaScript the pages read the same:
 * the status bar stays hidden, filters show every item, and the title is
 * already in its final colours.
 *
 * 1. Cursor spotlight and lit card borders (mouse and trackpad only)
 * 2. Title scramble, the same effect as the hero name on the homepage
 * 3. Status bar keys: j/k move, r random, t lights, s subscribe, p parrot,
 *    ? help, Escape closes help. Ignored while typing or with a modifier.
 * 4. Writeups filters (skill and tool)
 * 5. Copy buttons (RSS addresses)
 * 6. Section tracker for the on-this-page list
 * 7. The parrot
 */
(function () {
  "use strict";
  var root = document.documentElement;
  if (!root.hasAttribute("data-spot")) return;
  var lab = root.getAttribute("data-room") === "lab";

  var mq = function (q) { return window.matchMedia && window.matchMedia(q).matches; };
  var reduced = mq("(prefers-reduced-motion: reduce)");
  var fine = mq("(pointer: fine)");
  var $$ = function (sel, el) { return [].slice.call((el || document).querySelectorAll(sel)); };

  /* ---- 1 · spotlight ---------------------------------------------------- */
  if (fine) {
    window.addEventListener("pointermove", function (e) {
      root.style.setProperty("--mx", e.clientX + "px");
      root.style.setProperty("--my", e.clientY + "px");
    }, { passive: true });
  }
  if (!lab) return;
  root.classList.add("lab-js");
  if (fine) {
    $$(".lit").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--x", (e.clientX - r.left) + "px");
        c.style.setProperty("--y", (e.clientY - r.top) + "px");
      }, { passive: true });
    });
  }

  /* ---- 2 · title scramble ----------------------------------------------- */
  var title = document.querySelector("[data-scramble]");
  if (title && !reduced) {
    var GLYPHS = "!<>-_\\/[]{}=+*^?#01ABCDEF";
    var target = title.textContent.trim(), frame = 0, total = 22;
    title.style.minWidth = title.offsetWidth + "px";
    title.classList.add("scrambling");
    var iv = setInterval(function () {
      var out = "";
      for (var c = 0; c < target.length; c++) {
        if (target[c] === " ") { out += " "; continue; }
        var settleAt = (c / target.length) * total * 0.72;
        out += frame > settleAt + 3 ? target[c] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      title.textContent = out;
      if (++frame > total) {
        clearInterval(iv);
        title.textContent = target;
        title.classList.add("settling");
        title.classList.remove("scrambling");
        title.style.minWidth = "";
      }
    }, 40);
  }

  /* ---- 3 · status bar ---------------------------------------------------- */
  var bar = document.querySelector("[data-keys]");
  var msg = bar && bar.querySelector("[data-msg]");
  var pos = bar && bar.querySelector("[data-pos]");
  var LABEL = bar ? bar.getAttribute("data-label") : "item";
  var RAND = bar ? bar.getAttribute("data-rand") : "";
  var navs = bar && bar.getAttribute("data-items") ? $$(bar.getAttribute("data-items")) : [];
  var cur = -1, sayT;
  var visible = function (el) { return el.offsetParent !== null; };

  function say(s) {
    if (!msg) return;
    msg.textContent = s;
    clearTimeout(sayT);
    sayT = setTimeout(function () { msg.textContent = ""; }, 2200);
  }
  function showPos() {
    if (!pos) return;
    var list = navs.filter(visible);
    pos.textContent = LABEL + " " + (cur < 0 ? "-" : list.indexOf(navs[cur]) + 1) + "/" + list.length;
  }
  function mark(i) {
    navs.forEach(function (n) { n.classList.remove("is-focus"); });
    cur = i;
    var n = navs[i];
    if (!n) return;
    n.classList.add("is-focus");
    var a = n.matches("a") ? n : n.querySelector("a[href]");
    if (a) a.focus({ preventScroll: true });
    n.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    showPos();
  }
  function go(d) {
    var list = navs.filter(visible);
    if (!list.length) return;
    var at = cur < 0 ? -1 : list.indexOf(navs[cur]);
    var i = at < 0 ? (d > 0 ? 0 : list.length - 1) : Math.min(Math.max(at + d, 0), list.length - 1);
    mark(navs.indexOf(list[i]));
  }
  function roll() {
    var r = RAND ? $$(RAND).filter(visible) : [];
    if (!r.length) return;
    var p = r[Math.floor(Math.random() * r.length)];
    r.forEach(function (x) { x.classList.remove("flash"); });
    p.classList.add("flash");
    p.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    var a = p.querySelector("a[href]");
    if (a) a.focus({ preventScroll: true });
    var out = document.querySelector("[data-shuf-out]"), tt = p.querySelector(".card-title");
    if (out && tt) out.textContent = tt.textContent.trim();
    say("rolled one");
  }
  $$("[data-shuf]").forEach(function (b) { b.addEventListener("click", roll); });

  var help = bar && bar.querySelector("[data-help]");
  var pop = bar && bar.querySelector("[data-help-pop]");
  function hp(open) {
    if (!pop) return;
    var o = open === undefined ? pop.hidden : open;
    pop.hidden = !o;
    help.setAttribute("aria-expanded", o ? "true" : "false");
  }
  if (help) help.addEventListener("click", function () { hp(); });

  if (bar) {
    /* hide the hints this page has nothing for */
    if (!navs.length) $$("[data-need=items]", bar).forEach(function (h) { h.hidden = true; });
    if (!RAND || !$$(RAND).length) $$("[data-need=rand]", bar).forEach(function (h) { h.hidden = true; });
    showPos();
    document.addEventListener("keydown", function (e) {
      var t = e.target, tag = t && t.tagName;
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
      var sw = document.getElementById("search-wrapper");
      if (sw && sw.style.visibility === "visible") return;
      var k = e.key;
      if (k === "j" && navs.length) go(1);
      else if (k === "k" && navs.length) go(-1);
      else if (k === "r" && RAND) roll();
      else if (k === "t") {
        root.classList.toggle("lights-off");
        say(root.classList.contains("lights-off") ? "lights off" : "lights on");
      }
      else if (k === "?") hp();
      else if (k === "Escape") hp(false);
      else {
        var el = k.length === 1 && document.querySelector('[data-key="' + k + '"]');
        if (!el) return;
        el.click();
        if (el.getAttribute("data-say")) say(el.getAttribute("data-say"));
      }
    });
  }

  /* ---- 4 · writeups filters ---------------------------------------------
     Buttons carry data-f="skill:<key>", "tool:<key>" or "all"; items carry
     the same tokens in data-tags. One filter at a time; pressing the active
     one again clears it. */
  var fbtns = $$("[data-f]");
  if (fbtns.length) {
    var empty = document.querySelector("[data-empty]");
    fbtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-f");
        if (b.getAttribute("aria-pressed") === "true" && f !== "all") f = "all";
        fbtns.forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-f") === f ? "true" : "false"); });
        var shown = 0;
        $$("[data-tags]").forEach(function (it) {
          var ok = f === "all" || (" " + it.getAttribute("data-tags") + " ").indexOf(" " + f + " ") > -1;
          it.classList.toggle("is-hidden", !ok);
          if (ok) shown++;
        });
        if (empty) empty.classList.toggle("is-hidden", shown > 0);
        cur = -1;
        showPos();
      });
    });
  }

  /* ---- 5 · copy buttons -------------------------------------------------- */
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var code = b.parentNode.querySelector("[data-url]"), url = code.textContent.trim();
      var label = b.textContent;
      function done(ok) {
        b.textContent = ok ? "copied" : "press ⌘C";
        b.classList.toggle("ok", ok);
        setTimeout(function () { b.textContent = label; b.classList.remove("ok"); }, 1800);
      }
      function select() {
        var r = document.createRange(); r.selectNodeContents(code);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      }
      try { navigator.clipboard.writeText(url).then(function () { done(true); }, function () { select(); done(false); }); }
      catch (err) { select(); done(false); }
    });
  });

  /* ---- 6 · on-this-page tracker ----------------------------------------- */
  var tocLinks = $$(".ltoc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var id = e.target.getAttribute("data-sect");
        tocLinks.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + id;
          a.classList.toggle("on", on);
          if (on) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    $$(".sect[data-sect]").forEach(function (s) { io.observe(s); });
  }

  /* ---- 7 · the parrot ------------------------------------------------------ */
  var parrot = document.querySelector("[data-parrot]");
  if (parrot) {
    var words = ["squawk!", "hello!", "brrrp?", "*modem noises*", "hola!", "who's there?", "ding ding", "pretty bird"], w = 0;
    var bubble = document.querySelector("[data-sq]"), cloud = document.querySelector(".squawk");
    parrot.addEventListener("click", function () {
      w = (w + 1) % words.length;
      if (bubble) bubble.textContent = words[w];
      var live = document.querySelector("[data-sq-live]");
      if (live) live.textContent = "The parrot says: " + words[w];
      if (cloud && !reduced) { cloud.classList.remove("pop"); void cloud.getBoundingClientRect(); cloud.classList.add("pop"); }
    });
  }
})();
