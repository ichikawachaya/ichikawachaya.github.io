// Supabase の REST API と Auth API を fetch で直接呼ぶ小さなクライアント。
// 使う鍵は Publishable key だけ。権限の制御はデータベース側（RLS と GRANT）で行う。
import { CONFIG } from './config.js';

const REST = `${CONFIG.supabaseUrl}/rest/v1`;
const AUTH = `${CONFIG.supabaseUrl}/auth/v1`;
const SESSION_KEY = 'ichikawa-menu-admin-session';
const PUBLIC_COLUMNS = 'id,content,price,visible,sold_out,sort';
const ADMIN_COLUMNS = 'id,content,price,visible,sold_out,sort,version,updated_at';
const ID_PATTERN = /^[a-z0-9-]{1,64}$/;

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(url, { method = 'GET', headers = {}, body, timeoutMs = 10000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      headers: { apikey: CONFIG.supabasePublishableKey, ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      cache: 'no-store',
    });
    const text = await res.text();
    let data = null;
    if (text) {
      try { data = JSON.parse(text); } catch { data = null; }
    }
    if (!res.ok) {
      const code = data?.error_code || data?.code || data?.error || '';
      throw new ApiError(data?.msg || data?.message || `HTTP ${res.status}`, res.status, code);
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err?.name === 'AbortError' ? 'timeout' : 'network', 0, 'network');
  } finally {
    clearTimeout(timer);
  }
}

// ---- 公開メニュー（ログイン不要。RLS により visible = true の行だけ返る） ----

export async function fetchPublicMenu() {
  const rows = await request(
    `${REST}/menu_items?select=${PUBLIC_COLUMNS}&visible=is.true&order=sort.asc`,
  );
  if (!Array.isArray(rows)) throw new ApiError('invalid response', 0, 'invalid');
  return rows;
}

// ---- 管理者ログイン（Supabase Auth のメール・パスワード認証） ----

function readStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeSession(session) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // 保存できない環境（プライベートブラウズ等）では、ページを開いている間だけ有効
  }
  memorySession = session;
}

let memorySession = readStoredSession();

function toSession(data) {
  if (!data?.access_token || !data?.refresh_token) throw new ApiError('invalid session', 0, 'invalid');
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at || Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
    email: data.user?.email || '',
    userId: data.user?.id || '',
  };
}

export async function signIn(email, password) {
  const data = await request(`${AUTH}/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email, password },
  });
  const session = toSession(data);
  storeSession(session);
  return session;
}

async function refresh(session) {
  const data = await request(`${AUTH}/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { refresh_token: session.refreshToken },
  });
  const next = toSession(data);
  storeSession(next);
  return next;
}

// 有効なセッションを返す。期限が近ければ更新し、更新できなければ null。
export async function getSession() {
  const session = memorySession;
  if (!session) return null;
  if (session.expiresAt - 60 > Date.now() / 1000) return session;
  try {
    return await refresh(session);
  } catch (err) {
    if (err.status === 0) throw err; // 通信エラーはログアウト扱いにしない
    storeSession(null);
    return null;
  }
}

export async function signOut() {
  const session = memorySession;
  storeSession(null);
  if (!session) return;
  try {
    await request(`${AUTH}/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
  } catch {
    // 端末側のログイン情報は消してあるので、ここでの失敗は無視してよい
  }
}

async function authed(url, options = {}) {
  const session = await getSession();
  if (!session) throw new ApiError('not signed in', 401, 'no_session');
  return request(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${session.accessToken}` },
  });
}

// ---- 管理画面用（RLS により管理者だけが非表示を含む全件を読める） ----

export async function fetchAllItems() {
  const rows = await authed(`${REST}/menu_items?select=${ADMIN_COLUMNS}&order=sort.asc`);
  if (!Array.isArray(rows)) throw new ApiError('invalid response', 0, 'invalid');
  return rows;
}

// 変更できるのは price / visible / sold_out だけ（データベース側でも同じ制限をかけている）。
// version が一致する行だけを更新し、他の端末で先に変更されていたら conflict を返す。
export async function updateItem(id, version, changes) {
  if (!ID_PATTERN.test(id)) throw new ApiError('invalid id', 0, 'invalid');
  const patch = {};
  if ('price' in changes) patch.price = changes.price;
  if ('visible' in changes) patch.visible = changes.visible;
  if ('sold_out' in changes) patch.sold_out = changes.sold_out;
  const rows = await authed(
    `${REST}/menu_items?id=eq.${id}&version=eq.${Number(version)}&select=${ADMIN_COLUMNS}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: patch,
    },
  );
  if (!Array.isArray(rows) || rows.length !== 1) throw new ApiError('conflict', 409, 'conflict');
  return rows[0];
}
