import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limiter';

const paymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1),
  payment_method: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'local';
    const rl = rateLimit(`payments:${ip}`, 12, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const data = paymentSchema.parse(body);

    // Ensure payment secret is set
    const secret = process.env.PAYMENT_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Payment provider not configured' }, { status: 500 });
    }

    // TODO: integrate provider SDK server-side; return a safe client token or payment URL
    return NextResponse.json({ ok: true, message: 'Payment request received (stubbed).' });
  } catch (err) {
    return NextResponse.json({ error: (err as any)?.message || 'Invalid request' }, { status: 400 });
  }
}
