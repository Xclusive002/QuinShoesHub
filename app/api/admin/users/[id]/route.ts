import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fallbackStore } from '@/lib/fallback-store';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { action } = body as { action?: string };
    const userId = params.id;

    if (!action) return NextResponse.json({ error: 'No action provided' }, { status: 400 });

    if (action === 'block' || action === 'unblock') {
      const nextStatus = action === 'block' ? 'BANNED' : 'ACTIVE';
      const dbUser = await prisma.user.findUnique({ where: { id: userId } }) ||
        await prisma.user.findFirst({ where: { authUserId: userId } });
      const authUserId = dbUser?.authUserId ?? userId;

      let updatedStatus = nextStatus;
      if (supabaseAdmin && authUserId) {
        try {
          await supabaseAdmin.auth.admin.updateUser(authUserId, {
            user_metadata: { status: nextStatus },
          });
        } catch (error) {
          console.error('Failed to update Supabase auth user status', error);
        }
      }

      try {
        if (dbUser) {
          const updated = await prisma.user.update({ where: { id: dbUser.id }, data: { status: nextStatus } });
          updatedStatus = updated.status;
        }

        return NextResponse.json({ ok: true, user: { id: dbUser?.id ?? userId, status: updatedStatus } });
      } catch {
        const users = fallbackStore.getUsers().map((u) => (u.id === userId ? { ...u, status: nextStatus } : u));
        // mutate internal store directly (not ideal but fallback)
        // @ts-ignore
        fallbackStore.state = { ...(fallbackStore as any).state, users };
        return NextResponse.json({ ok: true, user: { id: userId, status: nextStatus } });
      }
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
