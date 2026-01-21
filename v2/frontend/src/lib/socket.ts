'use client';

import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth-store';

let socket: Socket | null = null;

const getServerURL = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // If API URL is relative (e.g., /api), use current origin
  if (apiUrl?.startsWith('/')) {
    return typeof window !== 'undefined' ? window.location.origin : '';
  }

  // If API URL is absolute, remove /api suffix
  if (apiUrl) {
    return apiUrl.replace('/api', '');
  }

  // Fallback to default
  const defaultHost =
    typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${defaultHost}:3001`;
};

export const getSocket = (): Socket => {
  if (!socket) {
    const serverURL = getServerURL();

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
