import React from 'react';
import { LinkData } from '../LinkCard';
import { Category, FileData } from '../../types/admin';

interface FormData {
  title: string;
  url: string;
  categoryId: string;
  imageUrl: string;
  imageFile: File | null;
  fileUrl: string;
  attachedFile: File | null;
  imageInputType: 'link' | 'upload';
  fileInputType: 'link' | 'upload';
  hasFile: boolean;
  isPublic: boolean;
  isFavorite: boolean;
  linkType: 'url' | 'file';
  selectedFileId: string;
}

interface AdminLinkFormProps {
  editingLink: LinkData | null;
  formData: FormData;
  setFormData: (data: FormData) => void;
  categories: Category[];
  files: FileData[];
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  onImagePreview: () => void;
  onFilePreview: () => void;
}

export default function AdminLinkForm({ 
  editingLink, 
  formData, 
  setFormData, 
  categories,
  files,
  onSubmit, 
  onCancel, 
  onImagePreview,
  onFilePreview 
}: AdminLinkFormProps) {
  return (
    <div className="p-2 rounded-lg border" style={{ 
      background: 'var(--card-background)', 
      borderColor: 'var(--card-border)',
      height: 'fit-content',
      maxHeight: '90vh',
      overflow: 'auto'
    }}>
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          {editingLink ? 'Editar Link' : 'Criar Novo Link'}
        </h3>
        {editingLink && (
          <button
            onClick={onCancel}
            className="text-xs px-2 py-1 rounded"
            style={{ background: 'var(--card-border)', color: 'var(--text-secondary)' }}
          >
            Cancelar
          </button>
        )}
      </div>
      
      <form className="space-y-1" onSubmit={onSubmit}>
        {/* Título */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Título
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-2 py-1.5 rounded text-sm border"
            style={{ 
              background: 'var(--input-background)', 
              borderColor: 'var(--input-border)', 
              color: 'var(--text-primary)' 
            }}
            placeholder="Digite o título do link"
            required
          />
        </div>

        {/* Tipo de Link */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Tipo de Link
          </label>
          <div className="flex gap-2 text-xs">
            <label className="flex items-center gap-1">
              <input 
                type="radio" 
                name="linkType"
                checked={formData.linkType === 'url'}
                onChange={() => setFormData({...formData, linkType: 'url', selectedFileId: ''})}
                className="scale-75"
              />
              <span style={{ color: 'var(--text-primary)' }}>URL</span>
            </label>
            <label className="flex items-center gap-1">
              <input 
                type="radio" 
                name="linkType"
                checked={formData.linkType === 'file'}
                onChange={() => setFormData({...formData, linkType: 'file', url: '', hasFile: false, fileUrl: '', attachedFile: null})}
                className="scale-75"
              />
              <span style={{ color: 'var(--text-primary)' }}>Arquivo</span>
            </label>
          </div>
        </div>

        {/* URL - só aparece se tipo for URL */}
        {formData.linkType === 'url' && (
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            URL
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({...formData, url: e.target.value})}
            className="w-full px-2 py-1.5 rounded text-sm border"
            style={{ 
              background: 'var(--input-background)', 
              borderColor: 'var(--input-border)', 
              color: 'var(--text-primary)' 
            }}
            placeholder="https://exemplo.com"
            required
          />
        </div>
        )}

        {/* Seleção de Arquivo - só aparece se tipo for Arquivo */}
        {formData.linkType === 'file' && (
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Selecionar Arquivo
          </label>
          <select
            value={formData.selectedFileId}
            onChange={(e) => setFormData({...formData, selectedFileId: e.target.value})}
            className="w-full px-2 py-1.5 rounded text-sm border"
            style={{ 
              background: 'var(--input-background)', 
              borderColor: 'var(--input-border)', 
              color: 'var(--text-primary)' 
            }}
            required
          >
            <option value="">Selecione um arquivo</option>
            {files.map(file => (
              <option key={file.id} value={file.id}>
                {file.title} {file.description && `- ${file.description}`}
              </option>
            ))}
          </select>
          {files.length === 0 && (
            <p className="text-xs mt-1 opacity-75" style={{ color: 'var(--text-secondary)' }}>
              Nenhum arquivo encontrado. Faça upload de arquivos primeiro.
            </p>
          )}
        </div>
        )}

        {/* Categoria */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Categoria
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
            className="w-full px-2 py-1.5 rounded text-sm border"
            style={{ 
              background: 'var(--input-background)', 
              borderColor: 'var(--input-border)', 
              color: 'var(--text-primary)' 
            }}
          >
            <option value="">Selecione uma categoria</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Imagem */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Imagem <span style={{ color: 'var(--text-danger, red)' }}>*</span>
          </label>
          <div className="space-y-0.5">
            <div className="flex gap-2 text-xs">
              <label className="flex items-center gap-1">
                <input 
                  type="radio" 
                  name="imageType"
                  checked={formData.imageInputType === 'link'}
                  onChange={() => setFormData({...formData, imageInputType: 'link', imageFile: null})}
                  className="scale-75"
                />
                <span style={{ color: 'var(--text-primary)' }}>Link</span>
              </label>
              <label className="flex items-center gap-1">
                <input 
                  type="radio" 
                  name="imageType"
                  checked={formData.imageInputType === 'upload'}
                  onChange={() => setFormData({...formData, imageInputType: 'upload', imageUrl: ''})}
                  className="scale-75"
                />
                <span style={{ color: 'var(--text-primary)' }}>Upload</span>
              </label>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                {formData.imageInputType === 'link' ? (
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full px-2 py-0.5 rounded text-xs border"
                    style={{ 
                      background: 'var(--input-background)', 
                      borderColor: 'var(--input-border)', 
                      color: 'var(--text-primary)' 
                    }}
                    placeholder="URL da imagem"
                    required
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, imageFile: e.target.files?.[0] || null})}
                    className="w-full px-1 py-0.5 rounded text-xs border"
                    style={{ 
                      background: 'var(--input-background)', 
                      borderColor: 'var(--input-border)', 
                      color: 'var(--text-primary)' 
                    }}
                    required
                  />
                )}
              </div>
              
              {/* Preview da imagem */}
              <button
                type="button"
                onClick={onImagePreview}
                disabled={!formData.imageUrl && !formData.imageFile}
                className="w-10 h-10 border rounded flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
                style={{ borderColor: 'var(--input-border)', background: 'var(--input-background)' }}
              >
                {(formData.imageUrl || formData.imageFile) ? (
                  formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover rounded" onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<span style="color: var(--text-danger, red); font-size: 10px;">❌</span>';
                    }} />
                  ) : (
                    <span className="text-xs">🖼️</span>
                  )
                ) : (
                  <span className="text-xs opacity-50">📷</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Toggle para arquivo opcional - só aparece se tipo for URL */}
        {formData.linkType === 'url' && (
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.hasFile}
              onChange={(e) => {
                const hasFile = e.target.checked;
                setFormData({
                  ...formData, 
                  hasFile,
                  fileUrl: hasFile ? formData.fileUrl : '',
                  attachedFile: hasFile ? formData.attachedFile : null,
                  fileInputType: hasFile ? formData.fileInputType : 'link'
                });
              }}
              className="scale-75"
            />
            <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
              📎 Incluir arquivo anexo
            </span>
          </label>
        </div>
        )}

        {/* Campos do arquivo - só aparecem se toggle ativo e tipo for URL */}
        {formData.linkType === 'url' && formData.hasFile && (
          <div className="space-y-0.5 border rounded p-1.5" style={{ borderColor: 'var(--input-border)', background: 'var(--card-background)' }}>
            <div className="flex gap-2 text-xs">
              <label className="flex items-center gap-1">
                <input 
                  type="radio" 
                  name="fileType"
                  checked={formData.fileInputType === 'link'}
                  onChange={() => setFormData({...formData, fileInputType: 'link', attachedFile: null})}
                  className="scale-75"
                />
                <span style={{ color: 'var(--text-primary)' }}>Link</span>
              </label>
              <label className="flex items-center gap-1">
                <input 
                  type="radio" 
                  name="fileType"
                  checked={formData.fileInputType === 'upload'}
                  onChange={() => setFormData({...formData, fileInputType: 'upload', fileUrl: ''})}
                  className="scale-75"
                />
                <span style={{ color: 'var(--text-primary)' }}>Upload</span>
              </label>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                {formData.fileInputType === 'link' ? (
                  <input
                    type="url"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({...formData, fileUrl: e.target.value})}
                    className="w-full px-2 py-0.5 rounded text-xs border"
                    style={{ 
                      background: 'var(--input-background)', 
                      borderColor: 'var(--input-border)', 
                      color: 'var(--text-primary)' 
                    }}
                    placeholder="URL do arquivo"
                  />
                ) : (
                  <input
                    type="file"
                    onChange={(e) => setFormData({...formData, attachedFile: e.target.files?.[0] || null})}
                    className="w-full px-1 py-0.5 rounded text-xs border"
                    style={{ 
                      background: 'var(--input-background)', 
                      borderColor: 'var(--input-border)', 
                      color: 'var(--text-primary)' 
                    }}
                  />
                )}
              </div>
              
              {/* Preview do arquivo */}
              <button
                type="button"
                onClick={onFilePreview}
                disabled={!formData.fileUrl && !formData.attachedFile}
                className="w-10 h-10 border rounded flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
                style={{ borderColor: 'var(--input-border)', background: 'var(--input-background)' }}
              >
                {(formData.fileUrl || formData.attachedFile) ? (
                  <div className="text-center">
                    <div className="text-sm">📎</div>
                    <div className="text-xs leading-tight" style={{ color: 'var(--text-secondary)', fontSize: '8px' }}>
                      {formData.attachedFile ? formData.attachedFile.name.slice(0,6) : 'Link'}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs opacity-50">📄</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Checkboxes */}
        <div className="flex gap-3 pt-1">
          <label className="flex items-center gap-1">
            <input 
              type="checkbox" 
              checked={formData.isPublic}
              onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
              className="scale-75" 
            />
            <span className="text-xs" style={{ color: 'var(--text-primary)' }}>Público</span>
          </label>
          <label className="flex items-center gap-1">
            <input 
              type="checkbox" 
              checked={formData.isFavorite}
              onChange={(e) => setFormData({...formData, isFavorite: e.target.checked})}
              className="scale-75" 
            />
            <span className="text-xs" style={{ color: 'var(--text-primary)' }}>Favorito</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-1.5 px-3 rounded text-sm font-medium transition-colors"
          style={{
            background: '#2563eb',
            color: 'white'
          }}
        >
          {editingLink ? 'Salvar Alterações' : 'Criar Link'}
        </button>
      </form>
    </div>
  );
}