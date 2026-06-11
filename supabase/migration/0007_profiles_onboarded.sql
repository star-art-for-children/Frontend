-- 0007_profiles_onboarded.sql
-- OAuth 온보딩 추적용 컬럼 도입 + 트리거 갱신
-- (트리거 함수는 운영 DB의 기존 정의를 그대로 유지하고 onboarded 처리만 추가)

-- 1) onboarded 컬럼 추가 (신규 가입 기본 false = 온보딩 필요)
alter table public.profiles
  add column onboarded boolean not null default false;

-- 2) 기존 사용자는 모두 온보딩 완료로 백필 (이미 정상 가입자)
update public.profiles set onboarded = true;

-- 3) 트리거 함수 갱신: 기존 정의 유지 + metadata의 onboarded 반영
--    - 이메일+OTP 가입: signup route가 metadata에 onboarded=true → 온보딩 스킵
--    - OAuth 가입: metadata에 onboarded 없음 → coalesce로 false → 온보딩 강제
--    onboarded는 on conflict update에서 의도적으로 제외 (재삽입 시 완료 상태 보존)
create or replace function public.handle_new_user()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public', 'auth'
as $function$
begin
  insert into public.profiles (
    id,
    username,
    role,
    institution,
    purpose,
    onboarded
  )
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      'user_' || substr(new.id::text, 1, 8)
    ),
    case
      when new.raw_user_meta_data->>'role' in ('general', 'teacher')
        then new.raw_user_meta_data->>'role'
      else 'general'
    end,
    new.raw_user_meta_data->>'institution',
    new.raw_user_meta_data->>'purpose',
    coalesce((new.raw_user_meta_data->>'onboarded')::boolean, false)
  )
  on conflict (id) do update
  set
    username = excluded.username,
    role = excluded.role,
    institution = excluded.institution,
    purpose = excluded.purpose,
    updated_at = now();

  return new;
end;
$function$;
