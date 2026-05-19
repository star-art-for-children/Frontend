import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { profilePatchSchema } from '@/lib/schemas/profile';

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const result = profilePatchSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { message: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ message: 'profile not found' }, { status: 404 });
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
