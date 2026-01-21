'use client';

import { create } from 'zustand';

export type NotificationType =
  | 'CONTENT_DELETED'
  | 'CONTENT_CREATED'
  | 'CONTENT_UPDATED'
  | 'CONTENT_RESTORED'
  | 'CONTENT_ACTIVATED'
  | 'CONTENT_DEACTIVATED'
  | 'FAVORITE_UPDATED'
  | 'FAVORITE_DELETED'
  | 'CONTENT_FAVORITED';

export type EntityType = 'LINK' | 'SCHEDULE' | 'NOTE';

export type RealtimeNotification = {
  id: string;
  type: NotificationType;
  entityType: EntityType;
  entityId: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  metadata?: Record<string, any> | null;
  read: boolean;
  createdAt: string;
};

type NotificationState = {
  notifications: RealtimeNotification[];
  unreadCount: number;
  loading: boolean;
  setNotifications: (notifications: RealtimeNotification[]) => void;
  addNotification: (notification: RealtimeNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
};

export const useRealtimeNotificationStore = create<NotificationState>(
  (set) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,

    setNotifications: (notifications) =>
      set({ notifications }),

    addNotification: (notification) =>
      set((state) => {
        console.log('[Store] Adding notification:', notification);
        console.log('[Store] Current notifications count:', state.notifications.length);
        console.log('[Store] Current unreadCount:', state.unreadCount);
        const newState = {
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        };
        console.log('[Store] New unreadCount:', newState.unreadCount);
        console.log('[Store] New notifications count:', newState.notifications.length);
        return newState;
      }),

    markAsRead: (id) =>
      set((state) => {
        const notification = state.notifications.find((n) => n.id === id);
        if (notification && !notification.read) {
          return {
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n,
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        }
        return state;
      }),

    markAllAsRead: () =>
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      })),

    removeNotification: (id) =>
      set((state) => {
        const notification = state.notifications.find((n) => n.id === id);
        return {
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: notification && !notification.read
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        };
      }),

    setUnreadCount: (count) => set({ unreadCount: count }),

    incrementUnreadCount: () =>
      set((state) => ({ unreadCount: state.unreadCount + 1 })),

    setLoading: (loading) => set({ loading }),

    clear: () => set({ notifications: [], unreadCount: 0 }),
  }),
);
