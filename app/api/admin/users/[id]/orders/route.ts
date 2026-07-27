import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fallbackStore } from '@/lib/fallback-store';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const userId = params.id;

  try {
    let orders = await prisma.order.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });

    if (orders.length === 0) {
      const linkedUser = await prisma.user.findFirst({ where: { authUserId: userId } });
      if (linkedUser) {
        orders = await prisma.order.findMany({ where: { userId: linkedUser.id }, orderBy: { createdAt: 'desc' } });
      }
    }

    return NextResponse.json({ orders: orders.map((o) => ({ id: o.id, status: o.status, total: Number(o.total), createdAt: o.createdAt.toISOString(), itemsCount: o.items.length })) });
  } catch {
    const orders = fallbackStore.getOrders().filter((o) => o.userId === userId);
    return NextResponse.json({ orders });
  }
}
