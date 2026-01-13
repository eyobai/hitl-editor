import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { youtubeUrl } = body;

    if (!youtubeUrl) {
      return NextResponse.json(
        { success: false, error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    // Validate YouTube URL
    if (!ytdl.validateURL(youtubeUrl)) {
      return NextResponse.json(
        { success: false, error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Get video info
    const info = await ytdl.getInfo(youtubeUrl);
    const videoTitle = info.videoDetails.title
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);

    // Generate unique filename
    const filename = `${videoTitle}_${uuidv4().substring(0, 8)}.mp3`;
    const publicDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(publicDir, filename);

    // Ensure uploads directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Download audio only
    const audioStream = ytdl(youtubeUrl, {
      filter: 'audioonly',
      quality: 'highestaudio',
    });

    // Save to file
    const writeStream = fs.createWriteStream(filePath);
    
    await new Promise<void>((resolve, reject) => {
      audioStream.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      audioStream.on('error', reject);
    });

    // Return the public URL
    const audioUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      data: {
        audioUrl,
        audioFileName: `${videoTitle}.mp3`,
        originalTitle: info.videoDetails.title,
        duration: parseInt(info.videoDetails.lengthSeconds),
      },
    });
  } catch (error: unknown) {
    console.error('YouTube download error:', error);
    
    // Check for specific error types
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('403') || errorMessage.includes('Status code')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'YouTube is blocking the download. This is a known limitation. Please download the audio manually using a tool like yt-dlp or an online converter, then upload the file directly.' 
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to download audio from YouTube: ' + errorMessage },
      { status: 500 }
    );
  }
}
