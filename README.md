# 市川茶屋 Webサイト（提案用サンプル）

札幌の日本茶専門店「市川茶屋」の提案用サンプルです。店主確認用に GitHub Pages（https://ichikawachaya.github.io/）で公開しています（検索には出ない設定）。

## ファイル構成

| ファイル | 役割 |
| --- | --- |
| `index.html` | トップページ |
| `menu.html` | お品書き／English Menu（日英切り替え・カテゴリー切り替え） |
| `data.js` | **店舗情報・店内メニュー・価格・QRの設定**（ここだけ直せば両ページに反映） |
| `style.css` | デザインとスマホ対応（B案の見出しは末尾の「B案」の部分） |
| `design.js` | 提案用：A案（明朝の見出し）／B案（手書き風の見出し）の切り替え |
| `main.js` | トップページの動き（スクロール表示、スマホの目次、データ差し込み） |
| `menu.js` | English Menuの切り替えと画面の文言 |
| `assets/img/` | ロゴ・写真・QR見本（公式ショップの画像を縮小したもの） |
| `tools/make-qr.swift` | 公開先が決まったあとに店頭用QRを作るツール |

すべて相対パス（先頭に `/` を付けない書き方）なので、GitHub Pages のサブフォルダ（例：`https://ユーザー名.github.io/ichikawa-chaya/`）でも画像やリンクが壊れません。

## よくある更新

- **メニュー・価格を変える** → `data.js` の `items`（店内価格は `price`、通販は `online`）
- **品目を追加する** → `items` に1件追加し、`cat`（カテゴリー）と `group`（見出し）を指定
- **店主の確認が済んだら** → 直した項目の `check: true` を消す。全部済んだら `showCheckMarks: false`
- **営業時間・定休日** → `data.js` の `shop`
- **通販価格の確認日** → `data.js` の `onlineCheckedOn`

書き起こしの確認用リストは、公開フォルダの外の `問題集/ichikawa-chaya-メニュー確認リスト.md` にあります。

## デザインのサンプル（サンプル1・2）

- サンプル1 = A案、サンプル2 = B案。`sample1/` `sample2/` は各案を開くための短いアドレスです

- A案：見出しが明朝体 → `index.html?design=a`
- B案：見出しが手書き風（Zen Kurenaido・無料のGoogle Fonts） → `index.html?design=b`
- ページ上部の帯のボタンでも切り替えられます。選んだ案はお品書きページにも引き継がれます
- 1案に決まったら：`design.js` の読み込みと帯の切り替えボタンを外し、B案なら `<html>` に `class="design-b"` を直接書き、Zen Kurenaido フォントの読み込みも `<head>` に移します

## 店頭用QRコード（公開先が決まってから）

今は読み取れない「見本」画像を表示しています。公開アドレスが決まったら：

1. `ichikawa-chaya` フォルダで次を実行（アドレスは実際のものに置き換え）
   ```bash
   swift tools/make-qr.swift "https://（公開アドレス）/menu.html" assets/img/qr-menu.png
   ```
2. `data.js` の `qr` を `{ image: "assets/img/qr-menu.png", isSample: false }` に変更
3. 印刷前に、スマホで読み取って English Menu が開くことを確認

## 手元で見る方法

`index.html` や `menu.html` をダブルクリックしても開けます。サーバーで確認する場合は `問題集` フォルダで：

```bash
python3 -m http.server 8765
```

→ ブラウザで `http://localhost:8765/ichikawa-chaya/`

## 注意（公開前に必ず）

- 写真・ロゴは市川茶屋の公式オンラインショップのものです。**一般公開前に店主の了承**を取ってください
- 店内メニューは手書きのメニュー表からの書き起こしです。**店主の確認が済むまで「要確認」の印を残します**
- 原材料・アレルギー表示は載せていません
- 通販価格は 2026年10月1日 に確認したオンラインショップ（BASE）の税込価格です。店頭価格とは別です
- `noindex`（検索に出さない設定）を入れています。正式公開時に外します
- 見出しフォントは Google Fonts（無料）の「しっぽり明朝」を読み込んでいます
