import React from 'react';
import { AppointmentWithDetails } from '../lib/api';
import { formatCurrency, formatDate, isFuture } from '../lib/utils';

type Props = {
  appointment: AppointmentWithDetails;
  showClient?: boolean;
  onCancel?: () => void;
  onComplete?: () => void;
};

const statusConfig = {
  confirmed: { label: 'Confirmado', cls: 'badge-confirmed' },
  completed: { label: 'Concluído', cls: 'badge-completed' },
  cancelled: { label: 'Cancelado', cls: 'badge-cancelled' },
};

export function AppointmentCard({ appointment, showClient, onCancel, onComplete }: Props) {
  const { label, cls } = statusConfig[appointment.status];
  const canCancel = appointment.status === 'confirmed' && isFuture(appointment.scheduled_date, appointment.scheduled_time);

  return (
    <div className="card p-4 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-neutral-900">{appointment.service_name}</span>
            {appointment.is_combo ? <span className="badge badge-confirmed text-[10px]">Combo</span> : null}
            <span className={`badge ${cls}`}>{label}</span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            {formatDate(appointment.scheduled_date)} · {appointment.scheduled_time}
          </p>
          {showClient && appointment.client_name && (
            <p className="text-sm text-neutral-500">{appointment.client_name}</p>
          )}
          {!showClient && appointment.professional_name && (
            <p className="text-sm text-neutral-500">{appointment.professional_name}</p>
          )}
          {appointment.salon_name && (
            <p className="text-xs text-neutral-500 mt-0.5">{appointment.salon_name}</p>
          )}
        </div>
        <span className="font-mono font-semibold text-accent text-base whitespace-nowrap">
          {formatCurrency(appointment.price_cents)}
        </span>
      </div>

      {appointment.notes && (
        <p className="text-sm text-neutral-500 mt-2 bg-primary-pale rounded-md px-3 py-2 italic">
          {appointment.notes}
        </p>
      )}

      {(canCancel || onComplete) && (
        <div className="flex gap-2 mt-3">
          {onComplete && appointment.status === 'confirmed' && (
            <button onClick={onComplete} className="btn-primary text-sm px-4 py-2 min-h-[36px] flex-1">
              ✓ Concluir
            </button>
          )}
          {canCancel && onCancel && (
            <button onClick={onCancel} className="btn-ghost text-sm px-4 py-2 min-h-[36px] flex-1 border border-neutral-100">
              Cancelar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
