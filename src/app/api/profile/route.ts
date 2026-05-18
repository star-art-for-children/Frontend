import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const patchSchema = z.object({
  name: z.string().trim().min(1, '이름을 입력해주세요.'),
  institution: z.string().trim().optional(),
});

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const result = patchSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { message: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const updates: Record<string, string> = { username: result.data.name };
  if (result.data.institution !== undefined) {
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
