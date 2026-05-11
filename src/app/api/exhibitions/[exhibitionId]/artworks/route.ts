import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  checkRole,
  uploadImgToSupabase,
} from '@/components/galleryExhibition/threejs/test/util/util';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ exhibitionId: string }> }
) {
  try {
    const supabase = await createClient();
    const { exhibitionId } = await params;
    // const exhibitionId = '2bf615f0-bb24-448e-9c26-5c90c6c56394';
    const body = await req.formData();

    const roleCheck = await checkRole(supabase);
    if (!roleCheck.ok) {
      return NextResponse.json(
        { message: roleCheck.message },
        { status: roleCheck.status }
      );
    }

    let data, error;
    // 전시회 아이디로 전시회 있는지부터 조회
    ({ data, error } = await supabase
      .from('exhibitions')
      .select('id')
      .eq('id', exhibitionId)
      .single());

    if (error || !data) {
      console.log(error);
      return NextResponse.json(
        { message: 'exhibition not found' },
        { status: 404 }
      );
    }

    //작품 삽입

    const artist_id = body.get('artist_id');
    const title = body.get('title');
    const artist_name = body.get('artist_name');
    const description = body.get('description');
    const imageUrlRaw = body.get('image_url');

    let imageUrl;
    if (imageUrlRaw instanceof File) {
      imageUrl = await uploadImgToSupabase(supabase, imageUrlRaw, 'artworks');
    }

    ({ data, error } = await supabase
      .from('artworks')
      .insert({
        title,
        artist_id,
        artist_name,
        description,
        exhibition_id: exhibitionId,
        image_url: imageUrl,
      })
      .select('id'));
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
      console.log(likesError);
      return NextResponse.json({ message: 'likes error' }, { status: 400 });
    }
    console.log(artworksRaw);
    console.log(likes);
    const artworks = artworksRaw.map((x) => {
      const artworkLikes = likes.filter((xx) => xx.artwork_id === x.id);

      return {
        ...x,
        likes: artworkLikes.length,
        likesByMe: artworkLikes.some((xx) => xx.user_id === user.id),
      };
    });
    console.log(artworks);
    return NextResponse.json({ message: 'success', artworks }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: 'unkwon Error' }, { status: 500 });
  }
}
