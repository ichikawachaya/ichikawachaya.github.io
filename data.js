/*
 * 市川茶屋 サイトデータ
 * 店舗情報・メニュー・価格を変えるときは、このファイルだけを編集します。
 * （index.html と menu.html の両方に反映されます）
 *
 * ・店内メニュー：店頭の手書きメニュー表（2026年10月撮影）から書き起こし。店主の確認前
 *   読み取りに自信がない項目には check: true を付けています（サイト上に「要確認」と表示）
 *   テープで隠されていた品目は載せていません
 * ・通販価格：2026-10-01 に公式オンラインショップ（ichikawa0501.base.ec）で確認した税込価格
 */
window.ICHIKAWA = {
  onlineCheckedOn: "2026-10-01",
  menuSource: {
    ja: "店頭のメニュー表（2026年10月撮影）から書き起こし・店主確認前",
    en: "Transcribed from our in-store menu (October 2026), pending final check"
  },
  /* 提案中は true。店主の確認が済んだら false にすると「要確認」の印が消えます */
  showCheckMarks: true,

  shop: {
    name: { ja: "市川茶屋", en: "Ichikawa Chaya" },
    postal: "〒064-0804",
    address: {
      ja: "北海道札幌市中央区南4条西6丁目8-3 晴ばれビル B1",
      en: "Harebare Bldg. B1, 6‑8‑3 Minami 4‑jo Nishi, Chuo‑ku, Sapporo, Hokkaido 064‑0804"
    },
    hours: { ja: "13:00〜23:00", en: "1 pm – 11 pm" },
    closed: { ja: "火曜日", en: "Tuesdays" }
  },

  /* 店頭QRコード（公開先が決まるまでは見本。README参照） */
  qr: {
    image: "assets/img/qr-sample.svg",
    isSample: true
  },

  /* お店での楽しみ方・お願い（メニュー表より） */
  houseNotes: [
    {
      ja: "おひとり様おひとつ以上のお飲み物のご注文をお願いします。",
      en: "Please order at least one drink per person."
    },
    {
      ja: "温かいお茶は3煎目までお楽しみいただけます。急須をお渡しいただければお湯をお注ぎします。2煎目・3煎目は温度を変えてお出しするので、味の変化を楽しめます。",
      en: "Hot tea can be enjoyed up to the third infusion. Hand us your teapot and we will add hot water. Each infusion is served at a different temperature, so you can taste how the tea changes."
    },
    {
      ja: "飲み終えた急須の茶殻も食べられます。お声がけいただければ、お醤油と抹茶塩をお持ちします。",
      en: "The used tea leaves are edible too. Just ask, and we will bring soy sauce and matcha salt."
    },
    {
      ja: "お茶にはちょっとしたお菓子が付きます。不要な方はお声がけください。",
      en: "Tea comes with a small sweet. Please tell us if you would rather not have it."
    }
  ],

  /* カテゴリーとグループ（メニューの見出し） */
  categories: [
    {
      id: "tea",
      label: { ja: "お茶", en: "Tea" },
      groups: [
        { id: "original", label: { ja: "市川茶屋オリジナル煎茶", en: "Our original sencha" } },
        {
          id: "sencha",
          label: { ja: "煎茶メニュー（温 or 水出し）", en: "Sencha selection (hot or cold‑brewed)" },
          note: { ja: "セットのお茶はこちらからお選びください。", en: "For sets, choose your tea from this list." }
        },
        { id: "special", label: { ja: "玉露・ほうじ茶・抹茶", en: "Gyokuro, hojicha & matcha" } },
        { id: "latte", label: { ja: "ラテ", en: "Lattes" } }
      ]
    },
    {
      id: "food",
      label: { ja: "甘味・お茶漬け", en: "Sweets & Ochazuke" },
      groups: [
        {
          id: "sweets",
          label: { ja: "甘味", en: "Sweets" },
          note: { ja: "ぜんざいの具は、小豆・白玉・わらびもちです。", en: "Zenzai comes with red beans, shiratama (rice dumplings) and warabi‑mochi." }
        },
        {
          id: "ochazuke",
          label: { ja: "お茶漬け", en: "Ochazuke (rice with broth)" },
          note: {
            ja: "お米は煎茶と一緒に炊いています。お出汁を添えてお出しするので、ご自身でかけてお召し上がりください。わさびが欲しい方はお声がけください。",
            en: "The rice is cooked with sencha. Dashi broth is served on the side for you to pour over. Wasabi on request."
          }
        },
        { id: "set", label: { ja: "セット", en: "Sets" } }
      ]
    },
    {
      id: "alcohol",
      label: { ja: "お酒", en: "Alcohol" },
      groups: [
        { id: "chazake", label: { ja: "茶酒", en: "Tea cocktails" } },
        { id: "beer", label: { ja: "ビール", en: "Beer" } },
        { id: "sour", label: { ja: "サワー", en: "Sour" } }
      ]
    },
    {
      id: "shop",
      label: { ja: "茶葉・お土産", en: "Take‑home" },
      note: {
        ja: "店頭で販売しています（店頭価格）。ここに載っていない商品も店内に並んでいます。",
        en: "On sale in the shop (in‑store prices). More items are on our shelves."
      },
      groups: [
        { id: "leaf", label: { ja: "お茶", en: "Tea" } },
        { id: "gift", label: { ja: "お菓子", en: "Sweets" } }
      ]
    }
  ],

  /*
   * メニュー
   * price     : 店内（店頭）価格。メニュー表の表記どおり
   * serve     : 温冷など（メニュー表に書かれているものだけ）
   * online    : オンラインショップの商品（通販価格は税込・2026-10-01確認）
   * feature   : トップページの「ひといき」一覧に出すもの
   * recommend : おすすめ表示
   * check     : 手書きの読み取りに自信がない項目
   */
  items: [
    /* ---- お茶：オリジナル ---- */
    {
      id: "ichikawa-cha", cat: "tea", group: "original", recommend: true,
      name: { ja: "市川茶", kana: "いちかわちゃ", en: "Ichikawa‑cha" },
      serve: { ja: "温 or 水出し", en: "Hot or cold‑brewed" },
      price: 650,
      desc: {
        ja: "数種類の茶葉を配合した、市川茶屋オリジナルの煎茶。旨味と甘味があり、後味すっきり。温かいのはもちろん、水出しもおすすめ。迷ったらまずこちらを。",
        en: "Our house sencha, blended from several teas. Umami and sweetness with a clean finish. Lovely hot, and also recommended cold‑brewed. Not sure what to order? Start here."
      }
    },

    /* ---- お茶：煎茶メニュー ---- */
    {
      id: "hachimaru", cat: "tea", group: "sencha", check: true,
      name: { ja: "八丸", kana: "はちまる", en: "Hachimaru" },
      origin: { ja: "福岡県産 八女茶", en: "Yame tea, Fukuoka" },
      price: 600,
      desc: { ja: "旨味・甘味が強く、ほんのり渋みも感じる味わい。", en: "Strong umami and sweetness, with a hint of astringency." }
    },
    {
      id: "ro", cat: "tea", group: "sencha", check: true,
      name: { ja: "朗", kana: "ろう", en: "Rō" },
      origin: { ja: "福岡県産 八女茶", en: "Yame tea, Fukuoka" },
      price: 650,
      desc: { ja: "旨味・甘味があり、すっきりとした味わい。", en: "Umami and sweetness with a clean, light taste." }
    },
    {
      id: "ritsu", cat: "tea", group: "sencha", check: true,
      name: { ja: "律", kana: "りつ", en: "Ritsu" },
      origin: { ja: "京都府産 宇治茶", en: "Uji tea, Kyoto" },
      price: 600,
      desc: { ja: "香ばしい香りで、ほのかな旨味と渋みのある味わい。", en: "Toasty aroma, gentle umami and a touch of astringency." }
    },
    {
      id: "takumi", cat: "tea", group: "sencha", check: true,
      name: { ja: "匠", kana: "たくみ", en: "Takumi" },
      origin: { ja: "京都府産 宇治茶", en: "Uji tea, Kyoto" },
      price: 600,
      desc: { ja: "旨味・甘味・渋味のバランスがよく、すっきりとした味わい。", en: "Well balanced umami, sweetness and astringency, with a clean finish." }
    },
    {
      id: "ken", cat: "tea", group: "sencha", check: true,
      name: { ja: "健", kana: "けん", en: "Ken" },
      origin: { ja: "鹿児島県産 知覧茶", en: "Chiran tea, Kagoshima" },
      price: 600,
      desc: { ja: "深蒸し茶で、色も味も濃い、お茶らしい味わい。", en: "Deep‑steamed tea, rich in colour and flavour: a classic green‑tea taste." }
    },
    {
      id: "ryoku", cat: "tea", group: "sencha", check: true,
      name: { ja: "力", kana: "りょく", en: "Ryoku" },
      origin: { ja: "鹿児島県産 知覧茶", en: "Chiran tea, Kagoshima" },
      price: 650,
      desc: { ja: "まろやかなコクと旨味、甘味を強く感じる味わい。", en: "Mellow body with strong umami and sweetness." }
    },

    /* ---- お茶：玉露・ほうじ茶・抹茶 ---- */
    {
      id: "gyokuro", cat: "tea", group: "special", check: true,
      name: { ja: "八女玉露", kana: "やめぎょくろ", en: "Yame Gyokuro" },
      price: 700,
      desc: {
        ja: "福岡県八女市は玉露の名産地。濃厚で力強い旨味と甘み。低温のお湯でじっくり時間をかけて抽出します。",
        en: "Yame in Fukuoka is renowned for gyokuro. Rich, powerful umami and sweetness, slowly steeped in low‑temperature water."
      }
    },
    {
      id: "hojicha", cat: "tea", group: "special",
      name: { ja: "自家焙煎ほうじ茶", kana: "じかばいせんほうじちゃ", en: "House‑roasted Hojicha" },
      price: 600,
      desc: {
        ja: "店内で少量ずつ丁寧に炒っています。香りが高く、まろやかな味わい。",
        en: "Roasted carefully in small batches in our shop. Fragrant and mellow."
      }
    },
    {
      id: "matcha", cat: "tea", group: "special",
      name: { ja: "八女抹茶", kana: "やめまっちゃ", en: "Yame Matcha" },
      price: 700,
      desc: { ja: "上品でまろやかな味わい。茶葉の甘みも感じる抹茶です。", en: "Elegant and mellow, with the natural sweetness of the leaf." }
    },

    /* ---- お茶：ラテ ---- */
    {
      id: "matcha-latte", cat: "tea", group: "latte",
      name: { ja: "八女抹茶ラテ", en: "Yame Matcha Latte" },
      serve: { ja: "温・冷", en: "Hot or iced" },
      price: 700,
      desc: {
        ja: "八女茶本来の旨み・甘みを活かした、甘すぎないラテ。シロップ抜きもできます。",
        en: "Brings out the umami and sweetness of Yame tea; not too sweet. Can be made without syrup."
      }
    },
    {
      id: "hojicha-latte", cat: "tea", group: "latte",
      name: { ja: "八女ほうじ茶ラテ", en: "Yame Hojicha Latte" },
      serve: { ja: "温・冷", en: "Hot or iced" },
      price: 650,
      desc: {
        ja: "八女茶本来の旨み・甘みを活かした、甘すぎないラテ。シロップ抜きもできます。",
        en: "Brings out the umami and sweetness of Yame tea; not too sweet. Can be made without syrup."
      }
    },

    /* ---- 甘味 ---- */
    {
      id: "zenzai-matcha", cat: "food", group: "sweets",
      name: { ja: "八女抹茶 冷やしぜんざい", en: "Chilled Yame Matcha Zenzai" },
      price: 750,
      desc: {
        ja: "八女抹茶本来の甘みや苦みを楽しめるよう、抹茶が濃く、甘すぎないぜんざいです。",
        en: "Sweet red‑bean dessert with rich matcha, not too sweet, so you can enjoy matcha’s natural sweetness and bitterness."
      }
    },
    {
      id: "zenzai-hojicha", cat: "food", group: "sweets",
      name: { ja: "八女ほうじ茶 冷やしぜんざい", en: "Chilled Yame Hojicha Zenzai" },
      price: 750,
      desc: {
        ja: "ほうじ茶の香りと味が強く、ほどよい甘さのぜんざいです。",
        en: "Sweet red‑bean dessert with a strong roasted‑tea aroma and gentle sweetness."
      }
    },
    {
      id: "dorayaki", cat: "food", group: "sweets",
      name: { ja: "ほうじ茶あんどら焼き", en: "Hojicha Dorayaki" },
      price: 400, unit: { ja: "おひとつ", en: "each" },
      desc: {
        ja: "札幌・二十四軒で1961年創業の和菓子屋「美好屋」さんに、市川茶屋の八女ほうじ茶で作っていただいたどら焼き。道産小豆と和三盆糖などで仕上げたほうじ茶あん入り。店内でも、お持ち帰りでもどうぞ。",
        en: "Made for us by Miyoshiya, a Sapporo confectioner founded in 1961, with the Yame hojicha we serve. Filled with hojicha bean paste made from Hokkaido red beans and wasanbon sugar. Eat in or take away."
      },
      image: "assets/img/dorayaki.jpg",
      online: { price: 1900, size: { ja: "4個入り", en: "Box of 4" }, url: "https://ichikawa0501.base.ec/items/105665327" }
    },

    /* ---- お茶漬け ---- */
    {
      id: "chazuke-salmon", cat: "food", group: "ochazuke",
      name: { ja: "鮭茶漬け", en: "Salmon Ochazuke" },
      price: 800
    },
    {
      id: "chazuke-mentaiko", cat: "food", group: "ochazuke",
      name: { ja: "明太子茶漬け", en: "Mentaiko Ochazuke" },
      desc: { ja: "", en: "Mentaiko: seasoned pollock roe." },
      price: 800
    },
    {
      id: "chazuke-ume", cat: "food", group: "ochazuke", check: true,
      name: { ja: "梅茶漬け（八女玉露梅）", en: "Ume Ochazuke (Yame Gyokuro Ume)" },
      price: 800,
      desc: {
        ja: "玉露梅は単品（2個入）500円でも注文できます。",
        en: "Gyokuro ume plums can also be ordered on their own: ¥500 for two."
      }
    },

    /* ---- セット ---- */
    {
      id: "set-zenzai", cat: "food", group: "set",
      name: { ja: "煎茶とぜんざいのセット", en: "Sencha & Zenzai Set" },
      price: 1300,
      desc: {
        ja: "ぜんざい2種のどちらかと、「煎茶メニュー」からおひとつお選びください。",
        en: "Choose one of the two zenzai and one tea from the sencha selection."
      }
    },
    {
      id: "set-ochazuke", cat: "food", group: "set",
      name: { ja: "煎茶とお茶漬けのセット", en: "Sencha & Ochazuke Set" },
      price: 1300,
      desc: {
        ja: "お茶漬け3種のどれかと、「煎茶メニュー」からおひとつお選びください。",
        en: "Choose one of the three ochazuke and one tea from the sencha selection."
      }
    },

    /* ---- お酒：茶酒 ---- */
    { id: "matcha-beer", cat: "alcohol", group: "chazake", name: { ja: "八女抹茶ビール", en: "Yame Matcha Beer" }, price: 750 },
    { id: "hojicha-beer", cat: "alcohol", group: "chazake", name: { ja: "八女ほうじ茶ビール", en: "Yame Hojicha Beer" }, price: 750 },
    {
      id: "ichikawa-wari", cat: "alcohol", group: "chazake",
      name: { ja: "市川茶割", en: "Ichikawa‑cha Wari" }, price: 700,
      desc: { ja: "", en: "“Wari” means an alcoholic drink mixed with tea." }
    },
    { id: "kagabo-wari", cat: "alcohol", group: "chazake", check: true, name: { ja: "加賀棒ほうじ茶割", en: "Kaga‑bō Hojicha Wari" }, price: 650 },
    { id: "chiran-kocha-wari", cat: "alcohol", group: "chazake", name: { ja: "知覧紅茶割", en: "Chiran Black Tea Wari" }, price: 650 },
    { id: "corn-wari", cat: "alcohol", group: "chazake", check: true, name: { ja: "コーン茶割", en: "Corn Tea Wari" }, price: 650 },
    {
      id: "sencha-gin", cat: "alcohol", group: "chazake",
      name: { ja: "煎茶ジントニック", en: "Sencha Gin & Tonic" }, price: 750,
      desc: { ja: "ソーダ割りもできます。", en: "Also available with soda instead of tonic." }
    },
    { id: "sencha-highball", cat: "alcohol", group: "chazake", name: { ja: "煎茶ハイボール", en: "Sencha Highball" }, price: 750 },
    { id: "hojicha-highball", cat: "alcohol", group: "chazake", name: { ja: "ほうじ茶ハイボール", en: "Hojicha Highball" }, price: 700 },

    /* ---- お酒：ビール ---- */
    { id: "draft", cat: "alcohol", group: "beer", name: { ja: "生ビール（クラシック）", en: "Draft Beer (Classic)" }, price: 650 },
    {
      id: "pilsner", cat: "alcohol", group: "beer",
      name: { ja: "BRIGHT STAR PILSNER", en: "BRIGHT STAR PILSNER" },
      origin: { ja: "福岡県八女産クラフトビール", en: "Craft beer from Yame, Fukuoka" },
      price: 1200,
      desc: {
        ja: "八女茶を使ったピルスナー。低温での発酵と長期熟成による、さっぱりとした飲み口。",
        en: "Pilsner brewed with Yame tea. Low‑temperature fermentation and long ageing give a crisp, clean taste."
      }
    },
    {
      id: "ipa", cat: "alcohol", group: "beer",
      name: { ja: "FUKAMUSHI IPA", en: "FUKAMUSHI IPA" },
      origin: { ja: "福岡県八女産クラフトビール", en: "Craft beer from Yame, Fukuoka" },
      price: 1200,
      desc: {
        ja: "深蒸し八女茶を使ったIPA。強い柑橘系ホップの香りと苦味が特長。",
        en: "IPA brewed with deep‑steamed Yame tea. Strong citrusy hop aroma and bitterness."
      }
    },

    /* ---- お酒：サワー ---- */
    {
      id: "gyokuro-ume-sour", cat: "alcohol", group: "sour",
      name: { ja: "玉露梅サワー", kana: "ぎょくろうめさわー", en: "Gyokuro Ume Sour" },
      price: 800,
      priceNote: { ja: "2杯目以降 600円", en: "Refills ¥600" },
      desc: {
        ja: "自家製のお茶焼酎を炭酸水で割り、自家製の玉露梅を入れたオリジナル梅サワー。梅はつぶしても、そのままでも。グラスそのままで、お茶焼酎と炭酸水のおかわりができます。",
        en: "Our original plum sour: house‑made tea shochu with soda and a house‑made gyokuro ume plum. Crush the plum or not, as you like. Refill the same glass with tea shochu and soda."
      }
    },

    /* ---- 茶葉・お土産（店頭価格） ---- */
    {
      id: "itsumo", cat: "shop", group: "leaf", feature: true,
      name: { ja: "いつものひといき", en: "Itsumo no Hitoiki" },
      kind: { ja: "市川茶屋オリジナル煎茶（市川茶）", en: "Our original sencha (Ichikawa‑cha)" },
      size: { ja: "50g入 リーフ", en: "50 g loose leaf" },
      price: 1500,
      image: "assets/img/pkg-itsumo.jpg",
      online: { price: 1600, size: { ja: "茶葉 50g", en: "50 g loose leaf" }, url: "https://ichikawa0501.base.ec/items/105283864" }
    },
    {
      id: "itsumo-tb", cat: "shop", group: "leaf",
      name: { ja: "いつものひといき ティーバッグ", en: "Itsumo no Hitoiki, tea bags" },
      size: { ja: "3g×8包", en: "8 bags × 3 g" },
      price: 1500
    },
    {
      id: "asa", cat: "shop", group: "leaf", feature: true,
      name: { ja: "あさのひといき", en: "Asa no Hitoiki" },
      kind: { ja: "福岡県産 八女茶", en: "Yame sencha, Fukuoka" },
      size: { ja: "50g入 リーフ", en: "50 g loose leaf" },
      price: 1400,
      image: "assets/img/pkg-asa.jpg",
      online: { price: 1500, size: { ja: "茶葉 50g", en: "50 g loose leaf" }, url: "https://ichikawa0501.base.ec/items/132713943" }
    },
    {
      id: "hiru", cat: "shop", group: "leaf", feature: true,
      name: { ja: "ひるのひといき", en: "Hiru no Hitoiki" },
      kind: { ja: "鹿児島県産 知覧茶", en: "Chiran sencha, Kagoshima" },
      size: { ja: "50g入 リーフ", en: "50 g loose leaf" },
      price: 1200,
      image: "assets/img/pkg-hiru.jpg",
      online: { price: 1300, size: { ja: "茶葉 50g", en: "50 g loose leaf" }, url: "https://ichikawa0501.base.ec/items/132714001" }
    },
    {
      id: "yoru", cat: "shop", group: "leaf", feature: true,
      name: { ja: "よるのひといき", en: "Yoru no Hitoiki" },
      kind: { ja: "自家焙煎ほうじ茶", en: "House‑roasted hojicha" },
      size: { ja: "50g入 リーフ", en: "50 g loose leaf" },
      price: 1000,
      image: "assets/img/pkg-yoru.jpg",
      online: { price: 1100, size: { ja: "茶葉 50g", en: "50 g loose leaf" }, url: "https://ichikawa0501.base.ec/items/105663407" }
    },
    {
      id: "yoru-tb", cat: "shop", group: "leaf", check: true,
      name: { ja: "よるのひといき ティーバッグ", en: "Yoru no Hitoiki, tea bags" },
      size: { ja: "5g×8包", en: "8 bags × 5 g" },
      price: 1200
    },
    {
      id: "matcha-50", cat: "shop", group: "leaf",
      name: { ja: "八女抹茶", en: "Yame Matcha" },
      size: { ja: "50g入", en: "50 g" },
      price: 2500,
      priceNote: { ja: "価格の変動や在庫切れの場合があります", en: "Price and stock may vary" }
    },
    {
      id: "hojicha-latte-powder", cat: "shop", group: "leaf",
      name: { ja: "ほうじちゃらて", en: "Hojicha Latte Powder" },
      kind: { ja: "八女産ほうじ茶パウダー", en: "Yame hojicha powder" },
      size: { ja: "50g入", en: "50 g" },
      price: 1100
    },
    {
      id: "dorayaki-takeaway", cat: "shop", group: "gift",
      name: { ja: "ほうじ茶あんどら焼き", en: "Hojicha Dorayaki" },
      price: 400, unit: { ja: "おひとつ", en: "each" },
      desc: { ja: "レジ横でお持ち帰り用も販売しています。お土産にもどうぞ。", en: "Also sold by the register to take home — a nice gift." }
    }
  ]
};
