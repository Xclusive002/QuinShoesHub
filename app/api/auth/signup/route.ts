import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limiter';
import { supabaseAdmin } from '@/lib/supabase';

const signupSchema = z.object({
  authUserId: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  fullName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'local';
    const rl = rateLimit(`signup:${ip}`, 6, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const data = signupSchema.parse(body);

    let createdUserId: string | null = data.authUserId ?? null;

    if (!createdUserId && supabaseAdmin) {
      const { data: newUser, error: supabaseError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password || undefined,
        email_confirm: true,
        user_metadata: {
          full_name: data.fullName,
          phone: data.phone,
        },
      });

      if (supabaseError) {
        console.error('Supabase user creation failed', supabaseError);
      } else if (newUser?.id) {
        createdUserId = newUser.id;
      }
    }

    try {
      // Lazy import prisma
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { prisma } = require('@/lib/prisma');
      const created = await prisma.user.create({
        data: {
          authUserId: createdUserId ?? undefined,
          email: data.email,
          name: data.fullName || undefined,
          fullName: data.fullName || undefined,
          phone: data.phone || undefined,
        },
      });

      return NextResponse.json({ ok: true, user: { id: created.id, email: created.email, authUserId: created.authUserId } });
    } catch (dbErr) {
      console.error('Prisma user creation failed', dbErr);
      if (createdUserId) {
        return NextResponse.json({ ok: true, user: { id: createdUserId, email: data.email, authUserId: createdUserId } });
      }
      return NextResponse.json({ ok: true, fallback: true, message: 'Signed up locally (no DB configured)', user: { email: data.email, fullName: data.fullName, phone: data.phone } });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as any)?.message || 'Invalid request' }, { status: 400 });
  }
}
