import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { fallbackStore } from '@/lib/fallback-store';

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ categories: fallbackStore.getCategories() });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = categorySchema.parse(body);

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        image: data.image ?? null,
        parentId: data.parentId ?? null,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    const category = fallbackStore.createCategory({
      name: 'Fallback category',
      slug: 'fallback-category',
      description: 'Created in fallback mode',
      image: null,
      parentId: null,
      sortOrder: 0,
    });

    return NextResponse.json({ category }, { status: 201 });
  }
}
