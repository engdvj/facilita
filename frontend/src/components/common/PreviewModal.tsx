import React from 'react';

interface PreviewModalProps {
  previewData: {
    type: 'image' | 'file';
    url: string;
    name?: string;
  } | null;
  onClose: () => void;
}

export default function PreviewModal({ previewData, onClose }: PreviewModalProps) {
  if (!previewData) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="max-w-4xl max-h-full p-4">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute -top-10 right-0 text-white text-xl hover:text-gray-300 transition-colors"
          >
            ✕ Fechar
          </button>
          
          {previewData.type === 'image' ? (
            <img 
              src={previewData.url} 
              alt={previewData.name}
              className="max-w-full max-h-[80vh] object-contain rounded"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div 
              className="bg-white rounded-lg p-6 max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">📎</div>
                <h3 className="text-lg font-semibold mb-2">{previewData.name}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Arquivo selecionado para upload
                </p>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = previewData.url;
                    link.download = previewData.name || 'arquivo';
                    link.click();
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  📥 Baixar arquivo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}