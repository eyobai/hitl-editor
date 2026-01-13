import { NextRequest, NextResponse } from 'next/server';
import { getJobById, updateJob } from '@/lib/store';
import { createKiavaApi } from '@/lib/kiava-api';
import { Transcript } from '@/lib/types';

// GET /api/transcribe/[jobId] - Check transcription job status
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    const apiKey = request.headers.get('x-api-key') || process.env.KIAVA_API_KEY;

    // Get local job
    const job = getJobById(jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // If job is already completed or verified, return cached data
    if (job.status === 'completed' || job.status === 'verified' || job.status === 'pending_review') {
      return NextResponse.json({
        success: true,
        data: {
          jobId: job.id,
          status: job.status,
          transcript: job.transcript,
        },
      });
    }

    // If no external job ID, return current status
    if (!job.externalJobId) {
      return NextResponse.json({
        success: true,
        data: {
          jobId: job.id,
          status: job.status,
          transcript: null,
        },
      });
    }

    // Check KI-AVA API for status
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'KI-AVA API key not configured' },
        { status: 500 }
      );
    }

    const kiavaApi = createKiavaApi(apiKey);

    try {
      const kiavaStatus = await kiavaApi.getJobStatus(job.externalJobId);

      if (kiavaStatus.status === 'completed' && kiavaStatus.transcript_urls?.[0]) {
        // Fetch the actual transcript
        const transcriptData = await kiavaApi.fetchTranscript(kiavaStatus.transcript_urls[0]);

        // Convert to our Transcript format
        const transcript: Transcript = {
          job_id: job.id,
          status: 'COMPLETED',
          duration: transcriptData.duration,
          language: transcriptData.language,
          text: transcriptData.text,
          segments: transcriptData.segments.map((seg) => ({
            id: seg.id,
            start_time: seg.start_time,
            end_time: seg.end_time,
            type: seg.type,
            text: seg.text,
          })),
        };

        // Update local job with transcript
        const newStatus = job.requestHumanReview ? 'pending_review' : 'completed';
        updateJob(job.id, {
          status: newStatus,
          transcript,
          completedAt: new Date().toISOString(),
        });

        return NextResponse.json({
          success: true,
          data: {
            jobId: job.id,
            status: newStatus,
            transcript,
          },
        });
      }

      if (kiavaStatus.status === 'failed') {
        updateJob(job.id, { status: 'failed' });
        return NextResponse.json({
          success: true,
          data: {
            jobId: job.id,
            status: 'failed',
            error: kiavaStatus.error,
          },
        });
      }

      // Still processing
      return NextResponse.json({
        success: true,
        data: {
          jobId: job.id,
          status: kiavaStatus.status,
          transcript: null,
        },
      });
    } catch (kiavaError) {
      console.error('KI-AVA status check error:', kiavaError);
      return NextResponse.json({
        success: true,
        data: {
          jobId: job.id,
          status: job.status,
          error: 'Failed to check KI-AVA status',
        },
      });
    }
  } catch (error) {
    console.error('Transcription status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get transcription status' },
      { status: 500 }
    );
  }
}
