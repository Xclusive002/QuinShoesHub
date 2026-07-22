import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fallbackStore } from '@/lib/fallback-store';

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      notifications: notifications.map((notification) => ({
        id: notification.id,
        type: notification.type,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ notifications: fallbackStore.getNotifications() });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = String(body?.message ?? '').trim();
    const type = String(body?.type ?? 'INFO').trim();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        message,
        read: false,
        target: 'public',
      },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to create notification' }, { status: 500 });
  }
}
