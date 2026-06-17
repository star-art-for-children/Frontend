-- *** 현재 파일은 단순 기록용 파일입니다. ***
-- supabase에서 해당 sql을 추가하였고 무엇이 추가되었는지 공유용으로 만든 파일입니다.

-- 작품 이모지 반응 기능용 마이그레이션
-- 좋아요(artwork_likes)와 별개로, 작품마다 다양한 긍정 반응을 남긴다.
-- 한 유저는 작품당 반응 1개만 가질 수 있고(다른 이모지 선택 시 교체),
-- 구조는 좋아요와 동일한 (user, artwork) 매핑 + emoji 컬럼이다.

-- 1) 반응 기록 테이블
create table if not exists artwork_reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  artwork_id uuid not null references artworks(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  -- 한 유저당 작품마다 반응 1개 (UPSERT 시 emoji 교체)
  unique (user_id, artwork_id)
);

-- 2) 작품별 반응 집계용 인덱스
create index if not exists artwork_reactions_artwork_idx
  on artwork_reactions (artwork_id);

-- 3) RLS: 조회는 누구나(집계 표시용), 쓰기는 본인 것만
alter table artwork_reactions enable row level security;

-- 모든 사용자가 반응 집계를 볼 수 있도록 조회 허용
create policy "select reactions"
  on artwork_reactions for select
  using (true);

-- 본인 반응 추가
create policy "insert own reactions"
  on artwork_reactions for insert
  with check (auth.uid() = user_id);

-- 본인 반응 변경(이모지 교체)
create policy "update own reactions"
  on artwork_reactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 본인 반응 삭제(반응 해제)
create policy "delete own reactions"
  on artwork_reactions for delete
  using (auth.uid() = user_id);
