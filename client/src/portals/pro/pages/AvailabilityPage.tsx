import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/auth';
import { availabilityApi, AvailabilityInput } from '../../../lib/api';
import { DAY_NAMES_FULL } from '../../../lib/utils';

const DEFAULT_START = '09:00';
const DEFAULT_END = '18:00';

export function AvailabilityPage() {
  const user = useAuthStore(s => s.user);
  const [days, setDays] = useState<AvailabilityInput[]>(
    Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      start_time: DEFAULT_START,
      end_time: DEFAULT_END,
      active: i >= 1 && i <= 5, // Mon–Fri active by default
    }))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    availabilityApi.get(user.id).then(({ availability }) => {
      if (availability.length > 0) {
        setDays(prev => prev.map(d => {
          const existing = availability.find(a => a.day_of_week === d.day_of_week);
          if (existing) return { ...d, start_time: existing.start_time, end_time: existing.end_time, active: true };
          return { ...d, active: false };
        }));
      }
    }).finally(() => setLoading(false));
  }, [user]);

  function updateDay(dayOfWeek: number, patch: Partial<AvailabilityInput>) {
    setDays(prev => prev.map(d => d.day_of_week === dayOfWeek ? { ...d, ...patch } : d));
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    try {
      await availabilityApi.update(user.id, days);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container pt-10 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container pt-4">
      <div className="mb-6">
        <h2 className="section-title">Disponibilidade</h2>
        <p className="text-sm text-neutral-500 mt-1">Configure seus dias e horários de atendimento</p>
      </div>

      <div className="space-y-3">
        {days.map(day => (
          <div key={day.day_of_week} className={`card p-4 transition-opacity ${!day.active ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-neutral-900">{DAY_NAMES_FULL[day.day_of_week]}</span>
              <button
                onClick={() => updateDay(day.day_of_week, { active: !day.active })}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${day.active ? 'bg-primary' : 'bg-neutral-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${day.active ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {day.active && (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs text-neutral-500 mb-1 block">Início</label>
                  <input
                    type="time"
                    value={day.start_time}
                    onChange={e => updateDay(day.day_of_week, { start_time: e.target.value })}
                    className="input py-2 text-sm"
                  />
                </div>
                <div className="text-neutral-400 mt-4">–</div>
                <div className="flex-1">
                  <label className="text-xs text-neutral-500 mb-1 block">Fim</label>
                  <input
                    type="time"
                    value={day.end_time}
                    onChange={e => updateDay(day.day_of_week, { end_time: e.target.value })}
                    className="input py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {day.active && (
              <p className="text-xs text-neutral-500 mt-2">
                {(() => {
                  const [sh, sm] = day.start_time.split(':').map(Number);
                  const [eh, em] = day.end_time.split(':').map(Number);
                  const slots = Math.floor((eh * 60 + em - (sh * 60 + sm)) / 60);
                  return `${slots} horário${slots !== 1 ? 's' : ''} disponível${slots !== 1 ? 'is' : ''}`;
                })()}
              </p>
            )}
          </div>
        ))}
      </div>

      {saved && (
        <div className="mt-4 p-3 bg-success/10 text-success rounded-lg text-sm text-center animate-fade-in">
          ✓ Disponibilidade salva com sucesso!
        </div>
      )}

      <button onClick={handleSave} disabled={saving} className="btn-primary w-full mt-6">
        {saving ? 'Salvando...' : 'Salvar disponibilidade'}
      </button>
    </div>
  );
}
