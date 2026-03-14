import React from 'react';
import { Card } from './Card';

export interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

export function MetricCard({ title, value, subtitle, trend, className = '' }: MetricCardProps) {
  const trendColor = {
    positive: 'text-[var(--status-success)]',
    negative: 'text-[var(--status-critical)]',
    neutral: 'text-[var(--brand-text-secondary)]'
  };
  
  return (
    <Card className={className}>
      <div className="space-y-2">
        <h4 className="text-[var(--brand-text-secondary)] text-sm font-normal">
          {title}
        </h4>
        <div className={`font-semibold ${trend ? trendColor[trend] : 'text-[var(--brand-primary)]'}`}
          style={{ fontSize: 'var(--text-xl)' }}
        >
          {value}
        </div>
        {subtitle && (
          <p className="text-[var(--brand-text-secondary)] text-xs">
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
}
