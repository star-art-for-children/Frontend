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

  const { role, name } = parsed.data;
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

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('profiles')
    .select('onboarded')
    .eq('id', user.id)
    .single();

  if (existingError && existingError.code !== 'PGRST116') {
    return NextResponse.json(
      { error: '프로필 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }

  if (existing?.onboarded) {
    return NextResponse.json(
      { error: '이미 온보딩을 완료한 계정입니다.' },
      { status: 409 }
    );
  }

  const { error: upsertError } = await supabaseAdmin.from('profiles').upsert(
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

  await supabase.auth.updateUser({
    data: { username: name, role, institution, purpose, onboarded: true },
  });

  return NextResponse.json({ success: true });
}
