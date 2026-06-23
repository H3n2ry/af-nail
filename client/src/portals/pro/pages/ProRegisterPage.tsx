import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../../../components/Logo';
import { useAuthStore } from '../../../store/auth';
import { ApiError } from '../../../lib/api';

export function ProRegisterPage() {
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
      await register({ ...form, role: 'professional' });
      navigate('/pro/create-salon', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao cadastrar.');
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Logo size="lg" className="justify-center mb-2" />
          <p className="text-neutral-500 text-sm">Acesso para profissionais</p>
        </div>

        <div className="bg-neutral-800 rounded-lg p-6 space-y-4 border border-white/10">
          <h1 className="font-display text-2xl font-semibold text-white">Criar conta profissional</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { k: 'name', label: 'Nome completo', type: 'text', placeholder: 'Seu nome' },
              { k: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com' },
              { k: 'phone', label: 'WhatsApp', type: 'tel', placeholder: '(11) 99999-9999' },
              { k: 'password', label: 'Senha', type: 'password', placeholder: 'Mínimo 6 caracteres' },
            ].map(({ k, label, type, placeholder }) => (
              <div key={k}>
                <label className="block text-sm font-medium text-neutral-400 mb-1">{label}</label>
                <input
                  type={type} value={form[k as keyof typeof form]}
                  onChange={set(k as keyof typeof form)}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 bg-neutral-700 border border-white/10 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[48px]"
                  required={k !== 'phone'} minLength={k === 'password' ? 6 : undefined}
                />
              </div>
            ))}

            {error && <p className="text-sm text-error bg-error/10 rounded-md px-3 py-2">{error}</p>}

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Criando conta...' : 'Criar conta profissional'}
            </button>
          </form>

          <p className="text-center text-sm text-neutral-400">
            Já tem conta?{' '}
            <Link to="/pro/login" className="text-primary-light font-medium hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
