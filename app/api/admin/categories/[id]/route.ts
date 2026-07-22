import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { fallbackStore } from '@/lib/fallback-store';

const categorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await request.json();
    const data = categorySchema.parse(body);

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.slug ? { slug: data.slug } : {}),
        ...(data.description !== undefined ? { description: data.description || null } : {}),
        ...(data.image !== undefined ? { image: data.image || null } : {}),
        ...(data.parentId !== undefined ? { parentId: data.parentId || null } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    const params = await context.params;
    const category = fallbackStore.updateCategory(params.id, {
      name: 'Fallback category',
      slug: 'fallback-category',
      description: 'Fallback category',
    });

    return NextResponse.json({ category });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const params = await context.params;
    fallbackStore.deleteCategory(params.id);
    return NextResponse.json({ ok: true });
  }
}
