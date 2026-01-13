import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    // Security: only allow mp3 and wav files
    if (!filename.match(/\.(mp3|wav|ogg|m4a)$/i)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const filePath = join(process.cwd(), 'public', filename);
    const fileBuffer = await readFile(filePath);
    
    const contentType = filename.endsWith('.mp3') 
      ? 'audio/mpeg' 
      : filename.endsWith('.wav')
      ? 'audio/wav'
      : filename.endsWith('.ogg')
      ? 'audio/ogg'
      : 'audio/mp4';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Audio file error:', error);
    return NextResponse.json({ error: 'Audio file not found' }, { status: 404 });
  }
}
