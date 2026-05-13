import { SupabaseClient } from '@supabase/supabase-js';

type RoleCheckResult =
  | { ok: false; status: number; message: string }
  | { ok: true; user: { id: string } };
export async function checkRole(
  supabase: SupabaseClient
): Promise<RoleCheckResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, status: 401, message: 'no session' };

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profileError)
    return { ok: false, status: 403, message: 'no profile' };

  if (profile.role !== 'teacher')
    return { ok: false, status: 403, message: 'no role' };

  return { ok: true, user };
}

export async function checkExhibitionOwner(
  supabase: SupabaseClient,
  id: string,
  teacherId: string,
  type: 'artwork' | 'exhibition'
) {
  let exhibitionId = id;

  if (type === 'artwork') {
    const { data: artwork, error } = await supabase
      .from('artworks')
      .select('exhibition_id')
      .eq('id', id)
      .single();

    if (error || !artwork) {
      return { ok: false, status: 404, message: 'invalid artWorkId' };
    }

    exhibitionId = artwork.exhibition_id;
  }

  const { data: exhibition, error: exhibitionError } = await supabase
    .from('exhibitions')
    .select('teacher_id')
    .eq('id', exhibitionId)
    .single();

  if (exhibitionError || !exhibition) {
    return { ok: false, status: 404, message: 'invalid exhibition' };
  }

  if (teacherId !== exhibition.teacher_id) {
    return { ok: false, status: 403, message: 'permission denied' };
  }

  return { ok: true };
}
