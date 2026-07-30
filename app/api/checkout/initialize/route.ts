import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, total, email, name, phone, address } = body;

    if (!items?.length || !email) {
      return NextResponse.json({ error: 'Missing cart items or email' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    const order = await prisma.order.create({
      data: {
        userId: user?.id,
        status: 'PENDING',
        total,
        shippingName: name,
        shippingEmail: email,
        shippingPhone: phone,
        shippingAddress: address,
        paymentStatus: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(total * 100), // kobo
        reference: order.id,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/checkout/verify`,
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return NextResponse.json({ error: 'Failed to start payment' }, { status: 500 });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentReference: paystackData.data.reference },
    });

    return NextResponse.json({ authorizationUrl: paystackData.data.authorization_url });
  } catch (error) {
    console.error('Checkout init failed', error);
    return NextResponse.json({ error: 'Failed to start checkout' }, { status: 500 });
  }
}
