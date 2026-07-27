'use client';

import { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface OrderRow {
  id: string;
  status: string;
  total: number;
  paymentStatus: string;
  shippingName?: string | null;
  shippingEmail?: string | null;
  createdAt: string;
}

const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      setOrders(data.orders ?? []);
    } catch {
      setOrders([]);
    }
  };

  useEffect(() => {
    void fetchOrders();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Orders</h1>
          <p className="text-muted-foreground">Review and update store orders</p>
        </div>
      </div>

      <div className="border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="text-left px-6 py-4 text-sm font-medium">Order</th>
              <th className="text-left px-6 py-4 text-sm font-medium">Customer</th>
              <th className="text-left px-6 py-4 text-sm font-medium">Total</th>
              <th className="text-left px-6 py-4 text-sm font-medium">Payment</th>
              <th className="text-left px-6 py-4 text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border hover:bg-secondary transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-secondary border border-border">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{order.shippingName ?? 'Guest'}</td>
                <td className="px-6 py-4 text-sm font-medium">{formatCurrency(Number(order.total))}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-2 py-1 rounded text-xs bg-secondary border border-border">{order.paymentStatus}</span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <select
                    defaultValue={order.status}
                    className="px-3 py-2 border border-border bg-background text-foreground text-sm"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
