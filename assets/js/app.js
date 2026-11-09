/* ==========================================================================
   立夏衣语 — 交互
   ========================================================================== */
(function () {
  "use strict";

  var DATA = window.SITE_DATA;
  var ERAS = DATA.eras;
  var LATIN = {
    "pre-qin": "PRE-QIN", "qin-han": "QIN · HAN", "wei-jin": "WEI · JIN",
    "sui-tang": "SUI · TANG", "song-yuan": "SONG · YUAN", "ming-qing": "MING · QING",
    "modern": "MODERN", "contemporary": "TODAY"
  };

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  var ARROW = '<svg viewBox="0 0 30 10" aria-hidden="true"><path d="M0 5h28M23 1l5 4-5 4"/></svg>';

  // keep the source citation (after the em dash) from breaking across lines
  function previewHtml(s) {
    var k = String(s).lastIndexOf("——");
    if (k < 0) return esc(s);
    return esc(s.slice(0, k)) + '<span class="nowrap">' + esc(s.slice(k)) + "</span>";
  }

  /* ------------------------------------------------------------------ */
  /* 1. Render timeline                                                  */
  /* ------------------------------------------------------------------ */
  function mediaBlock(m, mode) {
    if (!m) return "";
    if (m.kind === "scan" || m.kind === "photo") {
      return '<div class="era__frame"><img src="' + esc(m.src) + '" alt="' + esc(m.caption || "") +
        '" loading="lazy" decoding="async"></div><figcaption>' +
        (m.kind === "scan" ? "史料书影" : "影像") + "</figcaption>";
    }
    return '<div class="era__art"><b>' + esc(m.keyword) + "</b><i>" + esc(m.sub || "") +
      "</i></div>";
  }

  function renderTimeline() {
    var list = $("#timelineList");
    var html = ERAS.map(function (e, i) {
      return '<article class="era reveal" data-index="' + i + '" data-id="' + e.id +
        '" tabindex="0" role="button" aria-haspopup="dialog" aria-label="' +
        esc(e.dynasty + "：" + e.title + "，点击展卷") + '">' +
        '<div class="era__mark"><span class="era__dot" aria-hidden="true">' + esc(e.no) + "</span></div>" +
        '<div class="era__body">' +
          '<div class="era__meta"><span>' + esc(e.years) + '</span><span class="sep"></span><span>' + esc(e.tag) + "</span></div>" +
          '<h3 class="era__dyn">' + esc(e.dynasty) + " <small>" + esc(LATIN[e.id] || "") + "</small></h3>" +
          '<p class="era__title">' + esc(e.title) + "</p>" +
          '<p class="era__gist">' + esc(e.gist) + "</p>" +
          (e.preview ? '<p class="era__quote">' + previewHtml(e.preview) + "</p>" : "") +
          '<ul class="era__chips">' + e.chips.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>" +
          '<span class="era__open">展卷 · 史料与故事 ' + ARROW + "</span>" +
        "</div>" +
        '<figure class="era__figure">' + mediaBlock(e.media, "era") + "</figure>" +
        "</article>";
    }).join("");
    list.insertAdjacentHTML("beforeend", html);

    $$(".era", list).forEach(function (el) {
      var idx = Number(el.getAttribute("data-index"));
      el.addEventListener("click", function () { openViewer(idx); });
      el.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " " || ev.key === "Spacebar") {
          ev.preventDefault();
          openViewer(idx);
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 2. Materials                                                        */
  /* ------------------------------------------------------------------ */
  function renderMaterials() {
    var host = $("#matList");
    host.innerHTML = DATA.materials.map(function (m) {
      var bars = Object.keys(m.bars).map(function (k) {
        var n = m.bars[k], dots = "";
        for (var i = 1; i <= 5; i++) dots += '<b class="' + (i <= n ? "on" : "") + '"></b>';
        return '<div class="bar"><span>' + esc(k) + "</span><i>" + dots + "</i></div>";
      }).join("");
      return '<article class="mat">' +
        '<span class="mat__idx">' + esc(m.idx) + "</span>" +
        '<h3 class="mat__name">' + esc(m.name) + "</h3>" +
        '<p class="mat__sub">' + esc(m.sub) + "</p>" +
        '<p class="mat__desc">' + esc(m.desc) + "</p>" +
        '<div class="mat__bars">' + bars + "</div>" +
        "</article>";
    }).join("");
  }

  /* ------------------------------------------------------------------ */
  /* 3. Sources                                                          */
  /* ------------------------------------------------------------------ */
  function renderSources() {
    var host = $("#sourceList");
    host.innerHTML = DATA.sources.map(function (s, i) {
      return '<article class="source-card" data-i="' + i + '" tabindex="0" role="button" aria-expanded="false">' +
        '<div class="source-card__top"><span class="source-card__era">' + esc(s.era) +
        '</span><span class="source-card__plus" aria-hidden="true"></span></div>' +
        '<p class="source-card__quote">' + esc(s.quote) + "</p>" +
        '<p class="source-card__src">' + esc(s.source) + "</p>" +
        '<div class="source-card__more"><p>' + esc(s.note) + "</p>" +
        '<a class="source-card__link" href="#timeline" data-era="' + esc(s.eraId) + '">' +
        esc(s.link) + " →</a></div>" +
        "</article>";
    }).join("");

    $$(".source-card", host).forEach(function (card) {
      var toggle = function () {
        var open = card.classList.toggle("is-open");
        card.setAttribute("aria-expanded", open ? "true" : "false");
      };
      card.addEventListener("click", function (ev) {
        if (ev.target.closest("[data-era]")) return;
        toggle();
      });
      card.addEventListener("keydown", function (ev) {
        if (ev.target.closest("[data-era]")) return;
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); toggle(); }
      });
    });

    $$("[data-era]", host).forEach(function (a) {
      a.addEventListener("click", function (ev) {
        var id = a.getAttribute("data-era");
        var idx = ERAS.findIndex(function (e) { return e.id === id; });
        if (idx < 0) return;
        ev.preventDefault();
        closeAllSources();
        openViewer(idx);
      });
    });
  }
  function closeAllSources() {
    $$(".source-card.is-open").forEach(function (c) {
      c.classList.remove("is-open");
      c.setAttribute("aria-expanded", "false");
    });
  }

  function renderRefs() {
    $("#refList").innerHTML = DATA.refs.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("");
  }

  /* ------------------------------------------------------------------ */
  /* 4. Viewer                                                           */
  /* ------------------------------------------------------------------ */
  var viewer = $("#viewer");
  var panel = $("#scrollPanel");
  var body = $("#scrollBody");
  var closeBtn = $("#closeViewer");
  var lastTrigger = null;
  var current = 0;
  var lockedY = 0;
  var closeTimer = null;

  function mediaMarkup(m) {
    if (!m) return "";
    if (m.kind === "art") {
      return '<div class="v-media__art"><b>' + esc(m.keyword) + "</b><i>" + esc(m.sub || "") + "</i></div>" +
        "<figcaption>" + esc(m.note || "") + "</figcaption>";
    }
    return '<div class="v-media__frame"><img src="' + esc(m.src) + '" alt="' + esc(m.caption || "") +
      '" loading="lazy" decoding="async"></div><figcaption>' + esc(m.caption || "") + "</figcaption>";
  }

  function renderViewer(i) {
    current = i;
    var e = ERAS[i];
    var quote = e.quote;
    var note = quote ? quote.note : (e.note || "");
    var facts = e.blocks.map(function (b) {
      return "<dt>" + esc(b.k) + "</dt><dd>" + esc(b.t) + "</dd>";
    }).join("");

    var quoteHtml = "";
    if (quote) {
      quoteHtml += '<blockquote class="v-quote"><p>' + esc(quote.text) + "</p><cite>" + esc(quote.source) + "</cite></blockquote>";
    }
    if (e.stats) {
      quoteHtml += '<div class="v-stats">' + e.stats.map(function (s) {
        return "<div><b>" + esc(s.v) + "</b><small>" + esc(s.l) + "</small></div>";
      }).join("") + "</div>";
    }
    var quote2 = e.quote2
      ? '<blockquote class="v-quote v-quote--second"><p>' + esc(e.quote2.text) + "</p><cite>" + esc(e.quote2.source) + "</cite></blockquote>"
      : "";

    body.innerHTML =
      '<header class="v-head">' +
        '<div class="v-num" aria-hidden="true">' + esc(e.no) + "</div>" +
        "<div>" +
          '<div class="v-eyebrow"><span>第 ' + (i + 1) + " 卷</span><i></i><span>" + esc(e.tag) +
          "</span><i></i><span>" + esc(e.years) + "</span></div>" +
          '<h2 class="v-dyn" id="vTitle">' + esc(e.dynasty) + "</h2>" +
          '<p class="v-title">' + esc(e.title) + "</p>" +
        "</div>" +
      "</header>" +
      '<div class="v-grid">' +
        '<figure class="v-media">' + mediaMarkup(e.media) + "</figure>" +
        '<div class="v-text">' +
          '<p class="v-lead">' + esc(e.gist) + "</p>" +
          '<dl class="v-facts">' + facts + "</dl>" +
          quoteHtml +
          '<p class="v-note">' + esc(note) + "</p>" +
          quote2 +
          '<ul class="v-tags">' + e.chips.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>" +
          '<div class="v-fact"><b>' + esc(e.fact.label) + "</b><p>" + esc(e.fact.text) + "</p></div>" +
        "</div>" +
      "</div>" +
      '<footer class="v-foot">' +
        '<button class="v-nav v-nav--prev" data-go="-1" ' + (i === 0 ? "disabled" : "") + ">" +
          ARROW + "<span>上一卷</span></button>" +
        '<span class="v-count">第 ' + (i + 1) + " / " + ERAS.length + " 卷</span>" +
        '<button class="v-nav v-nav--next" data-go="1" ' + (i === ERAS.length - 1 ? "disabled" : "") + ">" +
          "<span>下一卷</span>" + ARROW + "</button>" +
      "</footer>";

    $$("[data-go]", body).forEach(function (b) {
      b.addEventListener("click", function () {
        var n = current + Number(b.getAttribute("data-go"));
        if (n >= 0 && n < ERAS.length) renderViewer(n);
      });
    });

    var sc = $(".scroll__body");
    sc.scrollTop = 0;
    closeBtn.focus({ preventScroll: true });
  }

  function openViewer(i) {
    if (i == null || i < 0 || i >= ERAS.length) return;
    lastTrigger = document.activeElement;
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    viewer.hidden = false;
    void viewer.offsetWidth;
    viewer.classList.add("is-open");
    renderViewer(i);
    closeBtn.focus({ preventScroll: true });
    lockedY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = "-" + lockedY + "px";
    document.body.style.width = "100%";
    document.body.classList.add("is-locked");
    $$(".era").forEach(function (el) {
      el.classList.toggle("is-active", Number(el.getAttribute("data-index")) === i);
    });
    document.addEventListener("keydown", onKeydown);
  }

  function closeViewer() {
    if (viewer.hidden) return;
    viewer.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, lockedY);
    document.removeEventListener("keydown", onKeydown);
    $$(".era.is-active").forEach(function (el) { el.classList.remove("is-active"); });
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(function () {
      viewer.hidden = true;
      body.innerHTML = "";
      closeTimer = null;
    }, 380);
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus({ preventScroll: true });
  }

  function onKeydown(ev) {
    if (ev.key === "Escape") { ev.preventDefault(); closeViewer(); return; }
    if (ev.key === "ArrowRight") {
      if (current < ERAS.length - 1) { ev.preventDefault(); renderViewer(current + 1); }
    }
    if (ev.key === "ArrowLeft") {
      if (current > 0) { ev.preventDefault(); renderViewer(current - 1); }
    }
    if (ev.key === "Tab") {
      var f = $$('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])', panel);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    }
  }

  if (viewer) {
    viewer.addEventListener("click", function (ev) {
      if (ev.target.closest("[data-close]")) closeViewer();
    });
    closeBtn.addEventListener("click", closeViewer);
  }

  function setupPlates() {
    $$(".plate[data-era]").forEach(function (p) {
      var open = function () {
        var id = p.getAttribute("data-era");
        var idx = ERAS.findIndex(function (e) { return e.id === id; });
        if (idx >= 0) openViewer(idx);
      };
      p.addEventListener("click", open);
      p.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); open(); }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 5. Scroll: progress, reveal, nav state                              */
  /* ------------------------------------------------------------------ */
  var fill = $("#timelineFill");
  var readbar = $("#readbar");
  var nav = $("#nav");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    if (readbar) readbar.style.transform = "scaleX(" + Math.min(1, Math.max(0, y / (docH || 1))) + ")";
    if (nav) nav.classList.toggle("is-solid", y > 60);

    if (fill) {
      var tl = $("#timelineList");
      var r = tl.getBoundingClientRect();
      var vh = window.innerHeight;
      var total = r.height || 1;
      var passed = Math.min(total, Math.max(0, vh * 0.55 - r.top));
      fill.style.transform = "scaleY(" + (passed / total) + ")";
    }
    ticking = false;
  }

  function requestScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScroll);
  }

  function setupReveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  function setupNav() {
    var toggle = $("#navToggle");
    var links = $("#navLinks");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
      });
      $$("a", links).forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.setAttribute("aria-label", "打开菜单");
        });
      });
    }

    var sections = $$("main section[id]");
    var navLinks = $$(".nav__links a");
    if ("IntersectionObserver" in window && sections.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var id = en.target.id;
          navLinks.forEach(function (a) {
            a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
          });
        });
      }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
      sections.forEach(function (s) { io.observe(s); });
    }
  }

  /* ------------------------------------------------------------------ */
  /* 6. Boot                                                             */
  /* ------------------------------------------------------------------ */
  renderTimeline();
  renderMaterials();
  renderSources();
  renderRefs();
  setupPlates();
  setupReveal();
  setupNav();
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll);
  onScroll();
})();
