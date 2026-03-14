import React from 'react';

export interface ExpenseItemProps {
  category: string;
  amount: string;
  observation?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function ExpenseItem({ category, amount, observation, icon, className = '' }: ExpenseItemProps) {
  return (
    <div className={`flex items-start justify-between py-3 ${className}`}>
      <div className="flex items-start gap-3 flex-1">
        {icon && (
          <div className="text-[var(--brand-text-secondary)] mt-0.5">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className="text-[var(--brand-text-primary)] font-medium">
            {category}
          </div>
          {observation && (
            <div className="text-[var(--brand-text-secondary)] text-sm mt-0.5">
              {observation}
            </div>
          )}
        </div>
      </div>
      <div className="text-[var(--brand-primary)] font-semibold ml-4">
        {amount}
      </div>
    </div>
  );
}
