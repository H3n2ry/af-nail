import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../../../components/Logo';
import { useAuthStore } from '../../../store/auth';
import { ApiError } from '../../../lib/api';

export function ProLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore(s => s.login);
  const isLoading = useAuthStore(s => s.isLoading);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      // RequireProSalon guard in App.tsx handles the /pro → /pro/create-salon redirect
      navigate('/pro', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao fazer login.');
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-2" />
          <p className="text-neutral-500 text-sm">Acesso para profissionais</p>
        </div>

        <div className="bg-neutral-800 rounded-lg p-6 space-y-4 border border-white/10">
          <h1 className="font-display text-2xl font-semibold text-white">Entrar</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">E-mail</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 bg-neutral-700 border border-white/10 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[48px]"
                required autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Senha</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-3 bg-neutral-700 border border-white/10 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[48px]"
                required autoComplete="current-password"
              />
            </div>

            {error && <p className="text-sm text-error bg-error/10 rounded-md px-3 py-2">{error}</p>}

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-400">
            Não tem conta?{' '}
            <Link to="/pro/register" className="text-primary-light font-medium hover:underline">Cadastre-se</Link>
          </p>
        </div>

        <p className="text-center text-sm text-neutral-500 mt-6">
          É cliente?{' '}
          <Link to="/login" className="text-primary-light font-medium hover:underline">Acesso cliente</Link>
        </p>
      </div>
    </div>
  );
}
