import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkExhibitionOwner, checkRole } from '@/lib/gallery/checkRole';
import { getUserIdByEmail } from '@/lib/gallery/user';
import {
  ImageUploadValidationError,
  uploadImgToSupabase,
} from '@/lib/supabase/uploadImage';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ exhibitionId: string }> }
) {
  try {
    const supabase = await createClient();
    const { exhibitionId } = await params;
    // const exhibitionId = '2bf615f0-bb24-448e-9c26-5c90c6c56394';

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

    //작품 삽입
    const body = await req.formData();
    const email = body.get('artist_email');
    let artist_id;
    if (email && typeof email === 'string') {
      const profile = await getUserIdByEmail(supabase, email);

      if (!profile.ok) {
        return NextResponse.json(
          { message: profile.message },
          { status: profile.status }
        );
      }
      artist_id = profile.userId;
    }

    const title = body.get('title');
    const artist_name = body.get('artist_name');
    const description = body.get('description');
    const imageUrlRaw = body.get('image_url');

    let imageUrl;
    if (imageUrlRaw instanceof File) {
      imageUrl = await uploadImgToSupabase(supabase, imageUrlRaw, 'artworks');
    }

    const { data, error } = await supabase
      .from('artworks')
      .insert({
        title,
        artist_id,
        artist_name,
        description,
        exhibition_id: exhibitionId,
        image_url: imageUrl,
      })
      .select('id');
    console.log(error);

    if (error) {
      console.log(error);
      return NextResponse.json(
        { message: 'database insertion error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'success', createdId: data?.[0]?.id },
      { status: 200 }
    );
  } catch (e) {
    // 이미지 검증 오류일 경우 400에러 반환
    if (e instanceof ImageUploadValidationError) {
      return NextResponse.json({ message: e.message }, { status: 400 });
    }

    console.log(e);
    return NextResponse.json({ message: 'unkwon Error' }, { status: 500 });
  }
}
export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ exhibitionId: string }>;
  }
) {
  try {
    const supabase = await createClient();
    const { exhibitionId } = await params;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ message: 'no session' }, { status: 401 });

    const { data: artworksRaw, error: artworksError } = await supabase
      .from('artworks')
      .select('id,title,artist_name,description,image_url')
      .eq('exhibition_id', exhibitionId);

    if (artworksError) {
      return NextResponse.json(
        { message: 'cant find artwroks by exhhibitionId' },
        { status: 400 }
      );
    }
    const artworksIds = artworksRaw?.map((x) => x.id) || [];

    const { data: likes, error: likesError } = await supabase
      .from('artwork_likes')
      .select('*')
      .in('artwork_id', artworksIds);
    if (likesError) {
      return NextResponse.json({ message: 'likes error' }, { status: 400 });
    }
    const artworks = artworksRaw.map((x) => {
      const artworkLikes = likes.filter((xx) => xx.artwork_id === x.id);

      return {
        ...x,
        likes: artworkLikes.length,
        likesByMe: artworkLikes.some((xx) => xx.user_id === user.id),
      };
    });
    return NextResponse.json({ message: 'success', artworks }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: 'unkwon Error' }, { status: 500 });
  }
}
