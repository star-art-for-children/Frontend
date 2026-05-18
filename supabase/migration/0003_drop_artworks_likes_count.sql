-- 새 마이그레이션 파일: 0003_drop_artworks_likes_count.sql
-- 이유: artwork_likes에서 직접 count하는 방식으로 통일.
-- artworks.likes_count는 어디서도 읽지 않으므로 컬럼/트리거/인덱스 제거.

drop trigger if exists artwork_likes_count_trg on artwork_likes;
drop function if exists bump_artwork_likes_count();
drop index if exists artworks_popular_idx;
alter table artworks drop column if exists likes_count;