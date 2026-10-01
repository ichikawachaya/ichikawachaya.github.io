/* お品書き（English Menu）：言語切り替え（英語／日本語）とカテゴリー切り替え。表示を待たせる演出はなし */
(function () {
  "use strict";
  var data = window.ICHIKAWA;
  if (!data) return;

  /* 画面の文言（メニューの中身は data.js） */
  var UI = {
    en: {
      skip: "Skip to content",
      sampleBar: "Proposal sample (for review)",
      back: "Home",
      title: "Menu",
      subtitle: "Japanese tea house in Sapporo",
      catLabel: "Category",
      catAll: "All",
      recommend: "Recommended",
      check: "To be checked",
      checkLegend: "Items marked “To be checked” were hard to read on the handwritten menu and are being confirmed.",
      online: "Online shop",
      onlineLink: "Buy online",
      taxIncl: "tax incl.",
      notesTitle: "How to enjoy your tea",
      infoTitle: "Shop information",
      hoursLabel: "Hours",
      closedLabel: "Closed",
      addressLabel: "Address",
      instaNote: "For the latest news and holidays, please check our Instagram.",
      mapLink: "Open in Google Maps",
      shopLink: "Online shop",
      priceFoot: "Prices are as shown on our in-store menu and may change. Online shop prices include tax.",
      price: function (n) { return "¥" + n.toLocaleString("en-US"); },
      status: function (n) { return n + (n === 1 ? " item shown" : " items shown"); }
    },
    ja: {
      skip: "本文へ移動",
      sampleBar: "提案用サンプル（店主確認用）",
      back: "トップへ",
      title: "お品書き",
      subtitle: "札幌の日本茶専門店",
      catLabel: "カテゴリー",
      catAll: "すべて",
      recommend: "おすすめ",
      check: "要確認",
      checkLegend: "「要確認」は手書きメニューの読み取りに自信がない項目です（店主確認中）。",
      online: "オンラインショップ",
      onlineLink: "通販で見る",
      taxIncl: "税込",
      notesTitle: "お店での楽しみ方",
      infoTitle: "店舗情報",
      hoursLabel: "営業時間",
      closedLabel: "定休日",
      addressLabel: "住所",
      instaNote: "臨時休業や最新のお知らせは、Instagramでご確認ください。",
      mapLink: "Googleマップで開く",
      shopLink: "オンラインショップ",
      priceFoot: "価格は店頭メニュー表の表記で、変更になる場合があります。オンラインショップの価格は税込です。",
      price: function (n) { return n.toLocaleString("ja-JP") + "円"; },
      status: function (n) { return n + "品を表示しています"; }
    }
  };

  var catIds = data.categories.map(function (c) { return c.id; });
  var params = new URLSearchParams(location.search);
  var state = {
    lang: params.get("lang") === "ja" ? "ja" : "en",
    cat: catIds.indexOf(params.get("cat")) > -1 ? params.get("cat") : "all"
  };

  var body = document.getElementById("menu-body");
  var catBox = document.getElementById("cat-buttons");
  var status = document.getElementById("menu-status");

  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var txt = function (obj, lang) { return obj && obj[lang] ? obj[lang] : ""; };

  function renderItem(it, t, lang) {
    var other = lang === "en" ? "ja" : "en";
    /* 品名は日英を併記（選んだ言語を上に）。英語表示ではよみがなも添える */
    var main = it.name[lang];
    var sub = it.name[other] !== main ? it.name[other] : "";
    if (lang === "en" && it.name.kana && sub) sub += "（" + it.name.kana + "）";

    var meta = [txt(it.origin, lang), txt(it.kind, lang), txt(it.serve, lang), txt(it.size, lang)].filter(Boolean);
    var badges = "";
    if (it.recommend) badges += '<span class="badge badge--rec">' + esc(t.recommend) + "</span>";
    if (it.check && data.showCheckMarks) badges += '<span class="badge badge--check">' + esc(t.check) + "</span>";

    var price = it.price != null
      ? esc(t.price(it.price)) + (it.unit ? '<small> / ' + esc(it.unit[lang]) + "</small>" : "")
      : "";

    var online = "";
    if (it.online) {
      online = '<p class="mi__online">' + esc(t.online) + "（" + esc(it.online.size[lang]) + "）" +
        '<span class="nowrap"> ' + esc(t.price(it.online.price)) + " (" + esc(t.taxIncl) + ")</span> " +
        '<a href="' + esc(it.online.url) + '" target="_blank" rel="noopener">' + esc(t.onlineLink) + '<span class="ext" aria-hidden="true">↗</span></a></p>';
    }

    return (
      '<li class="mi">' +
        '<div class="mi__head">' +
          '<h4 class="mi__name"><span class="mi__main" lang="' + lang + '">' + esc(main) + "</span>" +
            (sub ? '<span class="mi__sub" lang="' + other + '">' + esc(sub) + "</span>" : "") + "</h4>" +
          '<span class="mi__dots" aria-hidden="true"></span>' +
          '<p class="mi__price">' + price + "</p>" +
        "</div>" +
        (badges ? '<p class="mi__badges">' + badges + "</p>" : "") +
        (meta.length ? '<p class="mi__meta">' + meta.map(esc).join(" · ") + "</p>" : "") +
        (txt(it.desc, lang) ? '<p class="mi__desc">' + esc(it.desc[lang]) + "</p>" : "") +
        (it.priceNote ? '<p class="mi__note">' + esc(it.priceNote[lang]) + "</p>" : "") +
        online +
      "</li>"
    );
  }

  function render() {
    var t = UI[state.lang];
    var lang = state.lang;
    document.documentElement.lang = lang;
    document.title = (lang === "en" ? "Menu" : "お品書き") + " | Ichikawa Chaya 市川茶屋";

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = t[el.getAttribute("data-i18n")];
      if (typeof v === "string") el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-label]").forEach(function (el) {
      el.setAttribute("aria-label", t[el.getAttribute("data-i18n-label")]);
    });
    document.querySelectorAll("[data-shop-i18n]").forEach(function (el) {
      el.textContent = data.shop[el.getAttribute("data-shop-i18n")][lang];
    });
    document.querySelectorAll("[data-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });

    document.getElementById("menu-source").textContent = data.menuSource[lang];
    var legend = document.getElementById("check-legend");
    legend.hidden = !data.showCheckMarks;
    legend.textContent = t.checkLegend;

    /* カテゴリーボタン */
    var cats = [{ id: "all", label: { ja: t.catAll, en: t.catAll } }].concat(data.categories);
    catBox.innerHTML = cats.map(function (c) {
      return '<button type="button" class="cat-bar__btn" data-cat="' + c.id + '" aria-pressed="' + (c.id === state.cat) + '">' + esc(c.label[lang]) + "</button>";
    }).join("");

    /* メニュー本体 */
    var count = 0;
    body.innerHTML = data.categories.filter(function (c) {
      return state.cat === "all" || c.id === state.cat;
    }).map(function (c) {
      var groups = c.groups.map(function (g) {
        var items = data.items.filter(function (it) { return it.cat === c.id && it.group === g.id; });
        if (!items.length) return "";
        count += items.length;
        return (
          '<div class="menu-group">' +
            '<h3 class="menu-group__title">' + esc(g.label[lang]) + "</h3>" +
            (g.note ? '<p class="menu-group__note">' + esc(g.note[lang]) + "</p>" : "") +
            '<ul class="menu-items">' + items.map(function (it) { return renderItem(it, t, lang); }).join("") + "</ul>" +
          "</div>"
        );
      }).join("");
      return (
        '<section class="menu-cat" id="cat-' + c.id + '">' +
          '<h2 class="menu-cat__title">' + esc(c.label[lang]) + "</h2>" +
          (c.note ? '<p class="menu-cat__note">' + esc(c.note[lang]) + "</p>" : "") +
          groups +
        "</section>"
      );
    }).join("");

    document.getElementById("house-notes").innerHTML = data.houseNotes.map(function (n) {
      return "<li>" + esc(n[lang]) + "</li>";
    }).join("");

    return count;
  }

  function updateUrl() {
    var p = new URLSearchParams(location.search);
    if (state.lang === "ja") p.set("lang", "ja"); else p.delete("lang");
    if (state.cat !== "all") p.set("cat", state.cat); else p.delete("cat");
    var q = p.toString();
    history.replaceState(null, "", location.pathname + (q ? "?" + q : "") + location.hash);
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-lang], button[data-cat]");
    if (!btn) return;
    var isCat = btn.hasAttribute("data-cat");
    if (isCat) state.cat = btn.getAttribute("data-cat");
    else state.lang = btn.getAttribute("data-lang");
    var n = render();
    updateUrl();
    status.textContent = UI[state.lang].status(n);
    /* 作り直したボタンにフォーカスを戻す（キーボード操作のため） */
    var sel = isCat ? 'button[data-cat="' + state.cat + '"]' : 'button[data-lang="' + state.lang + '"]';
    var again = document.querySelector(sel);
    if (again) again.focus();
  });

  render();
})();
