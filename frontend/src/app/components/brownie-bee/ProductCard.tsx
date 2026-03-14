import React from 'react';
import { Card } from './Card';
import { Switch } from './Switch';
import { Pencil, Trash2 } from 'lucide-react';

export interface ProductCardProps {
  name: string;
  price: string;
  image?: string;
  isActive: boolean;
  isVisible: boolean;
  onActiveChange: (active: boolean) => void;
  onVisibleChange: (visible: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function ProductCard({
  name,
  price,
  image,
  isActive,
  isVisible,
  onActiveChange,
  onVisibleChange,
  onEdit,
  onDelete,
  className = ''
}: ProductCardProps) {
  return (
    <Card className={className}>
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-16 h-16 flex-shrink-0 bg-[var(--status-info)] rounded-lg overflow-hidden">
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--brand-text-secondary)]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-[var(--brand-text-primary)] font-medium mb-1 truncate">
            {name}
          </h4>
          <div className="text-[var(--brand-primary)] font-semibold mb-3">
            {price}
          </div>
          
          {/* Switches */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--brand-text-secondary)]">Ativo</span>
              <Switch checked={isActive} onChange={onActiveChange} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--brand-text-secondary)]">Visível no cardápio</span>
              <Switch checked={isVisible} onChange={onVisibleChange} />
            </div>
          </div>

          {/* Action Buttons */}
          {(onEdit || onDelete) && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--brand-text-secondary)]/10">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-[var(--brand-primary)] hover:bg-[var(--brand-bg)] rounded transition-colors"
                  title="Editar produto"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-[var(--status-danger)] hover:bg-red-50 rounded transition-colors"
                  title="Excluir produto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}