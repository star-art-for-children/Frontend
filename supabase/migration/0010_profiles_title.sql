-- *** 현재 파일은 단순 기록용 파일입니다. ***
-- supabase에서 해당 sql을 추가하였고 무엇이 추가되었는지 공유용으로 만든 파일입니다.

-- 스탬프 투어 업적 시스템: 대표 칭호 저장용 컬럼
-- 업적 획득 여부는 artwork_stamps 데이터로 실시간 계산하므로 별도 테이블 없이,
-- 유저가 선택한 대표 칭호만 profiles에 저장한다.
alter table profiles add column if not exists selected_title text;
