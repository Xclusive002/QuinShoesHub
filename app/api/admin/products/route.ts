import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

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

function serializeJsonStringArray(value: string[] | undefined): string | null {
  if (!Array.isArray(value)) return null;

  const normalized = value.filter((item): item is string => typeof item === 'string' && item.length > 0);
  return normalized.length ? JSON.stringify(normalized) : null;
}

function normalizeProductPayload(data: z.infer<typeof productSchema>) {
  return {
    ...data,
    categoryId: data.categoryId?.trim() ? data.categoryId.trim() : undefined,
    sku: data.sku?.trim() ? data.sku.trim() : undefined,
  };
}

function toAdminProductShape(product: any) {
  const images = parseJsonStringArray(product.images);

  return {
    ...product,
    images,
    sizes: parseJsonStringArray(product.sizes),
    colors: parseJsonStringArray(product.colors),
    image: images[0] ?? '/images/logo.png',
  };
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products: products.map(toAdminProductShape) });
  } catch (error) {
    console.error('Admin products fetch failed', error);
    return NextResponse.json({ products: [] });
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
    const normalizedData = normalizeProductPayload(data);
    const product = await prisma.product.create({
      data: {
        name: normalizedData.name,
        description: normalizedData.description,
        price: normalizedData.price,
        compareAtPrice: normalizedData.compareAtPrice ?? null,
        categoryId: normalizedData.categoryId ?? null,
        stock: normalizedData.stock,
        sku: normalizedData.sku ?? null,
        status: (normalizedData.status as any) ?? 'DRAFT',
        sizes: serializeJsonStringArray(normalizedData.sizes),
        colors: serializeJsonStringArray(normalizedData.colors),
        images: serializeJsonStringArray(normalizedData.images),
        rating: normalizedData.rating ?? 0,
      },
      include: { category: true },
    });

    return NextResponse.json({ product: toAdminProductShape(product) }, { status: 201 });
  } catch (error) {
    console.error('Failed to create product', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
