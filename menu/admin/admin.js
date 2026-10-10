// 管理画面。変更できるのは値段・表示／非表示・品切れだけ。
// 外部から来た文字は必ず textContent で入れる（innerHTML は使わない）。
import { CONFIG } from '../config.js';
import {
  ApiError, signIn, signOut, getSession, fetchAllItems, updateItem,
} from '../supabase-client.js';

const ADMIN_ID = 'ichikawachaya';
const MAX_PRICE = 100000;

const $ = (id) => document.getElementById(id);
const els = {
  boot: $('boot'),
  loginView: $('login-view'),
  loginForm: $('login-form'),
  loginId: $('login-id'),
  loginPassword: $('login-password'),
  loginButton: $('login-button'),
  loginMessage: $('login-message'),
  appView: $('app-view'),
  appMessage: $('app-message'),
  logout: $('logout-button'),
  search: $('search'),
  chips: $('filter-chips'),
  count: $('admin-count'),
  list: $('admin-list'),
};

const FILTERS = [
  { id: 'all', label: 'すべて', test: () => true },
  { id: 'visible', label: 'お客様に表示中', test: (i) => i.visible },
  { id: 'hidden', label: '非表示', test: (i) => !i.visible },
  { id: 'sold', label: '品切れ', test: (i) => i.sold_out },
];

const state = { items: [], filter: 'all', query: '', groups: {} };
const cards = new Map();

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}

// ---- 画面の切り替え ----

function show(view) {
  els.boot.hidden = true;
  els.loginView.hidden = view !== 'login';
  els.appView.hidden = view !== 'app';
}

function showLogin(message) {
  els.loginPassword.value = '';
  els.loginMessage.textContent = message || '';
  els.loginMessage.hidden = !message;
  els.loginButton.disabled = false;
  els.loginButton.textContent = 'ログイン';
  show('login');
  els.loginPassword.focus();
}

let messageTimer;
function showAppMessage(text, kind = 'ok') {
  clearTimeout(messageTimer);
  els.appMessage.textContent = text;
  els.appMessage.className = `message message--${kind}`;
  els.appMessage.hidden = !text;
  if (text) messageTimer = setTimeout(() => { els.appMessage.hidden = true; }, kind === 'ok' ? 4000 : 10000);
}

function errorText(err) {
  if (err instanceof ApiError) {
    if (err.status === 0) return '通信できませんでした。電波の良い場所で、もう一度お試しください。';
    if (err.status === 429) return '短い時間に何度も試したため、少し待ってからもう一度お試しください。';
    if (err.code === 'conflict') return 'ほかの画面で先に変更されていたため、最新の内容に読み込み直しました。もう一度操作してください。';
    if (err.status === 401) return 'ログインの有効期限が切れました。もう一度ログインしてください。';
    if (err.status === 403) return '変更する権限がありません。';
  }
  return '保存できませんでした。時間をおいて、もう一度お試しください。';
}

// ---- ログイン ----

els.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const id = els.loginId.value.trim().toLowerCase();
  const password = els.loginPassword.value;
  if (!id || !password) {
    showLogin('IDとパスワードを入れてください。');
    return;
  }
  if (id !== ADMIN_ID) {
    showLogin('IDかパスワードが違います。');
    return;
  }
  els.loginButton.disabled = true;
  els.loginButton.textContent = '確認しています…';
  els.loginMessage.hidden = true;
  try {
    const session = await signIn(CONFIG.adminEmail, password);
    if (session.email !== CONFIG.adminEmail) {
      await signOut();
      showLogin('このアカウントでは管理できません。');
      return;
    }
    els.loginPassword.value = '';
    await openApp();
  } catch (err) {
    if (err instanceof ApiError && (err.status === 400 || err.code === 'invalid_credentials')) {
      showLogin('IDかパスワードが違います。');
    } else {
      showLogin(errorText(err));
    }
  }
});

els.logout.addEventListener('click', async () => {
  els.logout.disabled = true;
  await signOut();
  els.logout.disabled = false;
  state.items = [];
  els.list.replaceChildren();
  cards.clear();
  showLogin('ログアウトしました。');
  els.loginMessage.className = 'message message--ok';
});

// ---- 一覧 ----

async function loadGroups() {
  try {
    const res = await fetch('../menu-metadata.json', { cache: 'no-cache' });
    if (res.ok) state.groups = (await res.json()).groups || {};
  } catch {
    state.groups = {};
  }
}

async function reloadItems() {
  state.items = await fetchAllItems();
  renderList();
}

async function openApp() {
  show('app');
  els.loginMessage.className = 'message message--error';
  els.count.textContent = '読み込み中…';
  try {
    await Promise.all([loadGroups(), reloadItems()]);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      await signOut();
      showLogin(errorText(err));
      return;
    }
    els.count.textContent = '';
    showAppMessage(`一覧を読み込めませんでした。${errorText(err)}`, 'error');
  }
}

function normalize(text) {
  return String(text || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60))
    .replace(/[\s・･‐‑\-]/g, '');
}

function matches(item) {
  if (!state.query) return true;
  const names = Object.values(item.content?.name || {});
  return names.some((n) => normalize(n).includes(state.query));
}

function renderChips() {
  els.chips.replaceChildren(...FILTERS.map((f) => {
    const b = el('button', null, f.label);
    b.type = 'button';
    b.setAttribute('aria-pressed', String(f.id === state.filter));
    b.addEventListener('click', () => { state.filter = f.id; renderChips(); renderList(); });
    return b;
  }));
}

function renderList() {
  const filter = FILTERS.find((f) => f.id === state.filter);
  const shown = state.items.filter((i) => filter.test(i) && matches(i));
  cards.clear();
  els.list.replaceChildren(...shown.map((item) => {
    const card = renderCard(item);
    cards.set(item.id, card);
    return card;
  }));
  updateCount(shown.length);
  if (!shown.length) els.list.append(el('li', 'status__empty', '当てはまる商品がありません。'));
}

function updateCount(shownCount = cards.size) {
  const hidden = state.items.filter((i) => !i.visible).length;
  const sold = state.items.filter((i) => i.sold_out).length;
  els.count.textContent = `全${state.items.length}品（非表示 ${hidden}品・品切れ ${sold}品）のうち、${shownCount}品を表示しています。`;
}

function parsePrice(raw) {
  const text = String(raw).normalize('NFKC').replace(/[,，円¥\s]/g, '');
  if (!/^\d+$/.test(text)) return null;
  const n = Number(text);
  return Number.isSafeInteger(n) && n >= 0 && n <= MAX_PRICE ? n : null;
}

function renderCard(item) {
  const li = el('li', 'admin-card');
  if (!item.visible) li.classList.add('is-hidden-item');
  if (item.sold_out) li.classList.add('is-sold-out-item');

  const name = item.content?.name || {};
  li.append(el('h2', 'admin-card__name', name.ja || item.id));
  const groupLabel = state.groups[item.content?.group]?.label?.ja;
  li.append(el('p', 'admin-card__sub', [name.en, groupLabel].filter(Boolean).join('　／　')));

  const badges = el('div', 'admin-card__badges');
  badges.append(item.visible
    ? el('span', 'badge badge--on', 'お客様に表示中')
    : el('span', 'badge badge--hidden', '非表示（お客様には見えません）'));
  if (item.sold_out) badges.append(el('span', 'badge badge--sold', '品切れ'));
  li.append(badges);

  const controls = el('div', 'admin-card__controls');

  // 値段
  const priceRow = el('div', 'price-row');
  const field = el('label', 'field', '値段（円）');
  const inputId = `price-${item.id}`;
  field.htmlFor = inputId;
  const wrap = el('span', 'price-input-wrap');
  const input = el('input');
  input.id = inputId;
  input.type = 'text';
  input.inputMode = 'numeric';
  input.autocomplete = 'off';
  input.value = String(item.price);
  wrap.append(input, el('span', null, '円'));
  field.append(wrap);
  const save = el('button', 'button', '保存');
  save.type = 'button';
  priceRow.append(field, save);
  controls.append(priceRow);

  // 表示・品切れ
  const toggles = el('div', 'toggle-row');
  const visibleBtn = el('button', 'toggle toggle--visible');
  visibleBtn.type = 'button';
  visibleBtn.setAttribute('aria-pressed', String(item.visible));
  visibleBtn.append(
    document.createTextNode(item.visible ? 'お客様に表示' : '非表示'),
    el('small', null, item.visible ? '押すと隠します' : '押すと表示します'),
  );
  const soldBtn = el('button', 'toggle toggle--sold');
  soldBtn.type = 'button';
  soldBtn.setAttribute('aria-pressed', String(item.sold_out));
  soldBtn.append(
    document.createTextNode(item.sold_out ? '品切れ' : '販売中'),
    el('small', null, item.sold_out ? '押すと販売中に戻します' : '押すと品切れにします'),
  );
  toggles.append(visibleBtn, soldBtn);
  controls.append(toggles);

  const status = el('p', 'admin-card__status');
  status.setAttribute('role', 'status');
  controls.append(status);
  li.append(controls);

  const setStatus = (text, kind) => {
    status.textContent = text;
    status.className = `admin-card__status${kind ? ` is-${kind}` : ''}`;
  };

  async function save_(changes, okText, focusKey) {
    for (const b of [save, visibleBtn, soldBtn, input]) b.disabled = true;
    setStatus('保存しています…');
    try {
      const updated = await updateItem(item.id, item.version, changes);
      const index = state.items.findIndex((i) => i.id === item.id);
      state.items[index] = updated;
      const next = renderCard(updated);
      li.replaceWith(next);
      cards.set(item.id, next);
      updateCount();
      next.querySelector('.admin-card__status').textContent = `保存しました：${okText}`;
      next.querySelector('.admin-card__status').classList.add('is-ok');
      next.querySelector(focusKey)?.focus();
      showAppMessage(`「${updated.content?.name?.ja || updated.id}」　${okText}`);
    } catch (err) {
      for (const b of [save, visibleBtn, soldBtn, input]) b.disabled = false;
      setStatus(errorText(err), 'error');
      if (err instanceof ApiError && err.status === 401) {
        await signOut();
        showLogin(errorText(err));
      } else if (err instanceof ApiError && err.code === 'conflict') {
        try { await reloadItems(); } catch { /* 下の表示で知らせる */ }
        showAppMessage(errorText(err), 'error');
      }
    }
  }

  save.addEventListener('click', () => {
    const price = parsePrice(input.value);
    if (price === null) {
      setStatus(`値段は0〜${MAX_PRICE.toLocaleString('ja-JP')}の数字で入れてください。`, 'error');
      input.focus();
      return;
    }
    if (price === item.price) {
      setStatus('値段は変わっていません。', null);
      return;
    }
    save_({ price }, `値段を${price.toLocaleString('ja-JP')}円にしました。`, 'input');
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') save.click(); });
  visibleBtn.addEventListener('click', () => save_(
    { visible: !item.visible },
    item.visible ? 'お客様のメニューから隠しました。' : 'お客様のメニューに表示しました。',
    '.toggle--visible',
  ));
  soldBtn.addEventListener('click', () => save_(
    { sold_out: !item.sold_out },
    item.sold_out ? '販売中に戻しました。' : '品切れにしました。',
    '.toggle--sold',
  ));
  return li;
}

els.search.addEventListener('input', () => {
  state.query = normalize(els.search.value);
  renderList();
});

// ---- 起動 ----

async function boot() {
  renderChips();
  try {
    const session = await getSession();
    if (session && session.email === CONFIG.adminEmail) {
      await openApp();
      return;
    }
    if (session) await signOut();
    showLogin();
  } catch (err) {
    showLogin(errorText(err));
  }
}

boot();
