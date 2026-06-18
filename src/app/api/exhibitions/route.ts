import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';

import {
  ExhibitionsAuthRequiredError,
  fetchExhibitions,
} from '@/lib/exhibition/server';
import { checkRole } from '@/lib/gallery/checkRole';
import { parseFormDataToObj } from '@/lib/gallery/parseForm';
import { validateExhibition } from '@/lib/gallery/validateExhibitionForm';
import { generatePresetFromImageUrl } from '@/lib/gallery/server';
import { defaultPreset } from '@/lib/gallery/presets';
import {
  withCreditSpend,
  CREDIT_COSTS,
  InsufficientCreditError,
} from '@/lib/payments/credit';

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get('search') || '';
    const sort = req.nextUrl.searchParams.get('sort') || 'latest';
    const rawPage = parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    let userId: string | undefined;

    // '내가 운영중인' 필터 선택시 인증 및 권한 검증 진행
    if (sort === 'mine') {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ message: 'no session' }, { status: 401 });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role !== 'teacher') {
        return NextResponse.json({ message: 'forbidden' }, { status: 403 });
      }

      userId = user.id;
    }

    const { data, pagination } = await fetchExhibitions({
      page,
      sort,
      search,
      userId,
    });

    return NextResponse.json({ data, pagination }, { status: 200 });
  } catch (err) {
    console.error(err);
    // sort = mine 미로그인시 에러
    if (err instanceof ExhibitionsAuthRequiredError) {
      return NextResponse.json({ message: 'no session' }, { status: 401 });
    }
    return NextResponse.json({ message: 'unknown error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const roleCheck = await checkRole(supabase);
    if (!roleCheck.ok) {
      return NextResponse.json(
        { message: roleCheck.message },
        { status: roleCheck.status }
      );
    }

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
      gallery_preset: userPreset,
    } = result.data;

    const thumbnailUrl =
      typeof thumbnailImg === 'string' && thumbnailImg ? thumbnailImg : null;
    let gallery_preset = null;

    if (thumbnailUrl) {
      if (userPreset) {
        gallery_preset = userPreset;
      } else {
        gallery_preset = await withCreditSpend({
          userId: roleCheck.user.id,
          cost: CREDIT_COSTS.theme,
          ref: randomUUID(),
          run: () => generatePresetFromImageUrl(thumbnailUrl),
        }).catch((e) => {
          // 잔액 부족은 402로 올려보내고, AI 생성 실패만 기본 테마로 폴백한다.
          if (e instanceof InsufficientCreditError) throw e;
          console.log(e);
          return defaultPreset;
        });
      }
    } else {
      gallery_preset = userPreset ?? defaultPreset;
    }

    console.log(gallery_preset);
    const { data, error } = await supabase
      .from('exhibitions')
      .insert({
        teacher_id: roleCheck.user.id,
        title,
        description,
        guidelines,
        thumbnail_url: thumbnailUrl,
        start_date,
        end_date,
        gallery_preset,
      })
      .select('id');

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
    // 크레딧 부족: 402 + 잔액/단가 반환 (클라이언트 충전 안내용)
    if (e instanceof InsufficientCreditError) {
      return NextResponse.json(
        { message: '크레딧이 부족합니다.', balance: e.balance, cost: e.cost },
        { status: 402 }
      );
    }

    console.log(e);
    return NextResponse.json({ message: 'unkwon Error' }, { status: 500 });
  }
}
