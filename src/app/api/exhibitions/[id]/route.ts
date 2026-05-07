import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: exhibitionId } = await params;

    const { data, error } = await supabase
      .from('exhibitions')
      .select(
        `
        id,
        title,
        thumbnail_url,
        start_date,
        end_date,
        teacher_id,
        profiles!teacher_id ( username ),
        exhibition_likes ( count )
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

    const profile = data.profiles as unknown as { username: string } | null;
    const likesData = data.exhibition_likes as { count: number }[] | null;
    const result = {
      id: data.id,
      title: data.title,
      thumbnailUrl: data.thumbnail_url,
      startDate: data.start_date,
      endDate: data.end_date,
      host: profile?.username ?? null,
      hostId: data.teacher_id,
      likes: likesData?.[0]?.count ?? 0,
    };

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'unknown error' }, { status: 500 });
  }
}
