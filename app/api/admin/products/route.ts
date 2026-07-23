import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { fallbackStore } from '@/lib/fallback-store';

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  categoryId: z.string().optional(),
  stock: z.number().int().nonnegative(),
  sku: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'OUT_OF_STOCK']).optional(),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  rating: z.number().min(0).max(5).optional(),
});

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Admin products fetch failed', error);
    const products = fallbackStore.getProducts();
    return NextResponse.json({ products });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  let data;

  try {
    data = productSchema.parse(body);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid product payload' }, { status: 400 });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        compareAtPrice: data.compareAtPrice ?? null,
        categoryId: data.categoryId ?? null,
        stock: data.stock,
        sku: data.sku ?? null,
        status: (data.status as any) ?? 'DRAFT',
        sizes: data.sizes,
        colors: data.colors,
        images: data.images,
        rating: data.rating ?? 0,
      },
      include: { category: true },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Failed to create product', error);
    const category = data.categoryId ? fallbackStore.getCategories().find((item) => item.id === data.categoryId) : undefined;
    const product = fallbackStore.createProduct({
      name: data.name,
      description: data.description,
      price: data.price,
      compareAtPrice: data.compareAtPrice,
      categoryId: data.categoryId,
      category: category ? { id: category.id, name: category.name, slug: category.slug } : undefined,
      stock: data.stock,
      sku: data.sku ?? null,
      status: (data.status as any) ?? 'DRAFT',
      sizes: data.sizes,
      colors: data.colors,
      images: data.images,
      rating: data.rating ?? 0,
    });
    return NextResponse.json({ product }, { status: 201 });
  }
}
