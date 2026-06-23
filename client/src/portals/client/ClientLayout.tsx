import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../../components/Header';
import { BottomNav } from '../../components/BottomNav';

export function ClientLayout() {
  return (
    <div className="min-h-screen bg-neutral-100">
      <Header portal="client" />
      <main>
        <Outlet />
      </main>
      <BottomNav portal="client" />
    </div>
  );
}
