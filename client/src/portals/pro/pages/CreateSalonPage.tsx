import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../../components/Logo';
import { useAuthStore } from '../../../store/auth';
import { salonApi, ApiError, SalonType } from '../../../lib/api';

const SALON_TYPES: { value: SalonType; label: string; icon: string; desc: string }[] = [
  { value: 'nail', label: 'Manicure', icon: '💅', desc: 'Unhas, alongamento, nail art' },
  { value: 'hair', label: 'Cabelo', icon: '✂️', desc: 'Corte, coloração, escova' },
  { value: 'barber', label: 'Barbearia', icon: '🪒', desc: 'Barba, corte masculino' },
];

export function CreateSalonPage() {
  const [form, setForm] = useState({ name: '', description: '', address: '' });
  const [type, setType] = useState<SalonType>('nail');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setSalon = useAuthStore(s => s.setSalon);
  const navigate = useNavigate();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { salon } = await salonApi.create({
        name: form.name,
        type,
        description: form.description || undefined,
        address: form.address || undefined,
      });
      setSalon({ id: salon.id, name: salon.name, slug: salon.slug });
      navigate('/pro', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao criar salão.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-primary-pale flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-2" />
          <p className="text-neutral-500 text-sm">Vamos configurar seu espaço</p>
        </div>

        <div className="card p-6 space-y-5">
          <div>
            <h1 className="font-display text-2xl font-semibold text-neutral-900">Criar meu salão</h1>
            <p className="text-sm text-neutral-500 mt-1">Configure as informações do seu espaço</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de salão */}
            <div>
              <label className="label">Tipo de estabelecimento *</label>
              <div className="grid grid-cols-3 gap-2">
                {SALON_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-md border-2 transition-all duration-150 text-center ${
                      type === t.value
                        ? 'border-primary bg-primary-pale text-neutral-900'
                        : 'border-neutral-100 text-neutral-500 hover:border-primary/40'
                    }`}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <span className="text-xs font-semibold leading-tight">{t.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {SALON_TYPES.find(t => t.value === type)?.desc}
              </p>
            </div>

            <div>
              <label className="label">Nome do salão *</label>
              <input
                type="text" value={form.name} onChange={set('name')}
                placeholder="Ex: Salão da Ana"
                className="input" required
              />
            </div>
            <div>
              <label className="label">Descrição</label>
              <textarea
                value={form.description} onChange={set('description')}
                placeholder="Conte um pouco sobre seu trabalho..."
                rows={3} className="input resize-none"
              />
            </div>
            <div>
              <label className="label">Endereço</label>
              <input
                type="text" value={form.address} onChange={set('address')}
                placeholder="Rua, número, bairro..."
                className="input"
              />
            </div>

            {error && <p className="text-sm text-error bg-error/10 rounded-md px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Criando...' : 'Criar meu salão →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
