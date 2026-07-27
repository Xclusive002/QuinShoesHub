export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { ProductStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

function parseJsonStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string' && item.length > 0) : [];
    } catch {
      return [];
    }
  }

  return [];
}

function toProductShape(product: any) {
  const images = parseJsonStringArray(product.images);

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    category: product.category?.slug ?? product.categoryId ?? 'uncategorized',
    sizes: parseJsonStringArray(product.sizes),
    colors: parseJsonStringArray(product.colors),
    image: images[0] ?? '/images/logo.png',
    images: images.length ? images : ['/images/logo.png'],
    stock: product.stock ?? 0,
    rating: Number(product.rating ?? 0),
  };
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const product = await prisma.product.findFirst({
      where: {
        id: params.id,
        status: { in: [ProductStatus.PUBLISHED, ProductStatus.OUT_OF_STOCK] },
      },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: toProductShape(product) });
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
}
