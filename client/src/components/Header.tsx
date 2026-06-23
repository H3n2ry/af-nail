import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { useNotificationStore } from '../store/notifications';
import { useAuthStore } from '../store/auth';

type Props = {
  title?: string;
  showBack?: boolean;
  showLogo?: boolean;
  portal?: 'client' | 'pro';
};

export function Header({ title, showBack, showLogo = true, portal = 'client' }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = useNotificationStore(s => s.unreadCount);
  const notifPath = portal === 'pro' ? '/pro/notifications' : '/app/notifications';

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
                <path d="M12.5 15L7.5 10L12.5 5" stroke="#C9607A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          {showLogo && !showBack && <Logo size="sm" />}
          {title && <h1 className="font-display text-lg font-semibold text-neutral-900">{title}</h1>}
        </div>

        <button
          onClick={() => navigate(notifPath)}
          className="relative p-2 rounded-full hover:bg-primary-pale transition-colors"
          aria-label="Notificações"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2a7 7 0 0 1 7 7v3l1.5 2.5a1 1 0 0 1-.866 1.5H3.366a1 1 0 0 1-.866-1.5L4 12V9a7 7 0 0 1 7-7Z" stroke="#7A6872" strokeWidth="1.5" />
            <path d="M9 17a2 2 0 0 0 4 0" stroke="#7A6872" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
