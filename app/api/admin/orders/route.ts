import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fallbackStore } from '@/lib/fallback-store';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        status: order.status,
        total: Number(order.total),
        paymentStatus: order.paymentStatus,
        shippingName: order.shippingName,
        shippingEmail: order.shippingEmail,
        createdAt: order.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ orders: fallbackStore.getOrders() });
  }
}
