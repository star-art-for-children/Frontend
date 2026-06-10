import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { onboardingSchema } from '@/lib/schemas/auth';
import { getAuthErrorMessage } from '@/lib/supabase/authErrors';

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: '로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청 형식입니다.' },
      { status: 400 }
    );
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  // 중복 온보딩 차단
  const { data: existing } = await supabase
    .from('profiles')
    .select('onboarded')
    .eq('id', user.id)
    .single();

  if (existing?.onboarded) {
    return NextResponse.json(
      { error: '이미 온보딩을 완료한 계정입니다.' },
      { status: 409 }
    );
  }

  const { role, name } = parsed.data;
  // 폼 organization -> 컬럼 institution 매핑 (teacher만 값 존재)
  const institution =
    parsed.data.role === 'teacher' ? parsed.data.organization : null;
  const purpose = parsed.data.role === 'teacher' ? parsed.data.purpose : null;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { error: '서버 설정 오류: Supabase 키가 누락되었습니다.' },
      { status: 500 }
    );
  }

  // 트리거가 행을 못 만든 경우(삭제된 행/트리거 이전 가입 계정 등)도 대비해 upsert.
  // profiles INSERT는 보통 트리거(security definer)가 전담해 유저용 INSERT 정책이
  // 없으므로, 회원가입 route와 동일하게 서비스롤로 RLS를 우회해 행을 보장한다.
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error: upsertError } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        id: user.id,
        username: name,
        role,
        institution,
        purpose,
        onboarded: true,
      },
      { onConflict: 'id' }
    );

  if (upsertError) {
    return NextResponse.json(
      { error: getAuthErrorMessage(upsertError) },
      { status: 400 }
    );
  }

  // metadata 동기화 (본인 정보 → admin client 불필요). 트리거는 AFTER INSERT
  // 전용이라 updateUser(=UPDATE)로 재실행되지 않음 → profiles 덮어쓰기 없음.
  await supabase.auth.updateUser({
    data: { username: name, role, institution, purpose, onboarded: true },
  });

  return NextResponse.json({ success: true });
}
