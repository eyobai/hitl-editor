import { NextRequest, NextResponse } from 'next/server';
import { verifyJob, getJobById } from '@/lib/store';
import { Transcript } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, editorId, editedTranscript } = body;

    if (!jobId || !editorId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: jobId and editorId' },
        { status: 400 }
      );
    }

    const job = getJobById(jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'in_review' && job.status !== 'pending_review') {
      return NextResponse.json(
        { success: false, error: 'Job is not in a reviewable state' },
        { status: 400 }
      );
    }

    // Build the edited transcript if segments were modified
    let finalTranscript: Transcript | undefined;
    if (editedTranscript && job.transcript) {
      finalTranscript = {
        ...job.transcript,
        segments: editedTranscript.segments || job.transcript.segments,
        text: editedTranscript.segments
          ? editedTranscript.segments.map((s: { text: string }) => s.text).join(' ')
          : job.transcript.text,
      };
    }

    const verifiedJob = verifyJob(jobId, editorId, finalTranscript);
    
    if (!verifiedJob) {
      return NextResponse.json(
        { success: false, error: 'Failed to verify job' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: verifiedJob });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process verification request' },
      { status: 500 }
    );
  }
}
