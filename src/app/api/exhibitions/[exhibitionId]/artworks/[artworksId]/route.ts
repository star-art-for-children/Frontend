import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  checkExhibitionOwner,
  checkRole,
  uploadImgToSupabase,
} from '@/components/galleryExhibition/threejs/test/util/util';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ artworksId: string }> }
) {
  try {
    const supabase = await createClient();
    const { artworksId: artworkId } = await params;

    const roleCheck = await checkRole(supabase);
    if (!roleCheck.ok) {
      return NextResponse.json(
        { message: roleCheck.message },
        { status: roleCheck.status }
      );
    }

    const exhibitionOwnerCheck = await checkExhibitionOwner(
      supabase,
      artworkId,
      roleCheck.user.id,
      'artwork'
    );
    if (!exhibitionOwnerCheck.ok) {
      return NextResponse.json(
        { message: exhibitionOwnerCheck.message },
        { status: exhibitionOwnerCheck.status }
      );
    }

    const body = await req.formData();
    const email = body.get('artist_email');
    console.log(email);
    const { data: artistProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    if (profileError || !artistProfile) {
      return NextResponse.json(
        { message: 'profile not found' },
        { status: 403 }
      );
    }

    const artist_id = artistProfile.id;
    const title = body.get('title');
    const artist_name = body.get('artist_name');
    const description = body.get('description');
    const imageUrlRaw = body.get('image_url');

    let imageUrl = imageUrlRaw;
    if (imageUrlRaw instanceof File) {
      imageUrl = await uploadImgToSupabase(supabase, imageUrlRaw, 'artworks');
    }

    const { data, error } = await supabase
      .from('artworks')
      .update({
        artist_id,
        title,
        artist_name,
        description,
        image_url: imageUrl,
      })
      .eq('id', artworkId)
      .select('id');

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
    // console.log(artworkId,body)
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: 'unkwon Error' }, { status: 500 });
  }
}
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ artworksId: string }> }
) {
  try {
    const supabase = await createClient();
    const { artworksId: artworkId } = await params;

    const roleCheck = await checkRole(supabase);
    if (!roleCheck.ok) {
      return NextResponse.json(
        { message: roleCheck.message },
        { status: roleCheck.status }
      );
    }
    const exhibitionOwnerCheck = await checkExhibitionOwner(
      supabase,
      artworkId,
      roleCheck.user.id,
      'artwork'
    );
    if (!exhibitionOwnerCheck.ok) {
      return NextResponse.json(
        { message: exhibitionOwnerCheck.message },
        { status: exhibitionOwnerCheck.status }
      );
    }

    const { data, error } = await supabase
      .from('artworks')
      .delete()
      .eq('id', artworkId)
      .select('id');

    if (error) {
      console.log(error);
      return NextResponse.json({ message: 'delete error' }, { status: 500 });
    }
    return NextResponse.json(
      { message: 'success', deletedId: data?.[0]?.id },
      { status: 200 }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: 'unkwon Error' }, { status: 500 });
  }
}
