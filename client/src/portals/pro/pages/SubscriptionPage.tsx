import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../../components/Logo';
import { useAuthStore } from '../../../store/auth';
import { subscriptionApi, ApiError } from '../../../lib/api';

const FEATURES = [
  'Agenda completa (dia, semana e mês)',
  'Cadastro de serviços e preços',
  'Dashboard de ganhos',
  'Gestão de clientes',
  'Lembretes automáticos para as clientes',
];

function formatDate(ts: number | null): string {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleDateString('pt-BR');
}

export function SubscriptionPage() {
  const subscription = useAuthStore(s => s.subscription);
  const setSubscription = useAuthStore(s => s.setSubscription);
  const salon = useAuthStore(s => s.salon);
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isActive = subscription?.active;

  async function handleActivate() {
    setError('');
    setLoading(true);
    try {
      const { subscription: sub } = await subscriptionApi.activate();
      setSubscription(sub);
      navigate(salon ? '/pro' : '/pro/create-salon', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao ativar assinatura.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setError('');
    setLoading(true);
    try {
      const { subscription: sub } = await subscriptionApi.cancel();
      setSubscription(sub);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao cancelar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-primary-pale flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-2" />
          <p className="text-neutral-500 text-sm">Plano profissional</p>
        </div>

        <div className="card p-6 space-y-5">
          <div className="text-center">
            <h1 className="font-display text-2xl font-semibold text-neutral-900">
              {isActive ? 'Assinatura ativa' : 'Desbloqueie seu portal'}
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              {isActive
                ? `Válida até ${formatDate(subscription?.expires_at ?? null)}`
                : 'Assine para gerenciar sua agenda e seus ganhos'}
            </p>
          </div>

          <div className="bg-primary-pale rounded-lg p-4 text-center">
            <span className="font-mono text-3xl font-semibold text-accent">R$ 150,00</span>
            <span className="text-neutral-500 text-sm">/mês</span>
          </div>

          <ul className="space-y-2">
            {FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-neutral-900">
                <span className="text-success mt-0.5">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {error && <p className="text-sm text-error bg-error/10 rounded-md px-3 py-2">{error}</p>}

          <div className="bg-warning/10 border border-warning/30 rounded-md px-3 py-2 text-xs text-neutral-500">
            🧪 Modo teste — a ativação é simulada, sem cobrança real.
          </div>

          {isActive ? (
            <div className="space-y-2">
              <button onClick={() => navigate(salon ? '/pro' : '/pro/create-salon')} className="btn-primary w-full">
                Ir para o painel →
              </button>
              <button onClick={handleCancel} disabled={loading} className="w-full text-sm text-error hover:underline py-2">
                {loading ? 'Cancelando...' : 'Cancelar assinatura'}
              </button>
            </div>
          ) : (
            <button onClick={handleActivate} disabled={loading} className="btn-primary w-full">
              {loading ? 'Ativando...' : 'Assinar agora (teste)'}
            </button>
          )}

          <button onClick={() => { logout(); navigate('/pro/login', { replace: true }); }} className="w-full text-sm text-neutral-500 hover:underline">
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
