-- 市川茶屋メニュー：権限の検証（schema.sql 実行後に SQL Editor で実行）
-- 未ログイン・別ユーザー・管理者になりすました状態で更新を試し、結果を表で返す。
-- 各テストは中で必ず取り消す（例外で巻き戻す）ため、データは一切変わらない。
-- 別ユーザーは実在しない仮のIDで試すので、ユーザーを新しく作る必要はない。

create temp table if not exists _menu_test (no int, test text, expected text, result text);
truncate _menu_test;

do $$
declare
  admin_claims text := '{"sub":"3ce9913b-0843-4829-944f-f167426731ea","email":"ichikawachaya@admin.local","role":"authenticated"}';
  other_claims text := '{"sub":"00000000-0000-4000-8000-000000000001","email":"someone@example.com","role":"authenticated"}';
  anon_claims  text := '{"role":"anon"}';
  n int;
  res text;
  r9 text; r10 text; r11 text;
begin
  -- 1. 未ログインで値段を更新
  begin
    perform set_config('request.jwt.claims', anon_claims, true);
    set local role anon;
    update public.menu_items set price = price where id = 'ichikawa-cha';
    res := 'NG：更新できてしまった';
    raise exception using errcode = 'P0001';
  exception
    when insufficient_privilege then res := 'OK：拒否';
    when sqlstate 'P0001' then null;
  end;
  insert into _menu_test values (1, '未ログインで値段を変更', '拒否', res);

  -- 2. 未ログインで商品を追加
  begin
    perform set_config('request.jwt.claims', anon_claims, true);
    set local role anon;
    insert into public.menu_items (id, content, price) values ('test-x', '{}'::jsonb, 1);
    res := 'NG：追加できてしまった';
    raise exception using errcode = 'P0001';
  exception
    when insufficient_privilege then res := 'OK：拒否';
    when sqlstate 'P0001' then null;
  end;
  insert into _menu_test values (2, '未ログインで商品を追加', '拒否', res);

  -- 3. 未ログインで商品を削除
  begin
    perform set_config('request.jwt.claims', anon_claims, true);
    set local role anon;
    delete from public.menu_items where id = 'ichikawa-cha';
    res := 'NG：削除できてしまった';
    raise exception using errcode = 'P0001';
  exception
    when insufficient_privilege then res := 'OK：拒否';
    when sqlstate 'P0001' then null;
  end;
  insert into _menu_test values (3, '未ログインで商品を削除', '拒否', res);

  -- 4. 別ユーザーで値段を更新（RLS により対象0行になる）
  begin
    perform set_config('request.jwt.claims', other_claims, true);
    set local role authenticated;
    update public.menu_items set price = price where id = 'ichikawa-cha';
    get diagnostics n = row_count;
    res := case when n = 0 then 'OK：0行（変更されない）' else 'NG：' || n || '行更新できてしまった' end;
    raise exception using errcode = 'P0001';
  exception
    when insufficient_privilege then res := 'OK：拒否';
    when sqlstate 'P0001' then null;
  end;
  insert into _menu_test values (4, '別ユーザーで値段を変更', '拒否または0行', res);

  -- 5. 管理者でも商品名（content）は変更できない
  begin
    perform set_config('request.jwt.claims', admin_claims, true);
    set local role authenticated;
    update public.menu_items set content = content where id = 'ichikawa-cha';
    res := 'NG：変更できてしまった';
    raise exception using errcode = 'P0001';
  exception
    when insufficient_privilege then res := 'OK：拒否';
    when sqlstate 'P0001' then null;
  end;
  insert into _menu_test values (5, '管理者で商品名・説明を変更', '拒否', res);

  -- 6. 管理者でも更新日時などは直接変更できない
  begin
    perform set_config('request.jwt.claims', admin_claims, true);
    set local role authenticated;
    update public.menu_items set updated_at = now(), version = 999 where id = 'ichikawa-cha';
    res := 'NG：変更できてしまった';
    raise exception using errcode = 'P0001';
  exception
    when insufficient_privilege then res := 'OK：拒否';
    when sqlstate 'P0001' then null;
  end;
  insert into _menu_test values (6, '管理者で更新日時・版番号を直接変更', '拒否', res);

  -- 7. 管理者でも削除はできない
  begin
    perform set_config('request.jwt.claims', admin_claims, true);
    set local role authenticated;
    delete from public.menu_items where id = 'ichikawa-cha';
    res := 'NG：削除できてしまった';
    raise exception using errcode = 'P0001';
  exception
    when insufficient_privilege then res := 'OK：拒否';
    when sqlstate 'P0001' then null;
  end;
  insert into _menu_test values (7, '管理者で商品を削除', '拒否', res);

  -- 8. 管理者は値段・表示・品切れを変更できる（変更後に取り消す）
  begin
    perform set_config('request.jwt.claims', admin_claims, true);
    set local role authenticated;
    update public.menu_items set price = price + 1, visible = not visible, sold_out = not sold_out
      where id = 'ichikawa-cha';
    get diagnostics n = row_count;
    res := case when n = 1 then 'OK：1行変更できた（取り消し済み）' else 'NG：' || n || '行' end;
    raise exception using errcode = 'P0001';
  exception
    when insufficient_privilege then res := 'NG：拒否された';
    when sqlstate 'P0001' then null;
  end;
  insert into _menu_test values (8, '管理者で値段・表示・品切れを変更', '1行変更できる', res);

  -- 9〜11. 非表示の商品が誰に見えるか（一時的に1品を非表示にして確かめ、取り消す）
  begin
    update public.menu_items set visible = false where id = 'dorayaki';

    perform set_config('request.jwt.claims', anon_claims, true);
    set local role anon;
    select count(*) into n from public.menu_items where id = 'dorayaki';
    r9 := case when n = 0 then 'OK：0件' else 'NG：' || n || '件見えた' end;
    reset role;

    perform set_config('request.jwt.claims', other_claims, true);
    set local role authenticated;
    select count(*) into n from public.menu_items where id = 'dorayaki';
    r10 := case when n = 0 then 'OK：0件' else 'NG：' || n || '件見えた' end;
    reset role;

    perform set_config('request.jwt.claims', admin_claims, true);
    set local role authenticated;
    select count(*) into n from public.menu_items where id = 'dorayaki';
    r11 := case when n = 1 then 'OK：1件' else 'NG：' || n || '件' end;
    reset role;

    raise exception using errcode = 'P0001';
  exception
    when sqlstate 'P0001' then null;
  end;
  -- 結果の記録は巻き戻しの外で行う（中で書くと一緒に取り消されるため）
  insert into _menu_test values
    (9,  '未ログインで非表示商品が見えるか', '0件', coalesce(r9,  'NG：確認できず')),
    (10, '別ユーザーで非表示商品が見えるか', '0件', coalesce(r10, 'NG：確認できず')),
    (11, '管理者で非表示商品が見えるか',     '1件', coalesce(r11, 'NG：確認できず'));
end $$;

select no, test, expected, result from _menu_test order by no;
