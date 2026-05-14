import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { reviewCreateSchema } from '@/lib/schemas/review';
import { fetchExhibitionReviews } from '@/lib/exhibition/queries';

type RouteContext = { params: Promise<{ exhibitionId: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { exhibitionId: id } = await params;
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);

    const { data, pagination } = await fetchExhibitionReviews(id, { page });

    const reviews = data.map((review) => ({
      id: review.id,
      author: review.author,
      userId: review.userId,
      createdAt: review.createdAt.slice(0, 10),
      content: review.content,
    }));

    const totalPages = Math.max(
      1,
      Math.ceil(pagination.totalCount / pagination.limit)
    );

    return NextResponse.json(
      {
        reviews,
        pagination: {
          totalCount: pagination.totalCount,
          totalPages,
          page: pagination.page,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: 'unknown error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { exhibitionId: id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: 'no session' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: '유효한 JSON 형식이 아닙니다' },
        { status: 400 }
      );
    }
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
      .select('id, content, created_at, user_id, profiles:user_id(username)')
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json(
        { message: 'database insertion error' },
        { status: 500 }
      );
    }

    const profiles = data.profiles as { username?: string } | null;
    const review = {
      id: data.id,
      author: profiles?.username ?? '사용자',
      userId: data.user_id,
      createdAt: data.created_at.slice(0, 10),
      content: data.content,
    };

    return NextResponse.json(
      { message: 'successfully inserted', review },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: 'unknown error' }, { status: 500 });
  }
}
