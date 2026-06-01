import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkExhibitionOwner, checkRole } from '@/lib/gallery/checkRole';

type ExhibitionDetailRow = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  start_date: string;
  end_date: string | null;
  theme: string;
  profile: { institution: string } | { institution: string }[] | null;
  likes: { count: number }[] | null;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ exhibitionId: string }> }
) {
  try {
    const supabase = await createClient();
    const { exhibitionId } = await params;

    const { data: rawData, error } = await supabase
      .from('exhibitions')
      .select(
        `
        id,
        title,
        thumbnail_url,
        start_date,
        end_date,
        theme,
        profile:profiles!teacher_id ( institution ),
        likes:exhibition_likes ( count )
      `
      )
      .eq('id', exhibitionId)
      .single();

    if (error) {
      console.error('전시회 상세 조회 에러:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ message: 'not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'database error' }, { status: 500 });
    }

    const data = rawData as unknown as ExhibitionDetailRow;
    const profile = Array.isArray(data.profile)
      ? data.profile[0]
      : data.profile;
    const result = {
      id: data.id,
      title: data.title,
      thumbnailUrl: data.thumbnail_url,
      startDate: data.start_date,
      endDate: data.end_date,
      theme: data.theme ?? 'default',
      host: profile?.institution ?? null,
      likes: data.likes?.[0]?.count ?? 0,
    };

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'unknown error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ exhibitionId: string }> }
) {
  try {
    const supabase = await createClient();
    const { exhibitionId } = await params;

    const roleCheck = await checkRole(supabase);
    if (!roleCheck.ok) {
      return NextResponse.json(
        { message: roleCheck.message },
        { status: roleCheck.status }
      );
    }
    const exhibitionOwnerCheck = await checkExhibitionOwner(
      supabase,
      exhibitionId,
      roleCheck.user.id,
      'exhibition'
    );
    if (!exhibitionOwnerCheck.ok) {
      return NextResponse.json(
        { message: exhibitionOwnerCheck.message },
        { status: exhibitionOwnerCheck.status }
      );
    }

    const body = await req.json();
    const patch: Record<string, unknown> = {};
    if ('end_date' in body) patch.end_date = body.end_date;

    const { error } = await supabase
      .from('exhibitions')
      .update(patch)
      .eq('id', exhibitionId);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { message: 'failed to update exhibition' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'success', updatedId: exhibitionId },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'unkwon error' }, { status: 500 });
  }
}
