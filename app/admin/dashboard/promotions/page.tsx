'use client';

import { useEffect, useState } from 'react';
import { TicketPercent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PromoRow {
  id: string;
  code: string;
  type: string;
  value: number;
  status: string;
  expiryDate?: string | null;
}

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<PromoRow[]>([]);

  useEffect(() => {
    const loadPromos = async () => {
      try {
        const response = await fetch('/api/admin/promos');
        const data = await response.json();
        setPromos(data.promos ?? []);
      } catch {
        setPromos([]);
      }
    };

    void loadPromos();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold mb-2">Promotions</h1>
        <p className="text-muted-foreground">Create and manage discount campaigns</p>
      </div>

      <div className="border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="text-left px-6 py-4 text-sm font-medium">Code</th>
              <th className="text-left px-6 py-4 text-sm font-medium">Type</th>
              <th className="text-left px-6 py-4 text-sm font-medium">Value</th>
              <th className="text-left px-6 py-4 text-sm font-medium">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium">Expiry</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((promo) => (
              <tr key={promo.id} className="border-b border-border hover:bg-secondary transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-secondary border border-border">
                      <TicketPercent className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{promo.code}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{promo.type}</td>
                <td className="px-6 py-4 text-sm font-medium">{promo.type === 'PERCENTAGE' ? `${promo.value}%` : formatCurrency(promo.value)}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-2 py-1 rounded text-xs bg-secondary border border-border">{promo.status}</span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{promo.expiryDate ? new Date(promo.expiryDate).toLocaleDateString() : 'No expiry'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
