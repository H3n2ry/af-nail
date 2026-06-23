import React from 'react';
import { NavLink } from 'react-router-dom';

type NavItem = { to: string; label: string; icon: React.ReactNode };

function NavIcon({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <span className={`transition-colors ${active ? 'text-primary' : 'text-neutral-500'}`}>
      {children}
    </span>
  );
}

const clientItems: NavItem[] = [
  {
    to: '/app',
    label: 'Início',
    icon: (active: boolean) => (
      <NavIcon active={active}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M3 9.5L11 3l8 6.5V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} />
        </svg>
      </NavIcon>
    ),
  },
  {
    to: '/app/appointments',
    label: 'Agendamentos',
    icon: (active: boolean) => (
      <NavIcon active={active}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
          <path d="M7 3v4M15 3v4M3 9h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </NavIcon>
    ),
  },
  {
    to: '/app/notifications',
    label: 'Alertas',
    icon: (active: boolean) => (
      <NavIcon active={active}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 2a7 7 0 0 1 7 7v3l1.5 2.5a1 1 0 0 1-.866 1.5H3.366a1 1 0 0 1-.866-1.5L4 12V9a7 7 0 0 1 7-7Z" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
          <path d="M9 17a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </NavIcon>
    ),
  },
];

const proItems: NavItem[] = [
  {
    to: '/pro',
    label: 'Dashboard',
    icon: (active: boolean) => (
      <NavIcon active={active}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.2 : 0} />
          <rect x="12" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.2 : 0} />
          <rect x="3" y="12" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="12" y="12" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </NavIcon>
    ),
  },
  {
    to: '/pro/agenda',
    label: 'Agenda',
    icon: (active: boolean) => (
      <NavIcon active={active}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 3v4M15 3v4M3 9h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="11" cy="14" r="2" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </NavIcon>
    ),
  },
  {
    to: '/pro/clients',
    label: 'Clientes',
    icon: (active: boolean) => (
      <NavIcon active={active}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.2 : 0} />
          <path d="M4 19c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </NavIcon>
    ),
  },
  {
    to: '/pro/services',
    label: 'Serviços',
    icon: (active: boolean) => (
      <NavIcon active={active}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M4 6h14M4 11h14M4 16h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </NavIcon>
    ),
  },
  {
    to: '/pro/earnings',
    label: 'Ganhos',
    icon: (active: boolean) => (
      <NavIcon active={active}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 3v16M6 7h7.5a2.5 2.5 0 0 1 0 5H8a2.5 2.5 0 0 0 0 5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </NavIcon>
    ),
  },
];

type Props = { portal: 'client' | 'pro' };

export function BottomNav({ portal }: Props) {
  const items = portal === 'client' ? clientItems : proItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-primary-pale safe-area-pb">
      <div className="max-w-xl mx-auto flex">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app' || item.to === '/pro'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${isActive ? 'text-primary' : 'text-neutral-500'}`
            }
          >
            {({ isActive }) => (
              <>
                {(item.icon as (a: boolean) => React.ReactNode)(isActive)}
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
