import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  parseFormDataToObj,
  validateExhibition,
} from '@/components/galleryExhibition/threejs/test/util/util';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.formData();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: 'no session' }, { status: 401 });
    }

    let data, error;

    let thumbnailUrl: null | string = null;

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
