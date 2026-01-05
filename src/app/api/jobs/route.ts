'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getJobsByUserId, createJob, getJobs } from '@/lib/store';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (userId) {
    const jobs = getJobsByUserId(userId);
    return NextResponse.json({ success: true, data: jobs });
  }

  const jobs = getJobs();
  return NextResponse.json({ success: true, data: jobs });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, audioUrl, audioFileName, requestHumanReview } = body;

    if (!userId || !audioUrl || !audioFileName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const job = createJob(userId, audioUrl, audioFileName, requestHumanReview ?? false);
    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create job' },
      { status: 500 }
    );
  }
}
