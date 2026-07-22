import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { fallbackStore } from '@/lib/fallback-store';

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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await request.json();
    const data = productSchema.parse(body);

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.description ? { description: data.description } : {}),
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.compareAtPrice !== undefined ? { compareAtPrice: data.compareAtPrice } : {}),
        ...(data.categoryId !== undefined ? { categoryId: data.categoryId || null } : {}),
        ...(data.stock !== undefined ? { stock: data.stock } : {}),
        ...(data.sku !== undefined ? { sku: data.sku || null } : {}),
        ...(data.status ? { status: data.status as any } : {}),
        ...(data.sizes ? { sizes: data.sizes } : {}),
        ...(data.colors ? { colors: data.colors } : {}),
        ...(data.images ? { images: data.images } : {}),
        ...(data.rating !== undefined ? { rating: data.rating } : {}),
      },
      include: { category: true },
    });

    return NextResponse.json({ product });
  } catch (error) {
    const params = await context.params;
    const fallbackProduct = fallbackStore.updateProduct(params.id, {
      name: 'Updated product',
      description: 'Fallback updated product',
      price: 0,
      stock: 0,
    });

    return NextResponse.json({ product: fallbackProduct });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const params = await context.params;
    fallbackStore.deleteProduct(params.id);
    return NextResponse.json({ ok: true });
  }
}
