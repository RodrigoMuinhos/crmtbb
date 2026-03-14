import React from 'react';

export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  className?: string;
}

export function Table<T extends { id: string | number }>({ columns, data, className = '' }: TableProps<T>) {
  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="grid gap-4 pb-3 border-b border-[var(--brand-text-secondary)]/10"
        style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
      >
        {columns.map((column, index) => (
          <div
            key={index}
            className={`text-[var(--brand-text-secondary)] text-sm font-medium ${
              column.align === 'center' ? 'text-center' : 
              column.align === 'right' ? 'text-right' : 'text-left'
            }`}
          >
            {column.header}
          </div>
        ))}
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-[var(--brand-text-secondary)]/5">
        {data.map((row) => (
          <div
            key={row.id}
            className="grid gap-4 py-3"
            style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
          >
            {columns.map((column, index) => {
              const value = typeof column.accessor === 'function' 
                ? column.accessor(row)
                : row[column.accessor];
              
              return (
                <div
                  key={index}
                  className={`text-[var(--brand-text-primary)] ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {value as React.ReactNode}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
