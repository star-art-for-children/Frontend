import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkExhibitionOwner, checkRole } from '@/lib/gallery/checkRole';
import { EditExhibitionSchema } from '@/lib/schemas/exhibition';
import { getStatus, todayKST } from '@/lib/exhibition/dateStatus';

import { GalleryPreset } from '@/types/gallery-theme';

type ExhibitionDetailRow = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  start_date: string;
  end_date: string | null;
  gallery_preset: GalleryPreset | null;
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
        gallery_preset,
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
      host: profile?.institution ?? null,
      likes: data.likes?.[0]?.count ?? 0,
      galleryPreset: data.gallery_preset ?? null,
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

    // 제약 재검증을 위해 현재 일정/종료 상태 조회
    const { data: current, error: fetchError } = await supabase
      .from('exhibitions')
      .select('start_date, end_date, ended_at')
      .eq('id', exhibitionId)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ message: 'not found' }, { status: 404 });
    }

    const status = getStatus(
      current.start_date,
      current.end_date,
      current.ended_at
    );

    // (b) 즉시 종료 — 진행중 전시만 가능. 서버 시각으로 ended_at 설정.
    if (body.endNow === true) {
      if (todayKST() === current.start_date) {
        return NextResponse.json(
          { message: 'cannot end exhibition on its start date' },
          { status: 400 }
        );
      }
      if (status !== 'ongoing') {
        return NextResponse.json(
          { message: 'only ongoing exhibition can be ended' },
          { status: 400 }
        );
      }
      const { error } = await supabase
        .from('exhibitions')
        .update({ ended_at: new Date().toISOString() })
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
    }

    // (a) 모달 저장 — 정보 수정
    const parsed = EditExhibitionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: 'invalid input' }, { status: 400 });
    }
    const { title, description, startDateRaw, endDateRaw } = parsed.data;

    // 상태별 날짜 제약 재검증
    if (status === 'ended') {
      return NextResponse.json(
        { message: 'ended exhibition cannot be edited' },
        { status: 400 }
      );
    }
    if (status === 'ongoing') {
      if (startDateRaw !== current.start_date) {
        return NextResponse.json(
          { message: 'cannot change start date of ongoing exhibition' },
          { status: 400 }
        );
      }
      if (endDateRaw && endDateRaw < todayKST()) {
        return NextResponse.json(
          { message: 'end date must be today or later' },
          { status: 400 }
        );
      }
    }

    const { error } = await supabase
      .from('exhibitions')
      .update({
        title,
        description,
        start_date: startDateRaw,
        end_date: endDateRaw ?? null,
      })
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
    return NextResponse.json({ message: 'unknown error' }, { status: 500 });
  }
}
