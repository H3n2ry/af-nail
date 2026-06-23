import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../../components/Header';
import { ServiceCard } from '../../../components/ServiceCard';
import { BookingFlow } from '../../../components/BookingFlow';
import { salonApi, Salon, Service, User } from '../../../lib/api';

export function SalonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [bookingDone, setBookingDone] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      salonApi.get(id),
      salonApi.services(id),
    ]).then(([salonRes, servicesRes]) => {
      setSalon(salonRes.salon);
      setProfessionals(salonRes.professionals);
      setServices(servicesRes.services);
    }).catch(() => navigate('/app')).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-container pt-10 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!salon) return null;

  return (
    <div className="page-container pt-0">
      {/* Salon header */}
      <div className="bg-primary py-8 px-4 -mx-4 mb-6">
        <div className="max-w-xl mx-auto">
          <button onClick={() => navigate('/app')} className="mb-3 text-white/70 flex items-center gap-1 text-sm hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Início
          </button>
          <h1 className="font-display text-3xl font-semibold text-white mb-1">{salon.name}</h1>
          {salon.description && <p className="text-white/80 text-sm">{salon.description}</p>}
          {salon.address && (
            <p className="text-white/60 text-xs mt-2 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1a3.5 3.5 0 0 1 3.5 3.5C9.5 7.5 6 11 6 11S2.5 7.5 2.5 4.5A3.5 3.5 0 0 1 6 1Z" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="6" cy="4.5" r="1" fill="currentColor" />
              </svg>
              {salon.address}
            </p>
          )}
        </div>
      </div>

      {/* Professionals */}
      {professionals.length > 0 && (
        <div className="mb-6">
          <h2 className="font-display text-lg font-semibold text-neutral-900 mb-3">Profissionais</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {professionals.map(pro => (
              <div key={pro.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary-pale border-2 border-primary-light flex items-center justify-center text-primary font-semibold font-display text-lg">
                  {pro.name[0]}
                </div>
                <span className="text-xs text-neutral-500 whitespace-nowrap">{pro.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      <div>
        <h2 className="font-display text-lg font-semibold text-neutral-900 mb-3">Serviços</h2>
        {services.length === 0 ? (
          <p className="text-center text-neutral-500 py-8 text-sm">Nenhum serviço cadastrado ainda.</p>
        ) : (
          <div className="space-y-3">
            {services.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={() => setBookingService(service)}
              />
            ))}
          </div>
        )}
      </div>

      {bookingDone && (
        <div className="mt-4 p-4 bg-success/10 rounded-lg text-success text-sm text-center animate-fade-in">
          ✓ Agendamento confirmado! Veja em "Meus Agendamentos".
        </div>
      )}

      <BookingFlow
        isOpen={bookingService !== null}
        onClose={() => setBookingService(null)}
        service={bookingService}
        salonId={salon.id}
        professionals={professionals}
        onSuccess={() => { setBookingDone(true); setTimeout(() => setBookingDone(false), 5000); }}
      />
    </div>
  );
}
