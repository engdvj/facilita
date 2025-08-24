import React, { useState, useEffect } from 'react';
import { Input, Select, Button, FileInput } from '../ui';
import { LinkFormData, Category, Color, FileItem, User, LinkType, ImageType } from '../../types';
import { DEFAULT_FORM_DATA } from '../../utils/constants';
import { useFileUpload, useValidation } from '../../hooks';
import { commonValidations } from '../../utils/validation';

interface LinkFormProps {
  initialData?: Partial<LinkFormData>;
  isEditing?: boolean;
  isAdmin?: boolean;
  categories: Category[];
  colors: Color[];
  users?: User[];
  files?: FileItem[];
  onSubmit: (data: LinkFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export default function LinkForm({
  initialData,
  isEditing = false,
  isAdmin = false,
  categories,
  colors,
  users = [],
  files = [],
  onSubmit,
  onCancel,
  loading = false
}: LinkFormProps) {
  const [formData, setFormData] = useState<LinkFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData
  });
  
  const [linkType, setLinkType] = useState<LinkType>('link');
  const [imageType, setImageType] = useState<ImageType>('url');
  const [hasFile, setHasFile] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  
  const { uploading, uploadFile } = useFileUpload();
  const { errors, validateForm, clearAllErrors, getFieldError } = useValidation();

  useEffect(() => {
    if (initialData?.file_url && isAdmin) {
      setLinkType('file');
      setHasFile(true);
    }
  }, [initialData, isAdmin]);

  const handleInputChange = (field: keyof LinkFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAllErrors();
    
    // Validate form data
    const isValid = validateForm(formData, commonValidations.link);
    if (!isValid) {
      return;
    }
    
    try {
      const payload = { ...formData };

      // Handle link type logic
      if (linkType === 'file' && isAdmin) {
        payload.url = formData.file_url;
      }

      // Handle file uploads
      if (linkType === 'link' && hasFile && attachmentFile && isAdmin) {
        const fileUrl = await uploadFile(attachmentFile);
        payload.file_url = fileUrl;
      }

      if (imageType === 'file' && imageFile) {
        const imageUrl = await uploadFile(imageFile);
        payload.image_url = imageUrl;
      }

      // Clean up payload
      if (!isAdmin) {
        delete (payload as any).file_url;
        delete (payload as any).user_id;
      }
      if (payload.category_id === null) delete (payload as any).category_id;
      if (!payload.file_url) delete (payload as any).file_url;

      await onSubmit(payload);
      
      // Reset form
      setFormData({ ...DEFAULT_FORM_DATA });
      setImageFile(null);
      setAttachmentFile(null);
      setHasFile(false);
      setLinkType('link');
      setImageType('url');
      clearAllErrors();
      
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    }
  };

  const categoryOptions = categories.map(c => ({
    value: c.id,
    label: c.name
  }));

  const colorOptions = colors.map(c => ({
    value: c.value,
    label: c.name ? `${c.name} - ${c.value}` : c.value,
    style: { backgroundColor: c.value, color: '#000' }
  }));

  const userOptions = users.map(u => ({
    value: u.id,
    label: u.username
  }));

  const fileOptions = files.map(f => ({
    value: f.fileUrl,
    label: `${f.title}${f.category ? ` [${f.category}]` : ''}${f.user ? ` - ${f.user}` : ''}`
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        placeholder="Título"
        value={formData.title}
        onChange={(e) => handleInputChange('title', e.target.value)}
        error={getFieldError('title')}
        required
      />

      {isAdmin && (
        <Select
          options={[
            { value: 'link', label: 'Link' },
            { value: 'file', label: 'Arquivo' }
          ]}
          value={linkType}
          onChange={(e) => setLinkType(e.target.value as LinkType)}
        />
      )}

      {(linkType === 'link' || !isAdmin) ? (
        <Input
          placeholder="URL"
          value={formData.url}
          onChange={(e) => handleInputChange('url', e.target.value)}
          error={getFieldError('url')}
          required
        />
      ) : (
        <Select
          options={fileOptions}
          value={formData.file_url}
          onChange={(e) => {
            const fileUrl = e.target.value;
            const selectedFile = files.find(f => f.fileUrl === fileUrl);
            handleInputChange('file_url', fileUrl);
            if (selectedFile && isAdmin) {
              if (selectedFile.userId) handleInputChange('user_id', selectedFile.userId);
              if (selectedFile.categoryId) handleInputChange('category_id', selectedFile.categoryId);
            }
          }}
          placeholder="Selecionar arquivo"
        />
      )}

      {isAdmin && (
        <Select
          options={userOptions}
          value={formData.user_id || ''}
          onChange={(e) => handleInputChange('user_id', e.target.value ? Number(e.target.value) : null)}
          placeholder="Usuário"
        />
      )}

      <Select
        options={categoryOptions}
        value={formData.category_id || ''}
        onChange={(e) => handleInputChange('category_id', e.target.value ? Number(e.target.value) : null)}
        placeholder="Categoria"
        error={getFieldError('category_id')}
      />

      <Select
        options={colorOptions}
        value={formData.color}
        onChange={(e) => handleInputChange('color', e.target.value)}
        placeholder="Cor do card"
      />

      <Select
        options={[
          { value: 'url', label: 'URL' },
          { value: 'file', label: 'Upload' }
        ]}
        value={imageType}
        onChange={(e) => setImageType(e.target.value as ImageType)}
      />

      {imageType === 'url' ? (
        <Input
          placeholder="URL da imagem"
          value={formData.image_url}
          onChange={(e) => handleInputChange('image_url', e.target.value)}
        />
      ) : (
        <FileInput
          accept="image/*"
          onFileSelect={setImageFile}
          label="Imagem"
        />
      )}

      {isAdmin && linkType === 'link' && (
        <>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={hasFile}
              onChange={(e) => setHasFile(e.target.checked)}
            />
            <span>Possui arquivo</span>
          </label>

          {hasFile && (
            <FileInput
              onFileSelect={setAttachmentFile}
              label="Arquivo anexo"
            />
          )}
        </>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          loading={loading || uploading}
          disabled={!formData.title || (!formData.url && !formData.file_url)}
        >
          {isEditing ? 'Salvar' : 'Adicionar'}
        </Button>

        {isEditing && onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}