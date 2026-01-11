'use client';

import { FavoritesSection } from '@/components/FavoritesSection';

export default function FavoritosPage() {
  return (
    <div className="space-y-6">
      <div className="motion-item flex flex-col gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Favoritos
          </p>
          <h1 className="font-display text-3xl text-foreground">
            Meus Favoritos
          </h1>
          <p className="text-sm text-muted-foreground">
            Todos os seus links, documentos e notas favoritos em um só lugar.
          </p>
        </div>
      </div>

      <div className="motion-item">
        <FavoritesSection />
      </div>
    </div>
  );
}
