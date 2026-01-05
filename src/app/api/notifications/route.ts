import { NextRequest, NextResponse } from 'next/server';
import { getNotificationsByUserId, markNotificationAsRead } from '@/lib/store';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'userId is required' },
      { status: 400 }
    );
  }

  const notifications = getNotificationsByUserId(userId);
  return NextResponse.json({ success: true, data: notifications });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'notificationId is required' },
        { status: 400 }
      );
    }

    const success = markNotificationAsRead(notificationId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}
