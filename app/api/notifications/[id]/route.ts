import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    await prisma.notification.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete notification' }, { status: 500 });
  }
}
