import React, { useState, useEffect } from 'react';
import { AppointmentCard } from '../../../components/AppointmentCard';
import { appointmentApi, AppointmentWithDetails } from '../../../lib/api';
import { today } from '../../../lib/utils';

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  async function load() {
    try {
      const { appointments } = await appointmentApi.list('client');
      setAppointments(appointments);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCancel(id: string) {
    if (!confirm('Cancelar este agendamento?')) return;
    setCancelling(id);
    try {
      await appointmentApi.updateStatus(id, 'cancelled');
      await load();
    } finally {
      setCancelling(null);
    }
  }

  const now = today();
  const future = appointments.filter(a => a.status === 'confirmed' && a.scheduled_date >= now);
  const past = appointments.filter(a => a.status !== 'confirmed' || a.scheduled_date < now);

  if (loading) {
    return (
      <div className="page-container pt-10 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container pt-4">
      <h2 className="section-title mb-6">Meus Agendamentos</h2>

      {future.length > 0 && (
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">Próximos</h3>
          <div className="space-y-3">
            {future.map(appt => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onCancel={() => handleCancel(appt.id)}
              />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">Histórico</h3>
          <div className="space-y-3">
            {past.map(appt => (
              <AppointmentCard key={appt.id} appointment={appt} />
            ))}
          </div>
        </section>
      )}

      {appointments.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <span className="text-5xl">📅</span>
          <p className="text-neutral-500">Você ainda não tem agendamentos.</p>
          <p className="text-sm text-neutral-500">Acesse um salão para marcar seu horário!</p>
        </div>
      )}
    </div>
  );
}
