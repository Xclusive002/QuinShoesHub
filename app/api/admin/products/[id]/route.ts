export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const productSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().nonnegative().optional(),
  compareAtPrice: z.number().nonnegative().optional(),
  categoryId: z.string().optional(),
  stock: z.number().int().nonnegative().optional(),
  sku: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'OUT_OF_STOCK']).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const body = await request.json();
  const data = productSchema.parse(body);

  try {
    const normalizedData = normalizeProductPayload(data);
    const updateData: Record<string, unknown> = {
      ...(normalizedData.name !== undefined ? { name: normalizedData.name } : {}),
      ...(normalizedData.description !== undefined ? { description: normalizedData.description } : {}),
      ...(normalizedData.price !== undefined ? { price: normalizedData.price } : {}),
      ...(normalizedData.compareAtPrice !== undefined ? { compareAtPrice: normalizedData.compareAtPrice } : {}),
      ...(normalizedData.categoryId !== undefined ? { categoryId: normalizedData.categoryId || null } : {}),
      ...(normalizedData.stock !== undefined ? { stock: normalizedData.stock } : {}),
      ...(normalizedData.sku !== undefined ? { sku: normalizedData.sku || null } : {}),
      ...(normalizedData.status !== undefined ? { status: normalizedData.status as any } : {}),
      ...(normalizedData.rating !== undefined ? { rating: normalizedData.rating } : {}),
    };

    if (normalizedData.sizes !== undefined) {
      updateData.sizes = serializeJsonStringArray(normalizedData.sizes);
    }

    if (normalizedData.colors !== undefined) {
      updateData.colors = serializeJsonStringArray(normalizedData.colors);
    }

    if (normalizedData.images !== undefined) {
      updateData.images = serializeJsonStringArray(normalizedData.images);
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json({ product: toAdminProductShape(product) });
  } catch (error) {
    console.error('Failed to update product', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;

    await prisma.wishlistItem.deleteMany({ where: { productId: params.id } });
    await prisma.orderItem.deleteMany({ where: { productId: params.id } });
    await prisma.product.delete({ where: { id: params.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete product', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
