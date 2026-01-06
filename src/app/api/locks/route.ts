'use server';

import { NextRequest, NextResponse } from 'next/server';
import {
  getLocks,
  getLockByJobId,
  acquireLock,
  releaseLock,
  refreshLock,
} from '@/lib/store';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const jobId = searchParams.get('jobId');

  if (jobId) {
    const lock = getLockByJobId(jobId);
    return NextResponse.json({ success: true, data: lock || null });
  }

  const locks = getLocks();
  return NextResponse.json({ success: true, data: locks });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, jobId, editorId, editorName } = body;

    if (!action || !jobId || !editorId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'acquire': {
        if (!editorName) {
          return NextResponse.json(
            { success: false, error: 'Editor name required for acquiring lock' },
            { status: 400 }
          );
        }
        const lock = acquireLock(jobId, editorId, editorName);
        if (!lock) {
          return NextResponse.json(
            { success: false, error: 'Task is already locked by another editor' },
            { status: 409 }
          );
        }
        return NextResponse.json({ success: true, data: lock });
      }

      case 'release': {
        const released = releaseLock(jobId, editorId);
        if (!released) {
          return NextResponse.json(
            { success: false, error: 'Could not release lock' },
            { status: 400 }
          );
        }
        return NextResponse.json({ success: true, data: { released: true } });
      }

      case 'refresh': {
        const refreshedLock = refreshLock(jobId, editorId);
        if (!refreshedLock) {
          return NextResponse.json(
            { success: false, error: 'Could not refresh lock' },
            { status: 400 }
          );
        }
        return NextResponse.json({ success: true, data: refreshedLock });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process lock request' },
      { status: 500 }
    );
  }
}
