'use client';

import { useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function WebSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    console.log('[WebSocketProvider] Mounted');
  }, []);

  useWebSocket();

  return <>{children}</>;
}
