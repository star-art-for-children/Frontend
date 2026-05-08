import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  parseFormDataToObj,
  validateExhibition,
} from '@/components/galleryExhibition/threejs/test/util/util';
import { ExhibitionListItem, ExhibitionRow } from '@/types/exhibitionList';

// 한국 시간 기준 오늘 날짜 (YYYY-MM-DD)
const todayKST = (): string => {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
};

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const today = todayKST();
    const sort = req.nextUrl.searchParams.get('sort');

    // 검색 파라미터
    const search = req.nextUrl.searchParams.get('search');

    // pagination
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '8', 10);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('exhibitions').select(
      `
      id,
      title,
      thumbnail_url,
      start_date,
      end_date,
      teacher_id,
      created_at,
      profile:profiles!teacher_id ( institution ),
      likes:exhibition_likes ( count )
    `,
      { count: 'exact' }
    );

    // 검색
    if (search) {
      const { data: matchedProfiles } = await supabase
        .from('profiles')
        .select('id')
        .ilike('institution', `%${search}%`);

      const matchedTeacherIds =
        matchedProfiles?.map((profile) => profile.id) || [];

      if (matchedTeacherIds.length > 0) {
        const idsString = `(${matchedTeacherIds.join(',')})`;
        query = query.or(`title.ilike.%${search}%,teacher_id.in.${idsString}`);
      } else {
        query = query.ilike('title', `%${search}%`);
      }
    }

    // 필터링
    switch (sort) {
      case 'oldest':
        query = query
          .lte('start_date', today)
          .or(`end_date.gte.${today},end_date.is.null`)
          .order('start_date', { ascending: true });
        break;
      case 'popular':
        query = query
          .lte('start_date', today)
          .or(`end_date.gte.${today},end_date.is.null`)
          .order('start_date', { ascending: false });
        break;
      case 'upcoming':
        query = query
          .gt('start_date', today)
          .order('start_date', { ascending: true });
        break;
      case 'ended':
        query = query
          .lt('end_date', today)
          .order('end_date', { ascending: false });
        break;
      case 'mine': {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          return NextResponse.json({ message: 'no session' }, { status: 401 });
        }
        query = query
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false });
        break;
      }

      case 'latest':
      default:
        query = query
          .lte('start_date', today)
          .or(`end_date.gte.${today},end_date.is.null`)
          .order('start_date', { ascending: false });
    }

    if (sort !== 'popular') {
      query = query.range(from, to);
    }

    const { data, error, count } = await query.returns<ExhibitionRow[]>();

    if (error) {
      console.log(error);
      return NextResponse.json({ message: 'database error' }, { status: 500 });
    }

    let result: ExhibitionListItem[] = (data ?? []).map((row) => {
      const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile;

      return {
        id: row.id,
        title: row.title,
        host: profile?.institution ?? '',
        image: row.thumbnail_url,
        startDate: row.start_date,
        endDate: row.end_date,
        likes: row.likes?.[0]?.count ?? 0,
      };
    });

    // 인기순 재정렬
    if (sort === 'popular') {
      result = result.sort((a, b) => b.likes - a.likes);
    }

    const totalCount = count || 0;
    const hasNextPage = from + limit < totalCount;

    return NextResponse.json(
      { data: result, pagination: { page, limit, totalCount, hasNextPage } },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'unknown error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: 'no session' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { message: 'profile not found' },
        { status: 403 }
      );
    }

    if (profile.role !== 'teacher') {
      return NextResponse.json({ message: 'not allowed' }, { status: 403 });
    }

    let data, error;

    let thumbnailUrl: null | string = null;

    const body = await req.formData();
    const parsedFormData = parseFormDataToObj(body);
    const result = validateExhibition(parsedFormData);

    if ('error' in result) {
      return NextResponse.json({ message: result.error }, { status: 400 });
    }

    const {
      title,
      description,
      thumbnailImg,
      start_date,
      end_date,
      guidelines,
    } = result.data;

    if (thumbnailImg instanceof File) {
      const randomId = crypto.randomUUID();
      const ext = thumbnailImg.name.split('.').pop();
      const url = `${randomId}.${ext}`;
      ({ error } = await supabase.storage
        .from('thumbnails')
        .upload(`${url}`, thumbnailImg));

      if (error) {
        console.log(error);
        return NextResponse.json(
          { message: 'img convert Error' },
          { status: 500 }
        );
      }

      ({ data } = supabase.storage.from('thumbnails').getPublicUrl(`${url}`));
      thumbnailUrl = data.publicUrl;
    }
    ({ data, error } = await supabase
      .from('exhibitions')
      .insert({
        teacher_id: user.id,
        title,
        description,
        guidelines,
        thumbnail_url: thumbnailUrl,
        start_date,
        end_date,
      })
      .select('id'));

    if (error) {
      console.log(error);
      return NextResponse.json(
        { message: 'database insertion error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'successfully inserted', createdId: data?.[0]?.id },
      { status: 200 }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: 'unkwon Error' }, { status: 500 });
  }
}
