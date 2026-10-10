-- 市川茶屋メニュー：public.menu_items の権限設定
-- 実行場所：Supabase Dashboard → SQL Editor（実行は利用者の了承を得てから）
-- 何度実行しても同じ結果になるように書いてある。
--
-- 管理者ユーザー（ichikawachaya@admin.local）の User UID：3ce9913b-0843-4829-944f-f167426731ea
--
-- 考え方
--   RLS（行レベルセキュリティ）：どの「行」を読める・変えられるか。
--   GRANT／REVOKE：どの「列（項目）」を変えられるか。RLS では列は制限できないため両方を使う。
--   一般利用者（anon＝未ログイン）：visible = true の行だけ読める。変更は一切できない。
--   管理者：auth.uid() が管理者UUIDと一致し、かつメールが ichikawachaya@admin.local のときだけ
--           全行を読め、price・visible・sold_out の3項目だけ変更できる。
--   updated_at／updated_by／version は利用者に書かせず、トリガー（自動処理）で記録する。

begin;

-- 1. テーブル（既にあれば作り直さない）
create table if not exists public.menu_items (
  id          text primary key,
  content     jsonb       not null,
  price       integer     not null,
  visible     boolean     not null default true,
  sold_out    boolean     not null default false,
  version     integer     not null default 1,
  sort        integer     not null default 0,
  updated_at  timestamptz,
  updated_by  uuid
);

-- 値段は 0〜100,000 円の整数だけ
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.menu_items'::regclass and conname = 'menu_items_price_range'
  ) then
    alter table public.menu_items
      add constraint menu_items_price_range check (price between 0 and 100000);
  end if;
end $$;

-- 2. RLS を有効にする（無効化はしない）
alter table public.menu_items enable row level security;

-- 3. 管理者かどうかの判定
create or replace function public.is_menu_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(
    (select auth.uid()) = '3ce9913b-0843-4829-944f-f167426731ea'::uuid
    and lower(coalesce((select auth.jwt()) ->> 'email', '')) = 'ichikawachaya@admin.local',
    false
  );
$$;

revoke all on function public.is_menu_admin() from public;
grant execute on function public.is_menu_admin() to anon, authenticated;

-- 4. ポリシーを付け直す（このテーブルの既存ポリシーは一度すべて外す）
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'menu_items'
  loop
    execute format('drop policy %I on public.menu_items', p.policyname);
  end loop;
end $$;

create policy "menu_items: public reads visible rows"
  on public.menu_items for select
  to anon, authenticated
  using (visible = true);

create policy "menu_items: admin reads all rows"
  on public.menu_items for select
  to authenticated
  using (public.is_menu_admin());

create policy "menu_items: admin updates rows"
  on public.menu_items for update
  to authenticated
  using (public.is_menu_admin())
  with check (public.is_menu_admin());

-- INSERT・DELETE のポリシーは作らない（＝誰もできない）

-- 5. 列の権限
revoke all on public.menu_items from anon, authenticated;
grant select (id, content, price, visible, sold_out, sort) on public.menu_items to anon;
grant select on public.menu_items to authenticated;
grant update (price, visible, sold_out) on public.menu_items to authenticated;

-- 6. 更新日時・更新者・版番号を自動で記録する
create or replace function public.menu_items_stamp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  new.version    := old.version + 1;
  return new;
end;
$$;

-- 以前の作業で作られたトリガー（stamp_menu_update など）と二重にならないよう、
-- このテーブルの利用者作成トリガーをすべて外してから付け直す
do $$
declare t record;
begin
  for t in
    select tgname from pg_trigger
    where tgrelid = 'public.menu_items'::regclass and not tgisinternal
  loop
    execute format('drop trigger %I on public.menu_items', t.tgname);
  end loop;
end $$;

create trigger menu_items_stamp
  before update on public.menu_items
  for each row execute function public.menu_items_stamp();

commit;
