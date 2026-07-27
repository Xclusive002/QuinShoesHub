import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limiter';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'local';
    const rl = rateLimit(`login:${ip}`, 8, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const data = loginSchema.parse(body);

    const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'quinn123';

    if (data.username !== expectedUsername || data.password !== expectedPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const sessionPayload = JSON.stringify({ isAuthenticated: true, username: data.username });
    const cookieValue = Buffer.from(sessionPayload).toString('base64');

    const response = NextResponse.json({ ok: true, message: 'Signed in' });
    response.cookies.set({
      name: 'admin-session',
      value: cookieValue,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 12,
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: (err as any)?.message || 'Invalid request' }, { status: 400 });
  }
}
