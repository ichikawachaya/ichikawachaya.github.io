// menu/menu-data.json から supabase/seed.sql を作る。
// 使い方：node scripts/generate-menu-seed.mjs
// seed.sql は、テーブルが空のときの初期登録用。既にある商品は上書きしない（on conflict do nothing）。
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const EXPECTED_COUNT = 33;
const LANGS = ['ja', 'en', 'ko', 'zh-Hans', 'zh-Hant'];

const data = JSON.parse(await readFile(join(root, 'menu/menu-data.json'), 'utf8'));
const meta = JSON.parse(await readFile(join(root, 'menu/menu-metadata.json'), 'utf8'));
const items = data.items;

const problems = [];
if (!Array.isArray(items)) throw new Error('menu-data.json の items が配列ではありません');
if (items.length !== EXPECTED_COUNT) problems.push(`商品数が ${items.length} 件です（想定 ${EXPECTED_COUNT} 件）`);
const ids = new Set();
for (const item of items) {
  if (!/^[a-z0-9-]{1,64}$/.test(item.id)) problems.push(`id が不正：${item.id}`);
  if (ids.has(item.id)) problems.push(`id が重複：${item.id}`);
  ids.add(item.id);
  if (!Number.isInteger(item.price) || item.price < 0 || item.price > 100000) problems.push(`値段が不正：${item.id}`);
  if (!meta.groups[item.content?.group]) problems.push(`分類が不明：${item.id}`);
  for (const lang of LANGS) {
    if (!item.content?.name?.[lang]) problems.push(`商品名（${lang}）がない：${item.id}`);
  }
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}

const q = (text) => `'${String(text).replaceAll("'", "''")}'`;
const rows = items.map((item) => {
  const content = { id: item.id, sort: item.sort, ...item.content };
  return `  (${q(item.id)}, ${q(JSON.stringify(content))}::jsonb, ${item.price}, ${item.visible}, ${item.sold_out}, ${item.sort})`;
});

const sql = `-- このファイルは scripts/generate-menu-seed.mjs で自動生成。直接編集しない。
-- 元データ：menu/menu-data.json（${data.snapshot} 時点の Supabase の内容）
-- 既にある商品は上書きしない。値段などを初期値に戻したい場合も、このファイルでは戻らない。
insert into public.menu_items (id, content, price, visible, sold_out, sort) values
${rows.join(',\n')}
on conflict (id) do nothing;

select count(*) as menu_item_count from public.menu_items;
`;

await writeFile(join(root, 'supabase/seed.sql'), sql);
console.log(`supabase/seed.sql を作成しました（${items.length} 件）`);
