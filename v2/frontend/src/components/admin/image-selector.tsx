'use client';

import { useState } from 'react';
import api, { serverURL } from '@/lib/api';
import ImageGallery from './image-gallery';

interface ImageSelectorProps {
  value: string;
  onChange: (imageUrl: string) => void;
  disabled?: boolean;
}

type SelectorMode = 'upload' | 'gallery';

export default function ImageSelector({
  value,
  onChange,
  disabled = false,
}: ImageSelectorProps) {
  const [mode, setMode] = useState<SelectorMode>('upload');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setUploading(true);
      const response = await api.post('/uploads/image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipNotify: true,
      });
      onChange(response.data.url);
    } catch (uploadError) {
      console.error('Erro ao fazer upload:', uploadError);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onChange('');
  };

  return (
    <div className="space-y-3">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('upload')}
          disabled={disabled}
          className={`flex-1 rounded-lg border px-3 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors ${
            mode === 'upload'
              ? 'border-foreground/30 bg-foreground/5 text-foreground'
              : 'border-border/70 text-muted-foreground hover:border-foreground/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'motion-press'}`}
        >
          Upload Nova
        </button>
        <button
          type="button"
          onClick={() => setMode('gallery')}
          disabled={disabled}
          className={`flex-1 rounded-lg border px-3 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors ${
            mode === 'gallery'
              ? 'border-foreground/30 bg-foreground/5 text-foreground'
              : 'border-border/70 text-muted-foreground hover:border-foreground/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'motion-press'}`}
        >
          Escolher Existente
        </button>
      </div>

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={disabled || uploading}
            className="w-full rounded-lg border border-border/70 bg-white/80 px-4 py-2 text-sm text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {uploading && (
            <p className="mt-2 text-xs text-muted-foreground">
              Fazendo upload...
            </p>
          )}
        </div>
      )}

      {/* Gallery Mode */}
      {mode === 'gallery' && (
        <div>
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            disabled={disabled}
            className="w-full rounded-lg border border-border/70 bg-background px-4 py-2 text-sm text-foreground hover:border-foreground/30 transition-colors motion-press disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Abrir Galeria de Imagens
          </button>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="relative rounded-lg border border-border/70 overflow-hidden">
          <img
            src={`${serverURL}${value}`}
            alt="Imagem selecionada"
            className="w-full h-40 object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={disabled}
            className="absolute top-2 right-2 rounded-lg bg-red-500 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white shadow-lg motion-press hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Remover
          </button>
        </div>
      )}

      {/* Gallery Modal */}
      {galleryOpen && (
        <ImageGallery
          onSelectImage={(imageUrl) => {
            onChange(imageUrl);
            setGalleryOpen(false);
          }}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </div>
  );
}
