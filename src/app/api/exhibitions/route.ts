import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  checkRole,
  parseFormDataToObj,
  uploadImgToSupabase,
  validateExhibition,
} from '@/components/galleryExhibition/threejs/test/util/util';

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
      thumbnailUrl = await uploadImgToSupabase(
        supabase,
        thumbnailImg,
        'thumbnails'
      );
    }
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
    console.log(e);
    return NextResponse.json({ message: 'unkwon Error' }, { status: 500 });
  }
}
