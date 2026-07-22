export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { ProductStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { fallbackStore } from '@/lib/fallback-store';

function toProductShape(product: any) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    category: product.category?.slug ?? product.categoryId ?? 'uncategorized',
    sizes: product.sizes ?? [],
    colors: product.colors ?? [],
    image: product.images?.[0] ?? '/images/logo.png',
    images: product.images?.length ? product.images : ['/images/logo.png'],
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
      const fallbackProduct = fallbackStore.getProductById(params.id);
      if (!fallbackProduct) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json({
        product: {
          ...fallbackProduct,
          category: fallbackProduct.category?.slug ?? fallbackProduct.categoryId ?? 'uncategorized',
          image: fallbackProduct.images?.[0] ?? '/images/logo.png',
          images: fallbackProduct.images?.length ? fallbackProduct.images : ['/images/logo.png'],
        },
      });
    }

    return NextResponse.json({ product: toProductShape(product) });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to load product' }, { status: 500 });
  }
}
