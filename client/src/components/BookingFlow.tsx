import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Service, User, Slot, availabilityApi, appointmentApi } from '../lib/api';
import { formatCurrency, formatDate, today, addDays, DAY_NAMES } from '../lib/utils';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  salonId: string;
  professionals: User[];
  onSuccess: () => void;
};

type Step = 'professional' | 'calendar' | 'slots' | 'confirm';

const CALENDAR_DAYS = 30;

export function BookingFlow({ isOpen, onClose, service, salonId, professionals, onSuccess }: Props) {
  const [step, setStep] = useState<Step>(professionals.length > 1 ? 'professional' : 'calendar');
  const [selectedPro, setSelectedPro] = useState<User | null>(professionals.length === 1 ? professionals[0] : null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const dates = Array.from({ length: CALENDAR_DAYS }, (_, i) => addDays(today(), i));

  useEffect(() => {
    if (!isOpen) {
      setStep(professionals.length > 1 ? 'professional' : 'calendar');
      setSelectedPro(professionals.length === 1 ? professionals[0] : null);
      setSelectedDate('');
      setSelectedTime('');
      setSlots([]);
      setNotes('');
      setError('');
    }
  }, [isOpen, professionals.length]);

  useEffect(() => {
    if (selectedDate && selectedPro) {
      setLoadingSlots(true);
      setSelectedTime('');
      availabilityApi.slots(selectedPro.id, selectedDate, service?.duration_minutes)
        .then(r => setSlots(r.slots))
        .catch(() => setSlots([]))
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDate, selectedPro]);

  async function handleConfirm() {
    if (!service || !selectedPro || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    setError('');
    try {
      await appointmentApi.book({
        salon_id: salonId,
        professional_id: selectedPro.id,
        service_id: service.id,
        scheduled_date: selectedDate,
        scheduled_time: selectedTime,
        notes: notes || undefined,
      });
      onSuccess();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao agendar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!service) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agendar Horário" size="md">
      {/* Progress indicator */}
      <div className="flex gap-1 mb-5">
        {(['professional', 'calendar', 'slots', 'confirm'] as Step[])
          .filter(s => professionals.length > 1 || s !== 'professional')
          .map((s, i, arr) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${
              arr.indexOf(step) >= i ? 'bg-primary' : 'bg-neutral-100'
            }`} />
          ))}
      </div>

      {/* Step: Choose professional */}
      {step === 'professional' && (
        <div className="space-y-3">
          <p className="text-sm text-neutral-500">Escolha a profissional:</p>
          {professionals.map(pro => (
            <button
              key={pro.id}
              onClick={() => { setSelectedPro(pro); setStep('calendar'); }}
              className="w-full card p-4 flex items-center gap-3 hover:border-primary transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-primary-pale flex items-center justify-center text-primary font-semibold">
                {pro.name[0]}
              </div>
              <span className="font-medium text-neutral-900">{pro.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Step: Calendar */}
      {step === 'calendar' && (
        <div className="space-y-4">
          <p className="text-sm text-neutral-500">Escolha a data:</p>
          <div className="grid grid-cols-7 gap-1">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-neutral-500 py-1">{d}</div>
            ))}
            {/* Fill empty cells to align with correct day of week */}
            {(() => {
              const firstDay = new Date(dates[0] + 'T12:00:00Z').getDay();
              return Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />);
            })()}
            {dates.map(date => {
              const d = new Date(date + 'T12:00:00Z');
              const isSelected = date === selectedDate;
              const dayNum = d.getDate();
              return (
                <button
                  key={date}
                  onClick={() => { setSelectedDate(date); setStep('slots'); }}
                  className={`aspect-square flex items-center justify-center text-sm rounded-full font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'hover:bg-primary-pale text-neutral-900'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
          {professionals.length > 1 && (
            <button onClick={() => setStep('professional')} className="btn-ghost w-full text-sm">
              ← Trocar profissional
            </button>
          )}
        </div>
      )}

      {/* Step: Time slots */}
      {step === 'slots' && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-neutral-900">{formatDate(selectedDate)}</p>
            {selectedPro && <p className="text-sm text-neutral-500">{selectedPro.name}</p>}
          </div>
          {loadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : slots.length === 0 ? (
            <p className="text-center text-neutral-500 py-6 text-sm">Nenhum horário disponível neste dia.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map(slot => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => { setSelectedTime(slot.time); setStep('confirm'); }}
                  className={slot.available
                    ? selectedTime === slot.time ? 'slot-selected' : 'slot-available'
                    : 'slot-occupied'
                  }
                >
                  {slot.available ? slot.time : '—'}
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setStep('calendar')} className="btn-ghost w-full text-sm">
            ← Trocar data
          </button>
        </div>
      )}

      {/* Step: Confirm */}
      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="bg-primary-pale rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Serviço</span>
              <span className="font-medium text-neutral-900">{service.name}</span>
            </div>
            {selectedPro && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Profissional</span>
                <span className="font-medium text-neutral-900">{selectedPro.name}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Data</span>
              <span className="font-medium text-neutral-900">{formatDate(selectedDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Horário</span>
              <span className="font-medium text-neutral-900">{selectedTime}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-primary-light pt-2">
              <span className="text-neutral-500">Valor</span>
              <span className="font-mono font-semibold text-accent">{formatCurrency(service.price_cents)}</span>
            </div>
          </div>

          <div>
            <label className="label">Observações (opcional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Referência de cor, preferências..."
              rows={3}
              className="input resize-none"
            />
          </div>

          {error && <p className="text-sm text-error bg-error/10 rounded-md px-3 py-2">{error}</p>}

          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Confirmando...
              </span>
            ) : 'Confirmar Agendamento'}
          </button>
          <button onClick={() => setStep('slots')} className="btn-ghost w-full text-sm">
            ← Trocar horário
          </button>
        </div>
      )}
    </Modal>
  );
}
