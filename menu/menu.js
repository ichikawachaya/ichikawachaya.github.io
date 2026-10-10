// 公開メニュー。外部から来た文字は必ず textContent で入れる（innerHTML は使わない）。
import { fetchPublicMenu } from './supabase-client.js';

const LANGS = ['ja', 'en', 'ko', 'zh-Hans', 'zh-Hant'];
const LANG_STORE_KEY = 'ichikawa-menu-lang';

const els = {
  title: document.getElementById('page-title'),
  langSwitch: document.getElementById('lang-switch'),
  hint: document.getElementById('order-hint'),
  tabs: document.getElementById('category-tabs'),
  status: document.getElementById('status'),
  stale: document.getElementById('stale-notice'),
  sections: document.getElementById('menu-sections'),
  notes: document.getElementById('tea-notes'),
  notesTitle: document.getElementById('tea-notes-title'),
  notesList: document.getElementById('tea-notes-list'),
};

const state = {
  meta: null,
  items: [],
  stale: false,
  lang: 'ja',
  tab: 'tea',
  phase: 'loading', // loading | ready | error
};

// ---- 小さな道具 ----

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}

function pick(obj, lang = state.lang) {
  if (!obj || typeof obj !== 'object') return '';
  return obj[lang] || obj.en || obj.ja || '';
}

function exact(obj, lang = state.lang) {
  return obj && typeof obj === 'object' && typeof obj[lang] === 'string' ? obj[lang] : '';
}

function formatPrice(price) {
  const n = Number(price).toLocaleString('ja-JP');
  return state.lang === 'ja' ? `${n}円` : `¥${n}`;
}

function readStoredLang() {
  try { return localStorage.getItem(LANG_STORE_KEY); } catch { return null; }
}

function storeLang(lang) {
  try { localStorage.setItem(LANG_STORE_KEY, lang); } catch { /* 保存できなくても表示はできる */ }
}

function browserLang() {
  for (const raw of navigator.languages || [navigator.language || '']) {
    const l = String(raw).toLowerCase();
    if (l.startsWith('ja')) return 'ja';
    if (l.startsWith('ko')) return 'ko';
    if (l.startsWith('zh')) {
      return /hant|tw|hk|mo/.test(l) ? 'zh-Hant' : 'zh-Hans';
    }
    if (l.startsWith('en')) return 'en';
  }
  return 'ja';
}

function initialState() {
  const params = new URLSearchParams(location.search);
  const lang = params.get('lang');
  state.lang = LANGS.includes(lang) ? lang : (LANGS.includes(readStoredLang()) ? readStoredLang() : browserLang());
  state.tab = params.get('cat') || 'tea';
}

function syncUrl() {
  const url = new URL(location.href);
  url.searchParams.set('lang', state.lang);
  url.searchParams.set('cat', state.tab);
  history.replaceState(null, '', url);
}

// ---- データの検査（壊れた行は表示しない） ----

function normalizeItems(rows) {
  const groups = state.meta.groups;
  return rows
    .filter((row) => row && row.visible === true
      && typeof row.id === 'string'
      && Number.isInteger(row.price) && row.price >= 0
      && row.content && row.content.name && groups[row.content.group])
    .map((row) => ({
      id: row.id,
      sort: Number.isFinite(row.sort) ? row.sort : 0,
      price: row.price,
      soldOut: row.sold_out === true,
      c: row.content,
    }))
    .sort((a, b) => a.sort - b.sort);
}

async function loadJson(path) {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function loadMenu() {
  state.phase = 'loading';
  render();
  try {
    if (!state.meta) state.meta = await loadJson('menu-metadata.json');
    if (!state.meta.tabs.some((t) => t.id === state.tab)) state.tab = state.meta.tabs[0].id;
    try {
      state.items = normalizeItems(await fetchPublicMenu());
      state.stale = false;
    } catch (err) {
      // Supabase に届かないときだけ、保存してある予備データを使う
      console.warn('Supabase に接続できないため予備データを表示します', err?.message);
      const fallback = await loadJson('menu-data.json');
      state.items = normalizeItems(fallback.items || []);
      state.stale = true;
    }
    state.phase = 'ready';
  } catch (err) {
    console.error('メニューを読み込めませんでした', err);
    state.phase = 'error';
  }
  render();
}

// ---- 描画 ----

function renderChrome() {
  const ui = state.meta?.ui?.[state.lang];
  document.documentElement.lang = state.lang;
  if (!ui) return;
  els.title.textContent = ui.menu;
  document.title = `${ui.menu}｜市川茶屋`;
  els.langSwitch.setAttribute('aria-label', ui.languageLabel);
  els.tabs.setAttribute('aria-label', ui.categoryLabel);
  els.hint.textContent = ui.hint;
  els.hint.hidden = !ui.hint;
  els.stale.textContent = ui.stale;
  els.stale.hidden = !(state.phase === 'ready' && state.stale);

  els.langSwitch.replaceChildren(...state.meta.languages.map(({ code, label }) => {
    const b = el('button', 'lang-switch__button', label);
    b.type = 'button';
    b.lang = code;
    b.setAttribute('aria-pressed', String(code === state.lang));
    b.addEventListener('click', () => setLang(code));
    return b;
  }));

  els.tabs.hidden = state.phase !== 'ready';
  els.tabs.replaceChildren(...state.meta.tabs.map((tab) => {
    const b = el('button', 'category-tabs__button', pick(tab.label));
    b.type = 'button';
    b.setAttribute('aria-pressed', String(tab.id === state.tab));
    b.addEventListener('click', () => setTab(tab.id));
    return b;
  }));
}

function renderStatus() {
  const ui = state.meta?.ui?.[state.lang];
  if (state.phase === 'loading') {
    els.status.replaceChildren(el('p', 'status__loading', ui?.loading || '読み込み中…'));
    els.status.hidden = false;
  } else if (state.phase === 'error') {
    const retry = el('button', 'button', ui?.retry || 'もう一度読み込む');
    retry.type = 'button';
    retry.addEventListener('click', loadMenu);
    els.status.replaceChildren(el('p', 'status__error', ui?.error || 'メニューを読み込めませんでした。'), retry);
    els.status.hidden = false;
  } else {
    els.status.replaceChildren();
    els.status.hidden = true;
  }
}

function renderItem(item, ui) {
  const li = el('li', item.soldOut ? 'menu-item is-sold-out' : 'menu-item');

  const head = el('div', 'menu-item__head');
  const names = el('div', 'menu-item__names');
  const name = el('h3', 'menu-item__name', pick(item.c.name));
  names.append(name);
  if (state.lang !== 'ja' && item.c.name.ja) {
    const ja = el('p', 'menu-item__name-ja', item.c.name.ja);
    ja.lang = 'ja';
    names.append(ja);
  }
  head.append(names);

  const priceBox = el('div', 'menu-item__price-box');
  const price = el('p', 'menu-item__price', formatPrice(item.price));
  const unit = pick(item.c.unit);
  if (unit) price.append(el('span', 'menu-item__unit', ` / ${unit}`));
  priceBox.append(price);
  if (item.soldOut) priceBox.append(el('p', 'menu-item__sold-out', ui.soldOut));
  head.append(priceBox);
  li.append(head);

  const sub = [pick(item.c.serve), pick(item.c.origin)].filter(Boolean);
  if (sub.length) li.append(el('p', 'menu-item__sub', sub.join('　')));
  const priceNote = pick(item.c.priceNote);
  if (priceNote) li.append(el('p', 'menu-item__price-note', priceNote));
  const desc = exact(item.c.description);
  if (desc) li.append(el('p', 'menu-item__desc', desc));
  return li;
}

function renderSections() {
  if (state.phase !== 'ready') {
    els.sections.replaceChildren();
    els.notes.hidden = true;
    return;
  }
  const ui = state.meta.ui[state.lang];
  const tab = state.meta.tabs.find((t) => t.id === state.tab);
  const nodes = [];

  const tabNote = pick(tab.note);
  if (tabNote) nodes.push(el('p', 'tab-note', tabNote));

  let count = 0;
  for (const groupId of tab.groups) {
    const items = state.items.filter((i) => i.c.group === groupId);
    if (!items.length) continue;
    count += items.length;
    const group = state.meta.groups[groupId];
    const section = el('section', 'menu-group');
    const heading = el('div', 'menu-group__heading');
    heading.append(el('h2', 'menu-group__title', pick(group.label)));
    if (state.lang !== 'ja' && group.label.ja) {
      const ja = el('p', 'menu-group__title-ja', group.label.ja);
      ja.lang = 'ja';
      heading.append(ja);
    }
    section.append(heading);
    const note = pick(group.note);
    if (note) section.append(el('p', 'menu-group__note', note));
    const list = el('ul', 'menu-list');
    list.append(...items.map((item) => renderItem(item, ui)));
    section.append(list);
    nodes.push(section);
  }
  if (!count) nodes.push(el('p', 'status__empty', ui.empty));
  els.sections.replaceChildren(...nodes);

  els.notesTitle.textContent = ui.notesTitle;
  els.notesList.replaceChildren(...state.meta.notes.map((n) => el('li', null, pick(n))));
  els.notes.hidden = false;
}

function render() {
  renderChrome();
  renderStatus();
  renderSections();
}

function setLang(lang) {
  if (!LANGS.includes(lang)) return;
  state.lang = lang;
  storeLang(lang);
  syncUrl();
  render();
}

function setTab(tabId) {
  state.tab = tabId;
  syncUrl();
  render();
  els.tabs.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

initialState();
loadMenu().then(() => { if (state.phase === 'ready') syncUrl(); });
