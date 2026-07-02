import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth';
import { salonApi, Salon, SalonType } from '../../../lib/api';

type TabValue = SalonType | 'all' | 'mine';

const TABS: { value: TabValue; label: string }[] = [
  { value: 'all',    label: 'Todos' },
  { value: 'nail',   label: 'Manicure' },
  { value: 'hair',   label: 'Cabelo' },
  { value: 'barber', label: 'Barbearia' },
  { value: 'mine',   label: 'Meus Salões' },
];

const SALON_TYPE_LABEL: Record<SalonType, string> = {
  nail: 'Manicure',
  hair: 'Cabelo',
  barber: 'Barbearia',
};

export function HomePage() {
  const user = useAuthStore(s => s.user);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [salons, setSalons] = useState<Salon[]>([]);
  const [mySalons, setMySalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    salonApi.myConnected().then(r => setMySalons(r.salons)).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'mine') return;
    clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      const type = activeTab !== 'all' ? (activeTab as SalonType) : undefined;
      salonApi.search(query, type)
        .then(r => setSalons(r.salons))
        .catch(() => setSalons([]))
        .finally(() => setLoading(false));
    }, query ? 400 : 0);
  }, [query, activeTab]);

  async function handleConnect(salon: Salon) {
    setConnecting(salon.id);
    try {
      await salonApi.connect(salon.id);
      const updated = await salonApi.myConnected();
      setMySalons(updated.salons);
      navigate(`/app/salon/${salon.id}`);
    } catch {
      navigate(`/app/salon/${salon.id}`);
    } finally {
      setConnecting(null);
    }
  }

  const connectedIds = new Set(mySalons.map(s => s.id));
  const displayList = activeTab === 'mine' ? mySalons : salons;

  return (
    <div className="page-container pt-4">
      <div className="mb-5">
        <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-1">
          Olá, {user?.name.split(' ')[0]}
        </h2>
        <p className="text-neutral-500 text-sm">Encontre seu salão favorito</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar pelo nome..."
          className="input pl-10"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin block" />
          </span>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-4 px-4">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border-2 ${
              activeTab === tab.value
                ? 'bg-primary text-white border-primary'
                : 'bg-surface text-neutral-500 border-neutral-100 hover:border-primary/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Salon list */}
      {loading && activeTab !== 'mine' ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-neutral-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : displayList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500 text-sm">
            {activeTab === 'mine'
              ? 'Conecte-se a um salão para começar a agendar'
              : query
              ? `Nenhum salão encontrado para "${query}"`
              : 'Nenhum salão cadastrado nesta categoria ainda'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          {displayList.map(salon => (
            <div key={salon.id} className="card p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-semibold text-lg flex-shrink-0">
                {salon.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-neutral-900 truncate">{salon.name}</p>
                  <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full flex-shrink-0">
                    {SALON_TYPE_LABEL[salon.type] ?? salon.type}
                  </span>
                </div>
                {salon.address && <p className="text-xs text-neutral-500 truncate">{salon.address}</p>}
              </div>
              {activeTab === 'mine' || connectedIds.has(salon.id) ? (
                <button
                  onClick={() => navigate(`/app/salon/${salon.id}`)}
                  className="btn-secondary text-sm px-4 py-2 min-h-[36px] flex-shrink-0"
                >
                  Acessar
                </button>
              ) : (
                <button
                  onClick={() => handleConnect(salon)}
                  disabled={connecting === salon.id}
                  className="btn-primary text-sm px-4 py-2 min-h-[36px] flex-shrink-0"
                >
                  {connecting === salon.id ? '...' : 'Conectar'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
