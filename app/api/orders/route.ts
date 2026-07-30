import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function mapStatus(status: string) {
  switch (status) {
    case 'PENDING':
      return 'Processing';
    case 'PROCESSING':
      return 'Packed';
    case 'SHIPPED':
      return 'Out for delivery';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    case 'REFUNDED':
      return 'Refunded';
    default:
      return String(status);
  }
}

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email') || request.headers.get('x-user-email');
    if (!email) return NextResponse.json({ orders: [] });

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { shippingEmail: email },
          { user: { email } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    });

    const transformed = orders.map((order) => ({
      id: order.id,
      orderNumber: order.id,
      createdAt: order.createdAt.toISOString(),
      status: mapStatus(order.status),
      total: Number(order.total),
      trackingCode: order.paymentReference ?? '',
      items: order.items.map((it) => {
        let image: string | undefined = undefined;
        try {
          if (it.product?.images) {
            const parsed = JSON.parse(it.product.images);
            if (Array.isArray(parsed) && parsed.length) image = parsed[0];
          }
        } catch {}
        return {
          id: it.id,
          name: it.product?.name ?? 'Item',
          price: Number(it.price),
          quantity: it.quantity,
          image,
        };
      }),
    }));

    return NextResponse.json({ orders: transformed });
  } catch (err) {
    console.error('Failed to fetch orders', err);
    return NextResponse.json({ orders: [] });
  }
}
