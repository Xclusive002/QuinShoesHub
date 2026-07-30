import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference');
  if (!reference) {
    return NextResponse.redirect(new URL('/cart', request.url));
  }

  const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  const verifyData = await verifyRes.json();

  const order = await prisma.order.findFirst({ where: { paymentReference: reference } });
  if (!order) {
    return NextResponse.redirect(new URL('/cart', request.url));
  }

  if (verifyData.data?.status === 'success') {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PROCESSING', paymentStatus: 'PAID' },
    });
    return NextResponse.redirect(new URL(`/checkout/success?order=${order.id}`, request.url));
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'CANCELLED', paymentStatus: 'FAILED' },
  });
  return NextResponse.redirect(new URL('/cart?payment=failed', request.url));
}
