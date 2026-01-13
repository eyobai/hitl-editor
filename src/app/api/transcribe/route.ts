import { NextRequest, NextResponse } from 'next/server';
import { createJob, updateJob, getJobById } from '@/lib/store';
import { createKiavaApi } from '@/lib/kiava-api';

// POST /api/transcribe - Submit a new transcription job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audioUrl, userId, requestHumanReview, apiKey } = body;

    if (!audioUrl || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: audioUrl and userId' },
        { status: 400 }
      );
    }

    // Get API key from request or environment
    const kiavaApiKey = apiKey || process.env.KIAVA_API_KEY;
    
    if (!kiavaApiKey) {
      return NextResponse.json(
        { success: false, error: 'KI-AVA API key not configured' },
        { status: 500 }
      );
    }

    const kiavaApi = createKiavaApi(kiavaApiKey);

    // Create local job record first
    const audioFileName = audioUrl.split('/').pop() || 'audio.mp3';
    const localJob = createJob(userId, audioUrl, audioFileName, requestHumanReview || false);

    try {
      // Submit to KI-AVA API
      const kiavaResponse = await kiavaApi.submitTranscriptionJob([audioUrl], 'am');

      // Update local job with external job ID
      updateJob(localJob.id, {
        externalJobId: kiavaResponse.job_id,
        status: 'processing',
      });

      return NextResponse.json({
        success: true,
        data: {
          jobId: localJob.id,
          externalJobId: kiavaResponse.job_id,
          status: 'processing',
          message: kiavaResponse.message,
        },
      });
    } catch (kiavaError) {
      // If KI-AVA submission fails, mark local job as failed
      updateJob(localJob.id, { status: 'failed' });
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to submit to KI-AVA: ${kiavaError instanceof Error ? kiavaError.message : 'Unknown error'}` 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Transcription submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process transcription request' },
      { status: 500 }
    );
  }
}
