import React, { useState } from 'react';
import { Input, Button } from '../ui';
import { Category } from '../../types';
import { useValidation } from '../../hooks';
import { commonValidations } from '../../utils/validation';

interface CategoryFormProps {
  initialData?: Partial<Category>;
  isEditing?: boolean;
  onSubmit: (data: Partial<Category>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export default function CategoryForm({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel,
  loading = false
}: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || ''
  });

  const { errors, validateForm, clearAllErrors, getFieldError } = useValidation();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAllErrors();
    
    const isValid = validateForm(formData, commonValidations.category);
    if (!isValid) {
      return;
    }
    
    try {
      await onSubmit(formData);
      
      // Reset form if not editing
      if (!isEditing) {
        setFormData({
          name: '',
          description: ''
        });
        clearAllErrors();
      }
      
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        placeholder="Nome da categoria"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        error={getFieldError('name')}
        required
      />

      <Input
        placeholder="Descrição (opcional)"
        value={formData.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        error={getFieldError('description')}
      />

      <div className="flex gap-2">
        <Button
          type="submit"
          loading={loading}
          disabled={!formData.name}
        >
          {isEditing ? 'Salvar' : 'Criar categoria'}
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