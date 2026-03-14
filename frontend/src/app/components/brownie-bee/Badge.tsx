import React from 'react';

export type BadgeStatus = 'info' | 'success' | 'warning' | 'alert' | 'critical';

export interface BadgeProps {
  children: React.ReactNode;
  status?: BadgeStatus;
  className?: string;
}

export function Badge({ children, status = 'info', className = '' }: BadgeProps) {
  const statusStyles = {
    info: 'bg-[var(--status-info)] text-[var(--brand-text-primary)]',
    success: 'bg-[var(--status-success)] text-white',
    warning: 'bg-[var(--status-warning)] text-[var(--brand-text-primary)]',
    alert: 'bg-[var(--status-alert)] text-[var(--brand-text-primary)]',
    critical: 'bg-[var(--status-critical)] text-white'
  };
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${statusStyles[status]} ${className}`}
    >
      {children}
    </span>
  );
}
