/*
 * 提案用：デザイン案の切り替え（A案＝明朝の見出し／B案＝手書き風の見出し）
 * ?design=b で B案。選んだ案はタブを閉じるまで覚えておき、お品書きページにも引き継ぎます。
 * 正式公開で1案に決まったら、このファイルと sample-bar の切り替えリンクを外します。
 */
(function () {
  "use strict";
  var KEY = "ichikawa-design";
  var root = document.documentElement;
  var design = new URLSearchParams(location.search).get("design");
  try {
    if (design === "a" || design === "b") sessionStorage.setItem(KEY, design);
    else design = sessionStorage.getItem(KEY);
  } catch (e) { /* 保存できない環境では URL の指定だけで切り替え */ }
  if (design !== "b") design = "a";

  if (design === "b") {
    root.classList.add("design-b");
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Zen+Kurenaido&display=swap";
    document.head.appendChild(link);
  }

  /* 切り替えリンク：今の案に印を付け、ほかのURLパラメータ（言語など）を残す */
  document.addEventListener("DOMContentLoaded", function () {
    var urlFor = function (d) {
      var p = new URLSearchParams(location.search);
      p.set("design", d);
      return location.pathname + "?" + p.toString() + location.hash;
    };
    document.querySelectorAll("[data-design]").forEach(function (a) {
      var d = a.getAttribute("data-design");
      a.href = urlFor(d);
      if (d === design) a.setAttribute("aria-current", "true");
      /* 言語切り替えなどでURLが変わっていても、押した時点のURLを使う */
      a.addEventListener("click", function () { a.href = urlFor(d); });
    });
  });
})();
