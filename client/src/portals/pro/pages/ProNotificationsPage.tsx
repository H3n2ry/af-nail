import React, { useEffect } from 'react';
import { useNotificationStore } from '../../../store/notifications';

const typeIcon: Record<string, string> = {
  reminder_2d: '📅',
  reminder_2h: '⏰',
  new_booking: '✨',
  cancellation: '❌',
};

export function ProNotificationsPage() {
  const { notifications, isLoading, fetch, markRead, markAllRead } = useNotificationStore();

  useEffect(() => { fetch(); }, []);

  const unread = notifications.filter(n => !n.is_read);

  return (
    <div className="page-container pt-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title">Notificações</h2>
        {unread.length > 0 && (
          <button onClick={markAllRead} className="text-sm text-primary font-medium hover:underline">
            Marcar todas como lidas
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <span className="text-5xl">🔔</span>
          <p className="text-neutral-500">Nenhuma notificação ainda</p>
          <p className="text-sm text-neutral-500">Novos agendamentos e lembretes aparecerão aqui</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => (
            <button
              key={notif.id}
              onClick={() => !notif.is_read && markRead(notif.id)}
              className={`w-full card p-4 text-left flex gap-3 transition-colors ${!notif.is_read ? 'border-primary-light bg-primary-pale/50' : ''}`}
            >
              <span className="text-xl flex-shrink-0">{typeIcon[notif.type] ?? '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${notif.is_read ? 'text-neutral-500' : 'text-neutral-900 font-medium'}`}>
                  {notif.message}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {new Date(notif.created_at * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {!notif.is_read && (
                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
