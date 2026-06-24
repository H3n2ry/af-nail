import React from 'react';
import { Service } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { Toggle } from './Toggle';

type Props = {
  service: Service;
  onBook?: () => void;
  showToggle?: boolean;
  onToggle?: () => void;
  onEdit?: () => void;
};

export function ServiceCard({ service, onBook, showToggle, onToggle, onEdit }: Props) {
  return (
    <div className={`card p-4 flex flex-col gap-3 ${service.is_active === 0 ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">💅</span>
            <h3 className="font-semibold text-neutral-900">{service.name}</h3>
            {service.is_combo ? (
              <span className="badge badge-confirmed text-[10px]">Combo</span>
            ) : null}
          </div>
          {service.description && (
            <p className="text-sm text-neutral-500 mt-1 leading-relaxed">{service.description}</p>
          )}
          <div className="flex items-center gap-1 mt-2 text-neutral-500">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
              <path d="M7 4v3l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="text-xs">{service.duration_minutes} min</span>
          </div>
        </div>
        {showToggle && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button onClick={onEdit} className="text-neutral-500 hover:text-primary transition-colors p-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M11.5 2.5a1.5 1.5 0 0 1 2.121 2.121L5.5 12.743l-3 .757.757-3L11.5 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <Toggle checked={!!service.is_active} onChange={() => onToggle?.()} />
          </div>
        )}
      </div>

      <div className="border-t border-primary-pale pt-3 flex items-center justify-between">
        <span className="font-mono font-semibold text-accent text-lg">
          {formatCurrency(service.price_cents)}
        </span>
        {onBook && (
          <button
            onClick={onBook}
            disabled={service.is_active === 0}
            className="btn-primary text-sm px-5 py-2 min-h-[40px]"
          >
            Agendar
          </button>
        )}
      </div>
    </div>
  );
}
