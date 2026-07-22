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
