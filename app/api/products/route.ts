export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { Prisma, ProductStatus } from '@prisma/client';
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

function toCategoryShape(category: any) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    image: category.image ?? null,
    productCount: category._count?.products ?? 0,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim() ?? '';
  const categorySlug = searchParams.get('category')?.trim() ?? '';

  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    });

    const products = await prisma.product.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
              ],
            }
          : {}),
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        status: { in: [ProductStatus.PUBLISHED, ProductStatus.OUT_OF_STOCK] },
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      products: products.map(toProductShape),
      categories: categories.map(toCategoryShape),
    });
  } catch (error) {
    console.error('Public products fetch failed', error);
    const products = fallbackStore.getProducts(search, categorySlug).map(toProductShape);
    const categories = fallbackStore.getCategories().map(toCategoryShape);
    return NextResponse.json({ products, categories });
  }
}
