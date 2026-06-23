import { create } from 'zustand';
import { Notification, notificationApi } from '../lib/api';

type NotificationState = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetch: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetch: async () => {
    set({ isLoading: true });
    try {
      const { notifications, unread_count } = await notificationApi.list();
      set({ notifications, unreadCount: unread_count, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  markRead: async (id) => {
    await notificationApi.markRead(id);
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, is_read: 1 } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await notificationApi.markAllRead();
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: 1 })),
      unreadCount: 0,
    }));
  },
}));
