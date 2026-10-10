-- 市川茶屋メニュー：現在の設定を確認する（読み取り専用。何も変更しない）
-- SQL Editor に貼って Run。結果の表（item と detail の2列）をそのまま共有する。
select '1 columns' as item,
  (select string_agg(column_name || ' ' || data_type || case when is_nullable = 'NO' then ' not null' else '' end
          || coalesce(' default ' || column_default, ''), ' | ' order by ordinal_position)
   from information_schema.columns
   where table_schema = 'public' and table_name = 'menu_items') as detail
union all
select '2 rls enabled',
  (select 'rls=' || relrowsecurity || ' force=' || relforcerowsecurity
   from pg_class where oid = 'public.menu_items'::regclass)
union all
select '3 policies',
  (select coalesce(string_agg(policyname || ' [' || cmd || ' to ' || array_to_string(roles, ',') || '] using(' || coalesce(qual, '-') || ') check(' || coalesce(with_check, '-') || ')', ' || '), 'none')
   from pg_policies where schemaname = 'public' and tablename = 'menu_items')
union all
select '4 table grants',
  (select coalesce(string_agg(grantee || ':' || privilege_type, ', ' order by grantee, privilege_type), 'none')
   from information_schema.role_table_grants
   where table_schema = 'public' and table_name = 'menu_items' and grantee in ('anon', 'authenticated'))
union all
select '5 column update grants',
  (select coalesce(string_agg(grantee || ':' || column_name, ', ' order by grantee, column_name), 'none')
   from information_schema.column_privileges
   where table_schema = 'public' and table_name = 'menu_items'
     and grantee in ('anon', 'authenticated') and privilege_type = 'UPDATE')
union all
select '6 triggers',
  (select coalesce(string_agg(pg_get_triggerdef(oid), ' || '), 'none')
   from pg_trigger where tgrelid = 'public.menu_items'::regclass and not tgisinternal)
union all
select '7 constraints',
  (select string_agg(conname || ': ' || pg_get_constraintdef(oid), ' || ')
   from pg_constraint where conrelid = 'public.menu_items'::regclass)
union all
select '8 rows',
  (select 'total=' || count(*) || ' visible=' || count(*) filter (where visible)
          || ' sold_out=' || count(*) filter (where sold_out) from public.menu_items)
union all
select '9 admin user',
  (select coalesce(string_agg('exists id=' || id || ' confirmed=' || (email_confirmed_at is not null), ', '), 'not found')
   from auth.users where email = 'ichikawachaya@admin.local')
union all
select '10 all users count',
  (select count(*)::text from auth.users);
