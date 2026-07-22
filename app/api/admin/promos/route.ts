import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fallbackStore } from '@/lib/fallback-store';

export async function GET() {
  try {
    const promos = await prisma.promo.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      promos: promos.map((promo) => ({
        id: promo.id,
        code: promo.code,
        type: promo.type,
        value: Number(promo.value),
        status: promo.status,
        expiryDate: promo.expiryDate?.toISOString() ?? null,
      })),
    });
  } catch {
    return NextResponse.json({ promos: fallbackStore.getPromos() });
  }
}
