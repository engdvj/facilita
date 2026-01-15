'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useRealtimeNotificationStore } from '@/stores/realtime-notification-store';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifications = useRealtimeNotificationStore((state) => state.notifications);
  const unreadCount = useRealtimeNotificationStore((state) => state.unreadCount);
  const markAsRead = useRealtimeNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useRealtimeNotificationStore((state) => state.markAllAsRead);

  // Ensure component is mounted (for portal)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debug: log when unreadCount changes
  useEffect(() => {
    console.log('[NotificationBell] unreadCount changed:', unreadCount);
    console.log('[NotificationBell] notifications count:', notifications.length);
  }, [unreadCount, notifications.length]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleNotificationClick = async (notification: any) => {
    try {
      // Mark as read
      if (!notification.read) {
        await api.patch(`/notifications/${notification.id}/read`);
        markAsRead(notification.id);
      }

      setOpen(false);

      // Navigate or show modal
      if (notification.actionUrl) {
        router.push(notification.actionUrl);
      } else if (notification.type === 'CONTENT_DELETED' || notification.type === 'FAVORITE_DELETED') {
        // Open modal showing deleted item info
        setSelectedNotification(notification);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleCloseModal = () => {
    setSelectedNotification(null);
  };

  const handleDeleteNotification = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      useRealtimeNotificationStore.getState().removeNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="motion-press relative group rounded-full border-2 border-border/50 bg-gradient-to-br from-card/80 to-secondary/30 p-2.5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md hover:scale-105 active:scale-95"
          aria-label="Notifications"
        >
          <Bell className={`h-5 w-5 transition-colors ${unreadCount > 0 ? 'text-primary animate-pulse' : 'text-foreground/70 group-hover:text-foreground'}`} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-[10px] font-bold text-white shadow-lg ring-2 ring-background animate-bounce">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-3 w-80 sm:w-96 max-h-[550px] overflow-hidden rounded-2xl border-2 border-border/70 bg-card shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-border/50 bg-gradient-to-r from-primary/5 to-transparent px-5 py-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold tracking-tight text-foreground">Notificações</h3>
                {unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="motion-press rounded-lg px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-12">
                  <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">Nenhuma notificação</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Você está em dia!</p>
                </div>
              ) : (
                <ul className="divide-y divide-border/30">
                  {notifications.map((notification) => (
                    <li
                      key={notification.id}
                      className={`group relative cursor-pointer transition-all hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent ${
                        !notification.read ? 'bg-gradient-to-r from-blue-500/5 to-transparent' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3 px-4 py-3.5">
                        {/* Unread indicator */}
                        {!notification.read && (
                          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm shadow-blue-500/50 animate-pulse" />
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-foreground leading-snug">
                            {notification.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="mt-1.5 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                            {new Date(notification.createdAt).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteNotification(notification.id, e)}
                          className="motion-press shrink-0 opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-muted-foreground/60 transition-all hover:bg-red-500/10 hover:text-red-500"
                          aria-label="Excluir notificação"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedNotification && isMounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={handleCloseModal}
        >
          <div
            className="motion-fade w-full max-w-lg rounded-2xl border border-border/70 bg-card/95 shadow-[0_24px_48px_rgba(16,44,50,0.24)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-border/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">
                {selectedNotification.title}
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedNotification.message}
              </p>

              {selectedNotification.metadata && (
                <div className="rounded-xl border border-border/70 bg-secondary/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground/80 mb-3">
                    Detalhes do item removido
                  </p>
                  <div className="space-y-2.5">
                    {selectedNotification.metadata.linkTitle && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-foreground/60 min-w-[50px]">Título:</span>
                        <span className="text-xs text-foreground">{selectedNotification.metadata.linkTitle}</span>
                      </div>
                    )}
                    {selectedNotification.metadata.linkUrl && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-foreground/60 min-w-[50px]">URL:</span>
                        <span className="text-xs text-foreground break-all">{selectedNotification.metadata.linkUrl}</span>
                      </div>
                    )}
                    {selectedNotification.metadata.noteTitle && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-foreground/60 min-w-[50px]">Título:</span>
                        <span className="text-xs text-foreground">{selectedNotification.metadata.noteTitle}</span>
                      </div>
                    )}
                    {selectedNotification.metadata.scheduleTitle && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-foreground/60 min-w-[50px]">Título:</span>
                        <span className="text-xs text-foreground">{selectedNotification.metadata.scheduleTitle}</span>
                      </div>
                    )}
                    {selectedNotification.metadata.adminMessage && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs font-medium text-foreground/60 mb-1.5">Mensagem do administrador:</p>
                        <p className="text-sm text-foreground italic leading-relaxed">
                          "{selectedNotification.metadata.adminMessage}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border/50 px-6 py-4 flex justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="motion-press rounded-lg border border-border/70 bg-card/80 px-5 py-2 text-sm font-medium text-foreground transition hover:bg-muted/50 hover:border-foreground/40"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
