import React from 'react';
import { Link2, Pencil } from 'lucide-react';

interface LinkFormSectionProps {
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    title: string;
    url: string;
    file_url: string;
    category_id: number | null;
    color: string;
    image_url: string;
  };
  onFormChange: (data: any) => void;
  linkType: 'link' | 'file';
  onLinkTypeChange: (type: 'link' | 'file') => void;
  imageType: 'url' | 'file';
  onImageTypeChange: (type: 'url' | 'file') => void;
  imageFile: File | null;
  onImageFileChange: (file: File | null) => void;
  hasFile: boolean;
  onHasFileChange: (has: boolean) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  categories: Array<{ id: number; name: string; color: string }>;
  colors: Array<{ id: number; value: string; name?: string }>;
  onCancel?: () => void;
}

export default function LinkFormSection({
  isEditing,
  onSubmit,
  formData,
  onFormChange,
  linkType,
  onLinkTypeChange,
  imageType,
  onImageTypeChange,
  imageFile,
  onImageFileChange,
  hasFile,
  onHasFileChange,
  file,
  onFileChange,
  categories,
  colors,
  onCancel,
}: LinkFormSectionProps) {
  return (
    <div className="space-y-4">
      <div 
        className="rounded-lg shadow-sm overflow-hidden"
        style={{
          background: 'var(--dashboard-stat-background)',
          border: `1px solid var(--dashboard-stat-border)`
        }}
      >
        <div 
          className="p-4" 
          style={{ borderBottom: `1px solid var(--dashboard-list-border)` }}
        >
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: 'var(--info)' }}
            >
              {isEditing ? (
                <Pencil className="w-3 h-3" style={{ color: 'var(--text-on-dark)' }} />
              ) : (
                <Link2 className="w-3 h-3" style={{ color: 'var(--text-on-dark)' }} />
              )}
            </div>
            <div>
              <h3 
                className="font-medium text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                {isEditing ? "Editar Link" : "Novo Link"}
              </h3>
              <p 
                className="text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                {isEditing ? "Modifique as informações" : "Adicione um novo link"}
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={onSubmit} className="p-4 space-y-3">
          <div>
            <label 
              className="block text-xs font-medium mb-1"
              style={{ color: 'var(--label-text)' }}
            >
              Título
            </label>
            <input
              className="w-full px-3 py-2 rounded-md transition-colors text-sm"
              style={{
                background: 'var(--input-background)',
                border: `1px solid var(--input-border)`,
                color: 'var(--input-text)',
              }}
              placeholder="Digite o título do link"
              value={formData.title}
              onChange={(e) => onFormChange({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Link Type Selection */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onLinkTypeChange('link')}
              className={`p-2 text-xs rounded-md transition-colors ${
                linkType === 'link' ? 'font-medium' : ''
              }`}
              style={{
                background: linkType === 'link' ? 'var(--button-primary)' : 'var(--button-secondary)',
                color: linkType === 'link' ? 'var(--button-primary-text)' : 'var(--text-primary)',
                border: `1px solid var(--border-primary)`,
              }}
            >
              Link URL
            </button>
            <button
              type="button"
              onClick={() => onLinkTypeChange('file')}
              className={`p-2 text-xs rounded-md transition-colors ${
                linkType === 'file' ? 'font-medium' : ''
              }`}
              style={{
                background: linkType === 'file' ? 'var(--button-primary)' : 'var(--button-secondary)',
                color: linkType === 'file' ? 'var(--button-primary-text)' : 'var(--text-primary)',
                border: `1px solid var(--border-primary)`,
              }}
            >
              Arquivo
            </button>
          </div>

          {/* URL or File input based on type */}
          {linkType === 'link' ? (
            <div>
              <label 
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--label-text)' }}
              >
                URL
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 rounded-md transition-colors text-sm"
                style={{
                  background: 'var(--input-background)',
                  border: `1px solid var(--input-border)`,
                  color: 'var(--input-text)',
                }}
                placeholder="https://exemplo.com"
                value={formData.url}
                onChange={(e) => onFormChange({ ...formData, url: e.target.value })}
                required
              />
            </div>
          ) : (
            <div>
              <label 
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--label-text)' }}
              >
                Arquivo
              </label>
              <input
                type="file"
                className="w-full px-3 py-2 rounded-md transition-colors text-sm"
                style={{
                  background: 'var(--input-background)',
                  border: `1px solid var(--input-border)`,
                  color: 'var(--input-text)',
                }}
                onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                required={!isEditing}
              />
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label 
              className="block text-xs font-medium mb-1"
              style={{ color: 'var(--label-text)' }}
            >
              Categoria
            </label>
            <select
              className="w-full px-3 py-2 rounded-md transition-colors text-sm"
              style={{
                background: 'var(--input-background)',
                border: `1px solid var(--input-border)`,
                color: 'var(--input-text)',
              }}
              value={formData.category_id || ''}
              onChange={(e) => onFormChange({ 
                ...formData, 
                category_id: e.target.value ? parseInt(e.target.value) : null 
              })}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Color Selection */}
          <div>
            <label 
              className="block text-xs font-medium mb-1"
              style={{ color: 'var(--label-text)' }}
            >
              Cor
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                className="w-12 h-8 rounded border-0 cursor-pointer"
                value={formData.color}
                onChange={(e) => onFormChange({ ...formData, color: e.target.value })}
              />
              <select
                className="flex-1 px-3 py-2 rounded-md transition-colors text-sm"
                style={{
                  background: 'var(--input-background)',
                  border: `1px solid var(--input-border)`,
                  color: 'var(--input-text)',
                }}
                value={formData.color}
                onChange={(e) => onFormChange({ ...formData, color: e.target.value })}
              >
                {colors.map((color) => (
                  <option key={color.id} value={color.value}>
                    {color.name || color.value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Section */}
          <div>
            <label 
              className="block text-xs font-medium mb-1"
              style={{ color: 'var(--label-text)' }}
            >
              Imagem (opcional)
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => onImageTypeChange('url')}
                className={`p-2 text-xs rounded-md transition-colors ${
                  imageType === 'url' ? 'font-medium' : ''
                }`}
                style={{
                  background: imageType === 'url' ? 'var(--button-primary)' : 'var(--button-secondary)',
                  color: imageType === 'url' ? 'var(--button-primary-text)' : 'var(--text-primary)',
                  border: `1px solid var(--border-primary)`,
                }}
              >
                URL da Imagem
              </button>
              <button
                type="button"
                onClick={() => onImageTypeChange('file')}
                className={`p-2 text-xs rounded-md transition-colors ${
                  imageType === 'file' ? 'font-medium' : ''
                }`}
                style={{
                  background: imageType === 'file' ? 'var(--button-primary)' : 'var(--button-secondary)',
                  color: imageType === 'file' ? 'var(--button-primary-text)' : 'var(--text-primary)',
                  border: `1px solid var(--border-primary)`,
                }}
              >
                Upload de Arquivo
              </button>
            </div>

            {imageType === 'url' ? (
              <input
                type="url"
                className="w-full px-3 py-2 rounded-md transition-colors text-sm"
                style={{
                  background: 'var(--input-background)',
                  border: `1px solid var(--input-border)`,
                  color: 'var(--input-text)',
                }}
                placeholder="https://exemplo.com/imagem.jpg"
                value={formData.image_url}
                onChange={(e) => onFormChange({ ...formData, image_url: e.target.value })}
              />
            ) : (
              <input
                type="file"
                accept="image/*"
                className="w-full px-3 py-2 rounded-md transition-colors text-sm"
                style={{
                  background: 'var(--input-background)',
                  border: `1px solid var(--input-border)`,
                  color: 'var(--input-text)',
                }}
                onChange={(e) => onImageFileChange(e.target.files?.[0] || null)}
              />
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              style={{
                background: 'var(--button-primary)',
                color: 'var(--button-primary-text)',
              }}
            >
              {isEditing ? "Salvar" : "Criar"}
            </button>

            {isEditing && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  background: 'var(--button-secondary)',
                  color: 'var(--text-primary)',
                  border: `1px solid var(--border-primary)`,
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}