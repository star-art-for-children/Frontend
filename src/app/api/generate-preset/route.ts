import { NextRequest, NextResponse } from 'next/server';
import { generatePresetFromImageFile } from '@/lib/gallery/server';
import { defaultPreset } from '@/lib/gallery/presets';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json({ message: 'image required' }, { status: 400 });
    }

    const preset = await generatePresetFromImageFile(imageFile);
    return NextResponse.json({ preset }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ preset: defaultPreset }, { status: 200 });
  }
}
