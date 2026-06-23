import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth';
import { salonApi, Salon } from '../../../lib/api';

export function HomePage() {
  const user = useAuthStore(s => s.user);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Salon[]>([]);
  const [mySalons, setMySalons] = useState<Salon[]>([]);
  const [searching, setSearching] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    salonApi.myConnected().then(r => setMySalons(r.salons)).catch(() => {});
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    debounceRef.current = setTimeout(() => {
      salonApi.search(query)
        .then(r => setResults(r.salons))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 400);
  }, [query]);

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

  return (
    <div className="page-container pt-4">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-neutral-900 mb-1">
          Olá, {user?.name.split(' ')[0]} 💅
        </h2>
        <p className="text-neutral-500 text-sm">Encontre seu salão favorito</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar salões pelo nome..."
          className="input pl-10"
        />
        {searching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin block" />
          </span>
        )}
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <div className="mb-6 space-y-2 animate-fade-in">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Resultados</h3>
          {results.map(salon => (
            <div key={salon.id} className="card p-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900 truncate">{salon.name}</p>
                {salon.address && <p className="text-sm text-neutral-500 truncate">{salon.address}</p>}
              </div>
              {connectedIds.has(salon.id) ? (
                <button onClick={() => navigate(`/app/salon/${salon.id}`)} className="btn-secondary text-sm px-4 py-2 min-h-[36px]">
                  Acessar
                </button>
              ) : (
                <button
                  onClick={() => handleConnect(salon)}
                  disabled={connecting === salon.id}
                  className="btn-primary text-sm px-4 py-2 min-h-[36px]"
                >
                  {connecting === salon.id ? '...' : 'Conectar'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {query.trim().length >= 2 && !searching && results.length === 0 && (
        <div className="text-center py-6 animate-fade-in">
          <p className="text-neutral-500 text-sm">Nenhum salão encontrado para "{query}"</p>
        </div>
      )}

      {/* My salons */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">Meus Salões</h3>
        {mySalons.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <span className="text-4xl">💅</span>
            <p className="text-neutral-500 text-sm">Conecte-se a um salão para começar a agendar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {mySalons.map(salon => (
              <button
                key={salon.id}
                onClick={() => navigate(`/app/salon/${salon.id}`)}
                className="card p-4 w-full text-left flex items-center gap-3 hover:border-primary transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-display font-semibold text-lg">
                  {salon.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 truncate">{salon.name}</p>
                  {salon.description && (
                    <p className="text-sm text-neutral-500 truncate">{salon.description}</p>
                  )}
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-neutral-500 flex-shrink-0">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
