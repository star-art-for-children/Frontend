import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import { createClient } from '@/lib/supabase/server';
import { checkExhibitionOwner, checkRole } from '@/lib/gallery/checkRole';

export const maxDuration = 180;

fal.config({ credentials: process.env.FALAI_API_KEY });

export async function POST(
  _req: NextRequest,
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

    const ownerCheck = await checkExhibitionOwner(
      supabase,
      artworkId,
      roleCheck.user.id,
      'artwork'
    );
    if (!ownerCheck.ok) {
      return NextResponse.json(
        { message: ownerCheck.message },
        { status: ownerCheck.status }
      );
    }

    const { data: artwork, error: artworkError } = await supabase
      .from('artworks')
      .select('image_url, video_url')
      .eq('id', artworkId)
      .single();

    if (artworkError || !artwork) {
      return NextResponse.json({ message: 'artwork not found' }, { status: 404 });
    }

    if (artwork.video_url) {
      return NextResponse.json({ videoUrl: artwork.video_url }, { status: 200 });
    }

    const result = await fal.subscribe('fal-ai/wan-25-preview/image-to-video', {
      input: {
        image_url: artwork.image_url,
        prompt:
          "A children's hand-drawn illustration comes to life with soft, looping animation. The main subject gently moves: characters walk in place or sway, animals breathe and blink, plants and trees rustle slowly, water ripples calmly. Background elements move subtly at a slower pace than foreground. Strictly preserve the original flat 2D illustration style, crayon and paint textures, and color palette. Characters maintain their original shape and proportions throughout. No photorealism. No camera movement. Smooth, cute, cheerful motion.",
        negative_prompt:
          "photorealistic, 3D render, morphing, warping, distortion, flickering, camera pan, camera zoom, blurry, deformed characters, style change",
        resolution: '480p',
      },
    });

    const videoUrl = (result.data as { video?: { url?: string } })?.video?.url;
    if (!videoUrl) {
      return NextResponse.json({ message: 'video generation failed' }, { status: 500 });
    }

    const { error: updateError } = await supabase
      .from('artworks')
      .update({ video_url: videoUrl })
      .eq('id', artworkId);

    if (updateError) {
      console.error('video_url update error:', updateError);
      return NextResponse.json({ message: 'database update error' }, { status: 500 });
    }

    return NextResponse.json({ videoUrl }, { status: 200 });
  } catch (err: unknown) {
    console.error('animate error:', JSON.stringify(err, null, 2));
    const detail = (err as { body?: { detail?: { type?: string }[] } })?.body?.detail?.[0];
    if (detail?.type === 'image_dimension_error') {
      return NextResponse.json(
        { message: '이미지 해상도가 너무 낮아 애니메이션을 생성할 수 없습니다.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: 'unknown error' }, { status: 500 });
  }
}
