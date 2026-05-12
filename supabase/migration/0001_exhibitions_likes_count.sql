-- *** 현재 파일은 단순 기록용 파일입니다. ***
-- supabase에서 해당 sql을 추가하였고 무엇이 추가되었는지 공유용으로 만든 파일입니다.

-- 인기순(popular) 정렬을 DB에서 처리하기 위한 마이그레이션
-- 1) exhibitions.likes_count 컬럼 추가
-- 2) 기존 exhibition_likes 데이터로 백필
-- 3) 인기순 정렬용 인덱스
-- 4) exhibition_likes INSERT/DELETE 시 likes_count 자동 갱신 트리거

-- 1) 컬럼 추가
alter table exhibitions
  add column likes_count integer not null default 0;

-- 2) 백필: 기존 좋아요 데이터로 카운트 채우기
update exhibitions e
   set likes_count = sub.c
  from (
    select exhibition_id, count(*) as c
      from exhibition_likes
     group by exhibition_id
  ) sub
 where sub.exhibition_id = e.id;

-- 3) 인덱스 (인기순 + 동률 시 start_date desc tie-breaker)
create index exhibitions_popular_idx
  on exhibitions (likes_count desc, start_date desc);

-- 4) 트리거 함수
create or replace function bump_exhibition_likes_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update exhibitions
       set likes_count = likes_count + 1
     where id = new.exhibition_id;
    return new;
  elsif tg_op = 'DELETE' then
    update exhibitions
       set likes_count = greatest(likes_count - 1, 0)
     where id = old.exhibition_id;
    return old;
  end if;
  return null;
end $$;

-- 5) 트리거 부착
create trigger exhibition_likes_count_trg
after insert or delete on exhibition_likes
for each row execute function bump_exhibition_likes_count();