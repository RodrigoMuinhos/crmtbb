import React from 'react';
import { Badge } from './Badge';

export interface StockItemProps {
  name: string;
  quantity: number;
  unit: string;
  status: 'ok' | 'low' | 'critical';
  className?: string;
}

export function StockItem({ name, quantity, unit, status, className = '' }: StockItemProps) {
  const statusConfig = {
    ok: { badge: 'success', text: 'Em estoque' },
    low: { badge: 'warning' as const, text: 'Atenção' },
    critical: { badge: 'critical' as const, text: 'Requer atenção' }
  };
  
  return (
    <div className={`flex items-center justify-between py-3 ${className}`}>
      <div className="flex-1">
        <div className="text-[var(--brand-text-primary)] font-medium mb-1">
          {name}
        </div>
        <Badge status={statusConfig[status].badge}>
          {statusConfig[status].text}
        </Badge>
      </div>
      <div className="text-right ml-4">
        <div className="text-[var(--brand-primary)] font-semibold"
          style={{ fontSize: 'var(--text-xl)' }}
        >
          {quantity}
        </div>
        <div className="text-[var(--brand-text-secondary)] text-sm">
          {unit}
        </div>
      </div>
    </div>
  );
}
