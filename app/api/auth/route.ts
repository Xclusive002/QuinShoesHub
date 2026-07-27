import { NextResponse } from 'next/server';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = authSchema.parse(body);

    return NextResponse.json({
      ok: true,
      message: 'Auth scaffold ready',
      email: validated.email,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
