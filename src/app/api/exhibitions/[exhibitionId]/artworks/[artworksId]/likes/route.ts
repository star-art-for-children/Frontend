import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ artworksId: string }> }
) {
  try {
    const supabase = await createClient();
    const { artworksId } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ message: 'no session' }, { status: 401 });
    }

    const { data: existing, error: exError } = await supabase
      .from('artwork_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('artwork_id', artworksId)
      .maybeSingle();

    if (exError) {
      console.log(exError);
      return Response.json(
        { message: 'artwork_likes_search_ error' },
        { status: 500 }
      );
    }
    if (existing) {
      await supabase.from('artwork_likes').delete().eq('id', existing.id);

      return Response.json({ liked: false });
    }

    console.log(user.id, artworksId);
    const { error } = await supabase.from('artwork_likes').insert({
      artwork_id: artworksId,
      user_id: user.id,
    });
    if (error) {
      console.log(error);
    }

    return Response.json({ liked: true });
  } catch (err) {
    console.log(err);
    return Response.json({ message: 'server error' }, { status: 500 });
  }
}
