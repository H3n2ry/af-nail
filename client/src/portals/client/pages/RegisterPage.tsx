import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../../../components/Logo';
import { useAuthStore } from '../../../store/auth';
import { ApiError } from '../../../lib/api';

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const register = useAuthStore(s => s.register);
  const isLoading = useAuthStore(s => s.isLoading);
  const navigate = useNavigate();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await register({ ...form, role: 'client' });
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao cadastrar.');
    }
  }

  return (
    <div className="min-h-screen bg-primary-pale flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-2" />
          <p className="text-neutral-500 text-sm">Acesso para clientes</p>
        </div>

        <div className="card p-6 space-y-4">
          <h1 className="font-display text-2xl font-semibold text-neutral-900">Criar conta</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nome completo</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="Seu nome" className="input" required />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="seu@email.com" className="input" required />
            </div>
            <div>
              <label className="label">WhatsApp (opcional)</label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="(11) 99999-9999" className="input" />
            </div>
            <div>
              <label className="label">Senha</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Mínimo 6 caracteres" className="input" required minLength={6} />
            </div>

            {error && <p className="text-sm text-error bg-error/10 rounded-md px-3 py-2">{error}</p>}

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-500">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
