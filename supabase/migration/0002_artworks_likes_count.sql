-- *** 현재 파일은 단순 기록용 파일입니다. ***
-- supabase에서 해당 sql을 추가하였고 무엇이 추가되었는지 공유용으로 만든 파일입니다.

-- exhibitions_likes_count와 통일화, 위시리스트 인기순 정렬시 용이하게 하기 위한 마이그레이션
-- 1) artworks.likes_count 컬럼 추가
-- 2) 기존 artworks 데이터로 백필
-- 3) 작품 좋아요 갯수
-- 4) artwork_likes INSERT/DELETE 시 likes_count 자동 갱신 트리거

-- 1) likes_count 컬럼 추가
alter table artworks
  add column likes_count integer not null default 0;

-- 2) 기존 데이터 백필
update artworks a
   set likes_count = sub.c
  from (
    select artwork_id, count(*) as c
      from artwork_likes
     group by artwork_id
  ) sub
 where sub.artwork_id = a.id;

-- 3) 인기순 정렬용 인덱스
create index artworks_popular_idx
  on artworks (likes_count desc, created_at desc);

-- 4) 트리거 함수
create or replace function bump_artwork_likes_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update artworks
       set likes_count = likes_count + 1
     where id = new.artwork_id;
    return new;
  elsif tg_op = 'DELETE' then
    update artworks
       set likes_count = greatest(likes_count - 1, 0)
     where id = old.artwork_id;
    return old;
  end if;
  return null;
end $$;

-- 5) 트리거 부착
create trigger artwork_likes_count_trg
after insert or delete on artwork_likes
for each row execute function bump_artwork_likes_count();

