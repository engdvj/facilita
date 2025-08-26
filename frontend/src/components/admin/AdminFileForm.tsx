import { useState } from "react";
import { Upload, X, Eye } from "lucide-react";
import { Category } from "../../types/admin";
import ActionButton from "../common/ActionButton";

interface FileFormData {
  title: string;
  description: string;
  categoryId: string;
  fileUrl: string;
  attachedFile: File | null;
  fileInputType: 'link' | 'upload';
}

interface AdminFileFormProps {
  formData: FileFormData;
  setFormData: (data: FileFormData) => void;
  categories: Category[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onFilePreview?: () => void;
  editingFile?: any;
}

export default function AdminFileForm({ 
  formData, 
  setFormData, 
  categories, 
  onSubmit, 
  onCancel, 
  onFilePreview,
  editingFile 
}: AdminFileFormProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({
      ...formData,
      attachedFile: file,
      title: file ? file.name.split('.')[0] : formData.title
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setFormData({
        ...formData,
        attachedFile: file,
        title: file ? file.name.split('.')[0] : formData.title
      });
    }
  };

  const removeFile = () => {
    setFormData({
      ...formData,
      attachedFile: null
    });
  };

  return (
    <div className="p-4 rounded-lg border" style={{ 
      background: 'var(--card-background)', 
      borderColor: 'var(--card-border)',
      height: 'fit-content',
      maxHeight: 'calc(100vh - 200px)',
      overflow: 'auto'
    }}>
      <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        {editingFile ? 'Editar Arquivo' : 'Upload de Arquivo'}
      </h3>
      
      <form onSubmit={onSubmit} className="space-y-3">
        {/* Título */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Título *
          </label>
          <input 
            type="text" 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-2 py-1.5 rounded border text-xs" 
            style={{ 
              background: 'var(--input-background)', 
              borderColor: 'var(--input-border)', 
              color: 'var(--text-primary)' 
            }} 
            placeholder="Nome do arquivo" 
            required
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Descrição
          </label>
          <textarea 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-2 py-1.5 rounded border h-8 text-xs" 
            style={{ 
              background: 'var(--input-background)', 
              borderColor: 'var(--input-border)', 
              color: 'var(--text-primary)' 
            }} 
            placeholder="Descrição opcional do arquivo"
          />
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Categoria
          </label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
            className="w-full px-2 py-1.5 rounded border text-xs"
            style={{ 
              background: 'var(--input-background)', 
              borderColor: 'var(--input-border)', 
              color: 'var(--text-primary)' 
            }}
          >
            <option value="">Selecione uma categoria</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Input do Arquivo */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Arquivo *
          </label>
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              className={`px-2 py-1 rounded text-xs ${
                formData.fileInputType === 'upload' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setFormData({...formData, fileInputType: 'upload'})}
            >
              Upload
            </button>
            <button
              type="button"
              className={`px-2 py-1 rounded text-xs ${
                formData.fileInputType === 'link' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setFormData({...formData, fileInputType: 'link'})}
            >
              Link
            </button>
          </div>

          {formData.fileInputType === 'upload' ? (
            <div>
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  dragOver ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
              >
                {formData.attachedFile ? (
                  <div className="flex items-center justify-between p-1.5 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                      {formData.attachedFile.name}
                    </span>
                    <div className="flex gap-1">
                      {onFilePreview && (
                        <button
                          type="button"
                          onClick={onFilePreview}
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="Visualizar"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-1 text-red-600 hover:text-red-700"
                        title="Remover"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Arraste um arquivo aqui ou clique para selecionar
                    </p>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="mt-2 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.fileUrl}
                onChange={(e) => setFormData({...formData, fileUrl: e.target.value})}
                className="flex-1 px-2 py-1.5 rounded border text-xs"
                style={{ 
                  background: 'var(--input-background)', 
                  borderColor: 'var(--input-border)', 
                  color: 'var(--text-primary)' 
                }}
                placeholder="https://exemplo.com/arquivo.pdf"
                required={formData.fileInputType === 'link'}
              />
              {formData.fileUrl && onFilePreview && (
                <button
                  type="button"
                  onClick={onFilePreview}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Visualizar"
                >
                  <Eye size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-2 pt-2">
          <ActionButton
            type="submit"
            variant="primary"
            size="sm"
            className="flex-1 text-xs"
            style={{ background: '#16a34a', padding: '6px 12px' }}
          >
            {editingFile ? 'Atualizar' : 'Upload'} Arquivo
          </ActionButton>
          <ActionButton
            type="button"
            variant="secondary"
            size="sm"
            className="text-xs"
            style={{ padding: '6px 12px' }}
            onClick={onCancel}
          >
            Cancelar
          </ActionButton>
        </div>
      </form>
    </div>
  );
}