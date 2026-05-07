// 전시회 리뷰 목록 조회, 생성
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { reviewCreateSchema } from '@/lib/schemas/review';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('reviews')
      .select('id, content, created_at, updated_at, user_id, profiles:user_id(username)')
      .eq('exhibition_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { message: 'failed to fetch reviews' },
        { status: 500 }
      );
    }

    const reviews = (data ?? []).map((row) => {
      const profiles = row.profiles as { username?: string } | null;
      return {
        id: row.id,
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user_id: row.user_id,
        author: profiles?.username ?? '사용자',
      };
    });

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: 'unknown error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: 'no session' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = reviewCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { content } = parsed.data;

    const { data, error } = await supabase
      .from('reviews')
      .insert({ exhibition_id: id, user_id: user.id, content })
      .select('id')
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json(
        { message: 'database insertion error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'successfully inserted', createdId: data.id },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: 'unknown error' }, { status: 500 });
  }
}
