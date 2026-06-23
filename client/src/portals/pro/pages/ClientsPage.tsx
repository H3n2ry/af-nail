import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/auth';
import { salonApi, SalonClient } from '../../../lib/api';

export function ClientsPage() {
  const salon = useAuthStore(s => s.salon);
  const [clients, setClients] = useState<SalonClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (salon) {
      salonApi.clients(salon.id)
        .then(r => setClients(r.clients))
        .finally(() => setLoading(false));
    }
  }, [salon]);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-container pt-4">
      <h2 className="section-title mb-4">Clientes</h2>

      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome..."
          className="input pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <span className="text-4xl">👤</span>
          <p className="text-neutral-500 text-sm">{search ? 'Nenhuma cliente encontrada' : 'Nenhuma cliente conectada ainda'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-neutral-500">{filtered.length} cliente{filtered.length !== 1 ? 's' : ''}</p>
          {filtered.map(client => (
            <div key={client.id} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-pale flex items-center justify-center text-primary font-semibold font-display text-lg flex-shrink-0">
                {client.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900 truncate">{client.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {client.phone && (
                    <a href={`tel:${client.phone}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                      📞 {client.phone}
                    </a>
                  )}
                  <span className="text-xs text-neutral-500">
                    {client.total_appointments} agendamento{client.total_appointments !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              {client.last_appointment && (
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-neutral-500">Último</p>
                  <p className="text-xs font-medium text-neutral-900">
                    {new Date(client.last_appointment + 'T12:00:00Z').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
