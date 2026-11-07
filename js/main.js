/* 广东省湖南攸县商会 - main.js */
(function () {
  function fmtDate(d) {
    var p = d.split("-");
    return p[0] + " 年 " + parseInt(p[1], 10) + " 月 " + parseInt(p[2], 10) + " 日";
  }
  function shortDate(d) { return d.replace(/-/g, "."); }

  // 文章页地址（静态页优先，利于搜索引擎收录）
  function articleURL(a) { return "article/" + a.id + ".html"; }

  // 新闻卡片（文字居中、等高）
  function cardHTML(a) {
    var shortTitle = a.title.length > 26 ? a.title.slice(0, 26) + "…" : a.title;
    return (
      '<a class="news-card" href="' + articleURL(a) + '">' +
        '<div class="news-cover ' + a.cover + '">' +
          '<span class="date">' + shortDate(a.date) + '</span>' +
          '<span>' + shortTitle + '</span>' +
        '</div>' +
        '<div class="news-body">' +
          '<span class="tag">' + a.tag + '</span>' +
          '<h3>' + a.title + '</h3>' +
          '<p>' + a.summary + '</p>' +
          '<span class="more">阅读全文 →</span>' +
        '</div>' +
      '</a>'
    );
  }

  // 首页动态（最新 3 篇）
  var homeGrid = document.getElementById("news-grid");
  if (homeGrid && typeof ARTICLES !== "undefined") {
    homeGrid.innerHTML = ARTICLES.slice(0, 3).map(cardHTML).join("");
  }

  // 资讯列表页（分页：每页 3 行 × 3 列 = 9 篇）
  var listGrid = document.getElementById("article-list");
  var pageNav = document.getElementById("page-nav");
  if (listGrid && pageNav && typeof ARTICLES !== "undefined") {
    var PAGE_SIZE = 9;
    var totalPages = Math.ceil(ARTICLES.length / PAGE_SIZE);
    function curPage() {
      var m = window.location.hash.match(/page-(\d+)/);
      var p = m ? parseInt(m[1], 10) : 1;
      return Math.min(Math.max(p, 1), totalPages);
    }
    function renderPage() {
      var p = curPage();
      var items = ARTICLES.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);
      listGrid.innerHTML = items.map(cardHTML).join("");
      var buf = '<button class="pg-btn" data-p="' + (p - 1) + '"' + (p === 1 ? " disabled" : "") + '>上一页</button>';
      for (var i = 1; i <= totalPages; i++) {
        buf += '<button class="pg-btn num' + (i === p ? " on" : "") + '" data-p="' + i + '">' + i + "</button>";
      }
      buf += '<button class="pg-btn" data-p="' + (p + 1) + '"' + (p === totalPages ? " disabled" : "") + '>下一页</button>';
      pageNav.innerHTML = buf;
      pageNav.querySelectorAll(".pg-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var t = parseInt(btn.getAttribute("data-p"), 10);
          if (t < 1 || t > totalPages || t === curPage()) return;
          window.location.hash = "page-" + t;
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      });
    }
    window.addEventListener("hashchange", renderPage);
    renderPage();
  }

  // 文章详情页
  var bodyEl = document.getElementById("article-body");
  if (bodyEl && typeof ARTICLES !== "undefined") {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    var a = ARTICLES.find(function (x) { return x.id === id; }) || ARTICLES[0];
    document.title = a.title + " - 广东省湖南攸县商会";
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", a.summary);
    document.getElementById("article-title").textContent = a.title;
    document.getElementById("article-meta-line").textContent = a.tag + " · " + fmtDate(a.date);
    bodyEl.innerHTML = a.body;
    var src = document.getElementById("article-source");
    if (src) {
      src.innerHTML = '内容来源：' + (a.sourceName || "商会微信公众号") +
        (a.sourceUrl ? '　<a href="' + a.sourceUrl + '" target="_blank" rel="noopener">查看原文链接 →</a>' : "");
    }
  }

  // 导航高亮
  var path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) link.classList.add("active");
  });

  // 首屏轮播
  var carousel = document.getElementById("hero-carousel");
  if (carousel) {
    var slides = carousel.querySelectorAll(".slide");
    var dots = document.querySelectorAll(".carousel-dots i");
    var cur = 0, timer;
    function show(i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("on", k === cur); });
      dots.forEach(function (d, k) { d.classList.toggle("on", k === cur); });
    }
    function auto() { timer = setInterval(function () { show(cur + 1); }, 4200); }
    dots.forEach(function (d, k) {
      d.addEventListener("click", function () { clearInterval(timer); show(k); auto(); });
    });
    if (slides.length) { show(0); auto(); }
  }

  // 返回顶部
  var backTop = document.getElementById("back-top");
  if (backTop) {
    window.addEventListener("scroll", function () {
      backTop.style.display = window.scrollY > 500 ? "block" : "none";
    });
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 首屏四季背景轮播（春夏秋冬淡入淡出）
  var seasonSlides = document.querySelectorAll(".hero-slide");
  if (seasonSlides.length > 1) {
    var sCur = 0, sTimer;
    function showSeason(i) {
      sCur = (i + seasonSlides.length) % seasonSlides.length;
      seasonSlides.forEach(function (s, k) { s.classList.toggle("on", k === sCur); });
    }
    sTimer = setInterval(function () { showSeason(sCur + 1); }, 5200);
  }

  // 商城弹窗：扫码直接购 / 合作入驻
  var mask = document.getElementById("modal-mask");
  if (mask) {
    var views = mask.querySelectorAll(".modal-view");
    function openModal(key) {
      views.forEach(function (v) { v.hidden = (v.id !== "modal-" + key); });
      mask.hidden = false;
      document.body.style.overflow = "hidden";
    }
    function closeModal() {
      mask.hidden = true;
      document.body.style.overflow = "";
    }
    document.querySelectorAll("[data-modal]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openModal(btn.getAttribute("data-modal"));
      });
    });
    mask.querySelector(".modal-close").addEventListener("click", closeModal);
    mask.addEventListener("click", function (e) { if (e.target === mask) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  }

  // 手机端悬浮导航按钮（右下角 FAB）
  var fab = document.createElement("div");
  fab.className = "fab-nav";
  var fabLinks = [
    ["index.html", "首页"],
    ["about.html", "商会概况"],
    ["news.html", "新闻资讯"],
    ["services.html", "会员服务"],
    ["mall.html", "大攸商商城"],
    ["contact.html", "联系我们"],
    ["about.html#join", "申请入会"]
  ];
  fab.innerHTML =
    '<div class="fab-menu">' +
      fabLinks.map(function (l) { return '<a href="' + l[0] + '">' + l[1] + "</a>"; }).join("") +
    "</div>" +
    '<button class="fab-btn" aria-label="打开站内导航">☰</button>';
  document.body.appendChild(fab);
  var fabBtn = fab.querySelector(".fab-btn");
  fabBtn.addEventListener("click", function () {
    fab.classList.toggle("open");
    fabBtn.textContent = fab.classList.contains("open") ? "✕" : "☰";
  });
  var curPage = window.location.pathname.split("/").pop() || "index.html";
  fab.querySelectorAll(".fab-menu a").forEach(function (a) {
    var h = a.getAttribute("href");
    if (h === curPage || (h === "index.html" && curPage === "")) a.classList.add("active");
    a.addEventListener("click", function () {
      fab.classList.remove("open");
      fabBtn.textContent = "☰";
    });
  });
})();
