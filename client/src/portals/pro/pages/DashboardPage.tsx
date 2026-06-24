import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth';
import { dashboardApi, appointmentApi, AppointmentDashboard, AppointmentWithDetails } from '../../../lib/api';
import { formatCurrency, formatDate, formatDateShort } from '../../../lib/utils';
import { AppointmentCard } from '../../../components/AppointmentCard';

type PeriodTab = 'today' | 'week' | 'month';

export function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const subscription = useAuthStore(s => s.subscription);
  const [period, setPeriod] = useState<PeriodTab>('today');
  const [data, setData] = useState<AppointmentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const res = await dashboardApi.appointments(period);
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [period]);

  async function handleComplete(id: string) {
    setCompleting(id);
    try {
      await appointmentApi.updateStatus(id, 'completed');
      await load();
    } finally {
      setCompleting(null);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('Cancelar este agendamento?')) return;
    try {
      await appointmentApi.updateStatus(id, 'cancelled');
      await load();
    } catch {}
  }

  const periodLabels = { today: 'Hoje', week: 'Semana', month: 'Mês' };

  return (
    <div className="page-container pt-4">
      <div className="mb-6">
        <p className="text-neutral-500 text-sm">Bem-vinda de volta</p>
        <h2 className="font-display text-2xl font-semibold text-neutral-900">{user?.name.split(' ')[0]} ✨</h2>
      </div>

      {/* Status da assinatura */}
      <button
        onClick={() => navigate('/pro/subscription')}
        className="w-full flex items-center justify-between mb-6 px-4 py-2.5 rounded-full bg-success/10 text-sm hover:bg-success/15 transition-colors"
      >
        <span className="flex items-center gap-2 text-neutral-900">
          <span className="w-2 h-2 rounded-full bg-success" />
          Assinatura ativa{subscription?.expires_at ? ` · até ${formatDateShort(new Date(subscription.expires_at * 1000).toISOString().slice(0, 10))}` : ''}
        </span>
        <span className="text-primary font-medium">Gerenciar</span>
      </button>

      {/* Atalho para configurar horários (libera a agenda) */}
      <button
        onClick={() => navigate('/pro/availability')}
        className="w-full flex items-center justify-between mb-6 px-4 py-3 rounded-lg bg-primary-pale border border-primary-light text-sm hover:bg-primary/10 transition-colors"
      >
        <span className="flex items-center gap-2 font-medium text-neutral-900">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="#C9607A" strokeWidth="1.5" />
            <path d="M9 5v4l2.5 1.5" stroke="#C9607A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Configurar meus horários de atendimento
        </span>
        <span className="text-primary font-semibold">→</span>
      </button>

      {/* Period tabs */}
      <div className="flex gap-1 mb-6 bg-neutral-100 rounded-full p-1">
        {(['today', 'week', 'month'] as PeriodTab[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-all ${
              period === p ? 'bg-primary text-white shadow-sm' : 'text-neutral-500 hover:text-primary'
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {/* Summary card */}
      <div className="card p-5 mb-6 bg-primary text-white">
        <p className="text-white/70 text-sm mb-1">Agendamentos — {periodLabels[period]}</p>
        {loading ? (
          <div className="h-8 bg-white/20 rounded animate-pulse w-16" />
        ) : (
          <p className="font-display text-4xl font-semibold">{data?.count ?? 0}</p>
        )}
        <div className="flex gap-4 mt-3">
          <button onClick={() => navigate('/pro/agenda')} className="text-white/80 text-xs flex items-center gap-1 hover:text-white">
            Ver agenda →
          </button>
          <button onClick={() => navigate('/pro/earnings')} className="text-white/80 text-xs flex items-center gap-1 hover:text-white">
            Ver ganhos →
          </button>
        </div>
      </div>

      {/* Today's appointments */}
      <div>
        <h3 className="font-display text-lg font-semibold text-neutral-900 mb-3">
          Agenda de Hoje
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-24 bg-neutral-100 rounded-lg animate-pulse" />)}
          </div>
        ) : data?.today_appointments.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <span className="text-4xl">🌸</span>
            <p className="text-neutral-500 text-sm">Nenhum agendamento para hoje</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.today_appointments.map(appt => (
              <div key={appt.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900">{appt.client_name}</p>
                    <p className="text-sm text-neutral-500">{appt.service_name} · {appt.scheduled_time}</p>
                    {appt.client_phone && (
                      <a href={`tel:${appt.client_phone}`} className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline">
                        📞 {appt.client_phone}
                      </a>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-accent">{formatCurrency(appt.price_cents)}</p>
                    <span className={`badge ${appt.status === 'confirmed' ? 'badge-confirmed' : appt.status === 'completed' ? 'badge-completed' : 'badge-cancelled'} text-xs mt-1`}>
                      {appt.status === 'confirmed' ? 'Confirmado' : appt.status === 'completed' ? 'Concluído' : 'Cancelado'}
                    </span>
                  </div>
                </div>
                {appt.status === 'confirmed' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleComplete(appt.id)}
                      disabled={completing === appt.id}
                      className="btn-primary text-sm px-4 py-2 min-h-[36px] flex-1"
                    >
                      {completing === appt.id ? '...' : '✓ Concluir'}
                    </button>
                    <button onClick={() => handleCancel(appt.id)} className="btn-ghost text-sm px-3 py-2 min-h-[36px] border border-neutral-100">
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
