import { SupabaseClient } from '@supabase/supabase-js';

export async function getUserIdByEmail(
  supabase: SupabaseClient,
  email: string
) {
  const { data, error } = await supabase.rpc('get_user_id_by_email', {
    p_email: email,
  });

  if (error || !data) {
    return {
      ok: false,
      status: 404,
      message: 'profile not found',
    };
  }

  return {
    ok: true,
    userId: data as string,
  };
}
