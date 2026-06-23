import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../../../components/Logo';
import { useAuthStore } from '../../../store/auth';
import { ApiError } from '../../../lib/api';

export function LoginPage() {
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
      navigate('/app', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    }
  }

  return (
    <div className="min-h-screen bg-primary-pale flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-2" />
          <p className="text-neutral-500 text-sm">Acesso para clientes</p>
        </div>

        <div className="card p-6 space-y-4">
          <h1 className="font-display text-2xl font-semibold text-neutral-900">Entrar</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="input"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                className="input"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-error bg-error/10 rounded-md px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500">
            Não tem conta?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>

        <p className="text-center text-sm text-neutral-500 mt-6">
          É manicure?{' '}
          <Link to="/pro/login" className="text-primary font-medium hover:underline">
            Acesso profissional
          </Link>
        </p>
      </div>
    </div>
  );
}
