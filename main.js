/* トップページ：データの差し込み、スマホの目次開閉、スクロールで静かに表示 */
(function () {
  "use strict";
  var data = window.ICHIKAWA;
  if (!data) return;

  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var yen = function (n) { return n.toLocaleString("ja-JP") + "円"; };
  var formatDate = function (iso) {
    var p = iso.split("-");
    return p[0] + "年" + Number(p[1]) + "月" + Number(p[2]) + "日";
  };
  var byId = function (id) { return data.items.filter(function (it) { return it.id === id; })[0]; };
  var inGroup = function (cat, group) {
    return data.items.filter(function (it) { return it.cat === cat && (!group || it.group === group); });
  };
  var range = function (items) {
    var ps = items.map(function (it) { return it.price; });
    var lo = Math.min.apply(null, ps), hi = Math.max.apply(null, ps);
    return lo === hi ? yen(lo) : lo.toLocaleString("ja-JP") + "〜" + yen(hi);
  };
  var uniq = function (arr) { return arr.filter(function (v, i) { return arr.indexOf(v) === i; }); };
  var checkMark = function (items) {
    return data.showCheckMarks && items.some(function (it) { return it.check; })
      ? '<span class="badge badge--check">要確認</span>' : "";
  };
  /* お品書き風の1行：品名 ……… 価格 */
  var row = function (name, sub, price, items) {
    return (
      '<li class="line">' +
        '<span class="line__name">' + esc(name) +
          (sub || checkMark(items || []) ? '<small class="line__sub">' + checkMark(items || []) + esc(sub) + "</small>" : "") + "</span>" +
        '<span class="line__dots" aria-hidden="true"></span>' +
        '<span class="line__price">' + esc(price) + "</span>" +
      "</li>"
    );
  };
  var setHTML = function (id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };

  /* 店舗情報 */
  var shopText = {
    name: data.shop.name.ja,
    postal: data.shop.postal,
    address: data.shop.address.ja,
    hours: data.shop.hours.ja,
    closed: data.shop.closed.ja
  };
  document.querySelectorAll("[data-shop]").forEach(function (el) {
    var v = shopText[el.getAttribute("data-shop")];
    if (v) el.textContent = v;
  });
  document.querySelectorAll("[data-checked]").forEach(function (el) {
    el.textContent = formatDate(data.onlineCheckedOn);
  });

  /* 02 お店で、ひといき */
  var rec = byId("ichikawa-cha");
  if (rec) {
    setHTML("visit-rec",
      '<p class="visit-rec__label">迷ったら、まずこちら</p>' +
      '<p class="visit-rec__head"><span class="visit-rec__name">' + esc(rec.name.ja) + "</span>" +
        '<span class="visit-rec__serve">' + esc(rec.serve.ja) + "</span>" +
        '<span class="line__dots" aria-hidden="true"></span><span class="visit-rec__price">' + yen(rec.price) + "</span></p>" +
      '<p class="visit-rec__desc">' + esc(rec.desc.ja) + "</p>");
  }
  var sencha = inGroup("tea", "sencha");
  var origins = uniq(sencha.map(function (it) { return it.origin.ja.split(" ")[1].replace("茶", ""); }));
  var lattes = inGroup("tea", "latte");
  var alcohol = inGroup("alcohol");
  setHTML("tea-lines",
    row("煎茶メニュー（" + sencha.length + "種）", origins.join("・") + "の煎茶／温 or 水出し", range(sencha), sencha) +
    inGroup("tea", "special").map(function (it) { return row(it.name.ja, "", yen(it.price), [it]); }).join("") +
    row("ラテ（抹茶・ほうじ茶）", "温・冷", range(lattes), lattes)
  );
  setHTML("alcohol-lines",
    row("茶酒・ビール・サワー", "", range(alcohol), alcohol)
  );
  setHTML("house-notes", data.houseNotes.map(function (n) { return "<li>" + esc(n.ja) + "</li>"; }).join(""));

  /* 03 「ひといき」の茶葉（店頭価格と通販価格を分けて表示） */
  setHTML("tea-list", data.items.filter(function (it) { return it.feature; }).map(function (it) {
    return (
      '<li class="shina__item reveal">' +
        '<img class="shina__img" src="' + esc(it.image) + '" width="800" height="600" loading="lazy" alt="「' + esc(it.name.ja) + '」のパッケージ">' +
        '<div class="shina__body">' +
          '<h3 class="shina__name">' + esc(it.name.ja) + "</h3>" +
          '<p class="shina__meta">' + esc(it.kind.ja) + "｜" + esc(it.size.ja) + "</p>" +
          '<dl class="shina__prices">' +
            '<div><dt>店頭価格</dt><dd>' + yen(it.price) + "</dd></div>" +
            '<div><dt>通販価格</dt><dd>' + yen(it.online.price) + "<small>（税込）</small></dd></div>" +
          "</dl>" +
          '<a class="shina__link" href="' + esc(it.online.url) + '" target="_blank" rel="noopener">オンラインショップで見る<span class="ext" aria-hidden="true">↗</span></a>' +
        "</div>" +
      "</li>"
    );
  }).join(""));

  /* 04 甘味・お茶漬け */
  var dora = byId("dorayaki");
  if (dora) {
    setHTML("sweets-feature",
      '<p class="sweets__kicker reveal">美好屋さんとのコラボ</p>' +
      '<h3 class="sweets__name reveal">' + esc(dora.name.ja) + "</h3>" +
      '<p class="reveal">' + esc(dora.desc.ja) + "</p>" +
      '<dl class="price-table reveal">' +
        "<div><dt>店内・お持ち帰り</dt><dd>" + yen(dora.price) + "<small>（" + esc(dora.unit.ja) + "）</small></dd></div>" +
        "<div><dt>オンラインショップ（" + esc(dora.online.size.ja) + "）</dt><dd>" + yen(dora.online.price) + "<small>（税込）</small></dd></div>" +
      "</dl>" +
      '<p class="sweets__small reveal">原材料・アレルギー表示は、商品ページでご確認ください。</p>' +
      '<a class="btn btn--line reveal" href="' + esc(dora.online.url) + '" target="_blank" rel="noopener">商品ページを見る<span class="ext" aria-hidden="true">↗</span></a>');
  }
  var zenzai = inGroup("food", "sweets").filter(function (it) { return it.id !== "dorayaki"; });
  var chazuke = inGroup("food", "ochazuke");
  setHTML("food-lines",
    row("冷やしぜんざい（八女抹茶・八女ほうじ茶）", "具は小豆・白玉・わらびもち", range(zenzai), zenzai) +
    (dora ? row(dora.name.ja, dora.unit.ja + "・店内／お持ち帰り", yen(dora.price), [dora]) : "") +
    row("お茶漬け（鮭・明太子・梅）", "お米は煎茶と一緒に炊いています", range(chazuke), chazuke)
  );
  setHTML("set-lines", inGroup("food", "set").map(function (it) {
    return row(it.name.ja, "お茶は「煎茶メニュー」からおひとつ", yen(it.price), [it]);
  }).join(""));

  /* 店頭用QRコード */
  var qrImg = document.getElementById("qr-img");
  if (qrImg && data.qr && !data.qr.isSample) {
    qrImg.src = data.qr.image;
    qrImg.alt = "English Menuページを開くQRコード";
    var badge = document.getElementById("qr-badge");
    var text = document.getElementById("qr-text");
    if (badge) badge.remove();
    if (text) text.textContent = "店頭に置くと、English Menuページへ直接移動できます。";
  }

  /* スマホの目次開閉 */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("gnav");
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* スクロールで静かに表示（動きを減らす設定のときは何もしない） */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var targets = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  targets.forEach(function (el) { io.observe(el); });
})();
