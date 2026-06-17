import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { fal } from '@fal-ai/client';
import { createClient } from '@/lib/supabase/server';
import { checkExhibitionOwner, checkRole } from '@/lib/gallery/checkRole';
import {
  withCreditSpend,
  InsufficientCreditError,
  CREDIT_COSTS,
} from '@/lib/payments/credit';

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
      return NextResponse.json(
        { message: 'artwork not found' },
        { status: 404 }
      );
    }

    if (artwork.video_url) {
      return NextResponse.json(
        { videoUrl: artwork.video_url },
        { status: 200 }
      );
    }

    let videoUrl: string;
    try {
      videoUrl = await withCreditSpend({
        userId: roleCheck.user.id,
        cost: CREDIT_COSTS.animate,
        ref: randomUUID(),
        run: async () => {
          const result = await fal.subscribe(
            'fal-ai/wan-25-preview/image-to-video',
            {
              input: {
                image_url: artwork.image_url,
                prompt:
                  "A children's hand-drawn illustration comes to life with soft, looping animation. The main subject gently moves: characters walk in place or sway, animals breathe and blink, plants and trees rustle slowly, water ripples calmly. Background elements move subtly at a slower pace than foreground. Strictly preserve the original flat 2D illustration style, crayon and paint textures, and color palette. Characters maintain their original shape and proportions throughout. No photorealism. No camera movement. Smooth, cute, cheerful motion.",
                negative_prompt:
                  'photorealistic, 3D render, morphing, warping, distortion, flickering, camera pan, camera zoom, blurry, deformed characters, style change',
                resolution: '480p',
              },
            }
          );

          const url = (result.data as { video?: { url?: string } })?.video?.url;
          if (!url) {
            throw new Error('video generation failed');
          }

          return url;
        },
      });
    } catch (err) {
      if (err instanceof InsufficientCreditError) {
        return NextResponse.json(
          {
            message: '크레딧이 부족합니다.',
            balance: err.balance,
            cost: err.cost,
          },
          { status: 402 }
        );
      }
      throw err;
    }

    const { error: updateError } = await supabase
      .from('artworks')
      .update({ video_url: videoUrl })
      .eq('id', artworkId);

    if (updateError) {
      console.error('CRITICAL: video generated but video_url persist failed', {
        artworkId,
        videoUrl,
        updateError,
      });
    }

    return NextResponse.json({ videoUrl }, { status: 200 });
  } catch (err: unknown) {
    console.error('animate error:', JSON.stringify(err, null, 2));
    const detail = (err as { body?: { detail?: { type?: string }[] } })?.body
      ?.detail?.[0];
    if (detail?.type === 'image_dimension_error') {
      return NextResponse.json(
        {
          message: '이미지 해상도가 너무 낮아 애니메이션을 생성할 수 없습니다.',
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: 'unknown error' }, { status: 500 });
  }
}
