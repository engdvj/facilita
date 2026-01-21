'use client';

import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth-store';
import { getServerURLForMode } from '@/lib/api';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const serverURL = getServerURLForMode();

    const token = useAuthStore.getState().accessToken;

    console.log('[WebSocket] Initializing connection to:', serverURL);
    console.log('[WebSocket] Has token:', Boolean(token));

    socket = io(serverURL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[WebSocket] ✅ Connected successfully! Socket ID:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[WebSocket] ❌ Disconnected. Reason:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[WebSocket] ⚠️ Connection error:', error);
    });

    socket.on('notification', (data) => {
      console.log('[WebSocket] 📬 Received notification:', data);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const reconnectSocket = () => {
  if (socket) {
    const token = useAuthStore.getState().accessToken;
    socket.auth = { token };
    socket.connect();
  }
};
