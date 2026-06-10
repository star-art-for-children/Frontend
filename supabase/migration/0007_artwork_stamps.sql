-- *** 현재 파일은 단순 기록용 파일입니다. ***
-- supabase에서 해당 sql을 추가하였고 무엇이 추가되었는지 공유용으로 만든 파일입니다.

-- 3D 갤러리 스탬프 투어(그림 찾기) 기능용 마이그레이션
-- 관람객이 전시관에서 그림을 찾을 때마다 스탬프 수집 기록을 저장한다.
-- 구조는 좋아요(artwork_likes)와 동일한 (user, artwork) 매핑 테이블이다.

-- 1) 스탬프 수집 기록 테이블
create table if not exists artwork_stamps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  artwork_id uuid not null references artworks(id) on delete cascade,
  exhibition_id uuid not null references exhibitions(id) on delete cascade,
  created_at timestamptz not null default now(),
  -- 같은 그림에 중복 스탬프 방지 (스탬프는 모으기 전용, 취소 없음)
  unique (user_id, artwork_id)
);

-- 2) 조회용 인덱스
--    - 내 진행률 집계: (user_id, exhibition_id)
--    - 작품별 수집자 조회: (artwork_id)
create index if not exists artwork_stamps_user_exhibition_idx
  on artwork_stamps (user_id, exhibition_id);
create index if not exists artwork_stamps_artwork_idx
  on artwork_stamps (artwork_id);

-- 3) RLS: 본인 스탬프만 읽고 쓸 수 있도록 제한
alter table artwork_stamps enable row level security;

-- 본인 스탬프 조회
create policy "select own stamps"
  on artwork_stamps for select
  using (auth.uid() = user_id);

-- 본인 스탬프 추가
create policy "insert own stamps"
  on artwork_stamps for insert
  with check (auth.uid() = user_id);

-- 본인 스탬프 삭제 (향후 초기화 기능 대비)
create policy "delete own stamps"
  on artwork_stamps for delete
  using (auth.uid() = user_id);
