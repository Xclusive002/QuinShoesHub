import { NextResponse } from 'next/server';
import { Prisma, ProductStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { fallbackStore } from '@/lib/fallback-store';

const fallbackProducts = [
  {
    id: '1',
    name: 'The Essential Low Top',
    description: 'Minimalist low-top sneaker crafted from premium leather with a memory foam insole for all-day comfort.',
    price: 189,
    category: 'sneakers',
    sizes: [6, 7, 8, 9, 10, 11, 12, 13],
    colors: ['White', 'Black', 'Navy'],
    image: '/images/logo.png',
    images: ['/images/logo.png'],
    stock: 45,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Oxford Heritage',
    description: 'Classic oxford in full-grain leather. Perfect for the office or formal occasions.',
    price: 349,
    category: 'formal',
    sizes: [6, 7, 8, 9, 10, 11, 12, 13],
    colors: ['Black', 'Brown', 'Tan'],
    image: '/images/logo.png',
    images: ['/images/logo.png'],
    stock: 28,
    rating: 4.9,
  },
];

const fallbackCategories = [
  { id: 'sneakers', name: 'Sneakers', slug: 'sneakers', image: null, productCount: 1 },
  { id: 'formal', name: 'Formal', slug: 'formal', image: null, productCount: 1 },
];

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
    return NextResponse.json({
      products: fallbackStore.getProducts(search, categorySlug).map((product) => ({
        ...product,
        category: product.category?.slug ?? product.categoryId ?? 'uncategorized',
        image: product.images?.[0] ?? '/images/logo.png',
        images: product.images?.length ? product.images : ['/images/logo.png'],
      })),
      categories: fallbackStore.getCategories().map((category) => ({
        ...category,
        productCount: 0,
      })),
    });
  }
}
