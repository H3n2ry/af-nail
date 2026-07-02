import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useNotificationStore } from '../store/notifications';
import { useThemeStore } from '../store/theme';

type Props = {
  title?: string;
  showBack?: boolean;
  showLogo?: boolean;
  portal?: 'client' | 'pro';
};

export function Header({ title, showBack, showLogo = true, portal = 'client' }: Props) {
  const navigate = useNavigate();
  const unreadCount = useNotificationStore(s => s.unreadCount);
  const { theme, toggle } = useThemeStore();
  const notifPath = portal === 'pro' ? '/pro/notifications' : '/app/notifications';
  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-primary-pale">
      <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-primary-pale transition-colors"
              aria-label="Voltar"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" className="text-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          {showLogo && !showBack && <Logo size="sm" />}
          {title && (
            <h1 className="font-display text-xl font-semibold text-neutral-900 tracking-tight">
              {title}
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary ml-1.5 mb-1 align-middle" />
            </h1>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="relative p-2 rounded-full hover:bg-primary-pale transition-colors"
            aria-label={isDark ? 'Modo claro' : 'Modo escuro'}
          >
            {isDark ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-neutral-500">
                <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-neutral-500">
                <path d="M17 11.5A7 7 0 1 1 8.5 3a5.5 5.5 0 0 0 8.5 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {/* Notifications */}
          <button
            onClick={() => navigate(notifPath)}
            className="relative p-2 rounded-full hover:bg-primary-pale transition-colors"
            aria-label="Notificações"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-neutral-500">
              <path d="M11 2a7 7 0 0 1 7 7v3l1.5 2.5a1 1 0 0 1-.866 1.5H3.366a1 1 0 0 1-.866-1.5L4 12V9a7 7 0 0 1 7-7Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 17a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
