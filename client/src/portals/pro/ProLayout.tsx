import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../../components/Header';
import { BottomNav } from '../../components/BottomNav';
import { useAuthStore } from '../../store/auth';

export function ProLayout() {
  const salon = useAuthStore(s => s.salon);

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header portal="pro" showLogo={false} title={salon?.name ?? 'Meu Salão'} />
      <main>
        <Outlet />
      </main>
      <BottomNav portal="pro" />
    </div>
  );
}
