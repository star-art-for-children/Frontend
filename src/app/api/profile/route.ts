import { createClient } from '@/lib/supabase/server';
import { getAuthContext } from '@/lib/auth/getAuthContext';
import { NextRequest, NextResponse } from 'next/server';
import { profilePatchSchema } from '@/lib/schemas/profile';

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  // 미온보딩은 비로그인 취급
  const { user, profile } = await getAuthContext();

  if (!user || !profile?.onboarded) {
    return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'invalid json body' }, { status: 400 });
  }
  const result = profilePatchSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { message: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const updates: Record<string, string> = { username: result.data.name };
  if (result.data.institution !== undefined) {
    if (profile.role !== 'teacher') {
      return NextResponse.json({ message: 'forbidden' }, { status: 403 });
    }
    updates.institution = result.data.institution;
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    return NextResponse.json({ message: 'database error' }, { status: 500 });
  }

  return NextResponse.json({ message: 'ok' }, { status: 200 });
}
