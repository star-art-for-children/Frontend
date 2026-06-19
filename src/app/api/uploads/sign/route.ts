import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import { checkRole } from '@/lib/gallery/checkRole';
import { extForType } from '@/lib/supabase/imageConstraints';

const ALLOWED_BUCKETS = new Set(['artworks', 'thumbnails']);

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 업로드는 teacher만 — 기존 Route Handler 업로드 게이팅과 동일
    const roleCheck = await checkRole(supabase);
    if (!roleCheck.ok) {
      return NextResponse.json(
        { message: roleCheck.message },
        { status: roleCheck.status }
      );
    }

    const { bucket, contentType } = await req.json();
    if (!ALLOWED_BUCKETS.has(bucket)) {
      return NextResponse.json({ message: 'invalid bucket' }, { status: 400 });
    }
    const ext = extForType(contentType);
    if (!ext) {
      return NextResponse.json(
        { message: '이미지 파일만 업로드할 수 있어요.' },
        { status: 400 }
      );
    }

    const path = `${randomUUID()}.${ext}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path);
    if (error || !data) {
      return NextResponse.json({ message: 'sign failed' }, { status: 500 });
    }

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json(
      { path: data.path, token: data.token, publicUrl: pub.publicUrl },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: 'unknown error' }, { status: 500 });
  }
}
