import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentApi, AppointmentWithDetails } from '../../../lib/api';
import { formatCurrency, today, addDays, getMondayOfWeek, getWeekDates, DAY_NAMES, DAY_NAMES_FULL } from '../../../lib/utils';
import { Modal } from '../../../components/Modal';

type View = 'day' | 'week' | 'month';

const HOURS = Array.from({ length: 12 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

export function AgendaPage() {
  const [view, setView] = useState<View>('day');
  const [currentDate, setCurrentDate] = useState(today());
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState<AppointmentWithDetails | null>(null);

  useEffect(() => {
    appointmentApi.list('professional').then(r => {
      setAppointments(r.appointments);
    }).finally(() => setLoading(false));
  }, []);

  function navigate(dir: -1 | 1) {
    if (view === 'day') setCurrentDate(addDays(currentDate, dir));
    else if (view === 'week') setCurrentDate(addDays(currentDate, dir * 7));
    else {
      const [y, m] = currentDate.split('-').map(Number);
      const newDate = new Date(y, m - 1 + dir, 1);
      const pad = (n: number) => n.toString().padStart(2, '0');
      setCurrentDate(`${newDate.getFullYear()}-${pad(newDate.getMonth() + 1)}-01`);
    }
  }

  const dayAppts = (date: string) =>
    appointments.filter(a => a.scheduled_date === date && a.status !== 'cancelled');

  // Day view
  const DayView = () => (
    <div className="space-y-1">
      {HOURS.map(hour => {
        const appt = dayAppts(currentDate).find(a => a.scheduled_time === hour);
        return (
          <div key={hour} className="flex gap-3 min-h-[56px]">
            <span className="text-xs text-neutral-500 w-12 pt-2 flex-shrink-0 font-mono">{hour}</span>
            <div className="flex-1 border-t border-neutral-100 pt-1">
              {appt ? (
                <button
                  onClick={() => setSelectedAppt(appt)}
                  className="w-full text-left bg-primary-pale border border-primary-light rounded-md px-3 py-2 hover:bg-primary/10 transition-colors"
                >
                  <p className="text-sm font-semibold text-primary">{appt.client_name}</p>
                  <p className="text-xs text-neutral-500">{appt.service_name}</p>
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Week view
  const weekStart = getMondayOfWeek(currentDate);
  const weekDates = getWeekDates(weekStart);
  const WeekView = () => (
    <div className="overflow-x-auto -mx-4">
      <div className="min-w-[420px] px-4">
        <div className="grid grid-cols-8 gap-1 mb-2">
          <div className="text-xs text-neutral-500 font-mono" />
          {weekDates.map((date, i) => {
            const d = new Date(date + 'T12:00:00Z');
            return (
              <button
                key={date}
                onClick={() => { setCurrentDate(date); setView('day'); }}
                className={`text-center p-1 rounded-md ${date === today() ? 'bg-primary text-white' : 'hover:bg-primary-pale'}`}
              >
                <div className="text-[10px] text-inherit opacity-70">{DAY_NAMES[i]}</div>
                <div className="text-sm font-semibold">{d.getDate()}</div>
              </button>
            );
          })}
        </div>
        {HOURS.map(hour => (
          <div key={hour} className="grid grid-cols-8 gap-1 min-h-[44px] border-t border-neutral-100">
            <span className="text-[10px] text-neutral-500 pt-1 font-mono">{hour}</span>
            {weekDates.map(date => {
              const appt = dayAppts(date).find(a => a.scheduled_time === hour);
              return (
                <div key={date} className="relative">
                  {appt && (
                    <button
                      onClick={() => setSelectedAppt(appt)}
                      className="absolute inset-0 m-0.5 bg-primary-pale border border-primary-light rounded text-[10px] text-primary font-medium p-1 overflow-hidden hover:bg-primary/10 transition-colors"
                    >
                      {appt.client_name?.split(' ')[0]}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  // Month view
  const [year, month] = currentDate.split('-').map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = monthStart.getDay();
  const MonthView = () => (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map(d => <div key={d} className="text-center text-xs text-neutral-500 font-semibold py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const pad = (n: number) => n.toString().padStart(2, '0');
          const date = `${year}-${pad(month)}-${pad(i + 1)}`;
          const count = dayAppts(date).length;
          const isToday = date === today();
          return (
            <button
              key={date}
              onClick={() => { setCurrentDate(date); setView('day'); }}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-all hover:bg-primary-pale ${isToday ? 'bg-primary text-white' : 'text-neutral-900'}`}
            >
              {i + 1}
              {count > 0 && (
                <span className={`text-[9px] font-bold ${isToday ? 'text-white/80' : 'text-primary'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="page-container pt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Agenda</h2>
        <div className="flex gap-1 bg-neutral-100 rounded-full p-1">
          {(['day', 'week', 'month'] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${view === v ? 'bg-primary text-white' : 'text-neutral-500'}`}
            >
              {v === 'day' ? 'Dia' : v === 'week' ? 'Sem' : 'Mês'}
            </button>
          ))}
        </div>
      </div>

      {/* Acesso à disponibilidade — onde a profissional libera os horários */}
      <Link
        to="/pro/availability"
        className="flex items-center justify-between mb-4 px-4 py-3 rounded-lg bg-primary-pale border border-primary-light hover:bg-primary/10 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-neutral-900">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="#C9607A" strokeWidth="1.5" />
            <path d="M9 5v4l2.5 1.5" stroke="#C9607A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Configurar meus horários de atendimento
        </span>
        <span className="text-primary font-semibold">→</span>
      </Link>

      {/* Date navigation */}
      <div className="flex items-center justify-between mb-4 card px-4 py-3">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-primary-pale rounded-full transition-colors">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 14L6 9l5-5" stroke="#C9607A" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <p className="text-sm font-semibold text-neutral-900">
          {view === 'day' && new Date(currentDate + 'T12:00:00Z').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long' })}
          {view === 'week' && `${new Date(weekStart + 'T12:00:00Z').getDate()} – ${new Date(weekDates[6] + 'T12:00:00Z').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}`}
          {view === 'month' && new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </p>
        <button onClick={() => navigate(1)} className="p-1 hover:bg-primary-pale rounded-full transition-colors">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M7 14l5-5-5-5" stroke="#C9607A" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card p-4">
          {view === 'day' && <DayView />}
          {view === 'week' && <WeekView />}
          {view === 'month' && <MonthView />}
        </div>
      )}

      {/* Appointment detail modal */}
      <Modal isOpen={!!selectedAppt} onClose={() => setSelectedAppt(null)} title="Detalhes do Agendamento">
        {selectedAppt && (
          <div className="space-y-3">
            <div className="bg-primary-pale rounded-lg p-4 space-y-2">
              {[
                { label: 'Cliente', value: selectedAppt.client_name },
                { label: 'Serviço', value: selectedAppt.service_name },
                { label: 'Data', value: new Date(selectedAppt.scheduled_date + 'T12:00:00Z').toLocaleDateString('pt-BR') },
                { label: 'Horário', value: selectedAppt.scheduled_time },
                { label: 'Valor', value: formatCurrency(selectedAppt.price_cents) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-neutral-500">{label}</span>
                  <span className="font-medium text-neutral-900">{value}</span>
                </div>
              ))}
            </div>
            {selectedAppt.notes && (
              <p className="text-sm text-neutral-500 italic bg-neutral-100 rounded-md px-3 py-2">{selectedAppt.notes}</p>
            )}
            {selectedAppt.status === 'confirmed' && (
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await appointmentApi.updateStatus(selectedAppt.id, 'completed');
                    const r = await appointmentApi.list('professional');
                    setAppointments(r.appointments);
                    setSelectedAppt(null);
                  }}
                  className="btn-primary flex-1 text-sm"
                >✓ Concluir</button>
                <button
                  onClick={async () => {
                    if (!confirm('Cancelar?')) return;
                    await appointmentApi.updateStatus(selectedAppt.id, 'cancelled');
                    const r = await appointmentApi.list('professional');
                    setAppointments(r.appointments);
                    setSelectedAppt(null);
                  }}
                  className="btn-ghost flex-1 text-sm border border-neutral-100"
                >Cancelar</button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
