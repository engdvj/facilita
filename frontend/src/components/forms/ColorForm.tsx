import React, { useState } from 'react';
import { Input, Button } from '../ui';
import { Color } from '../../types';
import { useValidation } from '../../hooks';
import { commonValidations } from '../../utils/validation';

interface ColorFormProps {
  initialData?: Partial<Color>;
  isEditing?: boolean;
  onSubmit: (data: Partial<Color>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export default function ColorForm({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel,
  loading = false
}: ColorFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    hex_code: initialData?.value || '#ffffff'
  });

  const { errors, validateForm, clearAllErrors, getFieldError } = useValidation();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAllErrors();
    
    const isValid = validateForm(formData, commonValidations.color);
    if (!isValid) {
      return;
    }
    
    try {
      const payload = {
        name: formData.name,
        value: formData.hex_code
      };
      
      await onSubmit(payload);
      
      // Reset form if not editing
      if (!isEditing) {
        setFormData({
          name: '',
          hex_code: '#ffffff'
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
        placeholder="Nome da cor"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        error={getFieldError('name')}
        required
      />

      <div className="flex gap-2 items-center">
        <Input
          type="color"
          value={formData.hex_code}
          onChange={(e) => handleInputChange('hex_code', e.target.value)}
          className="w-16 h-10 p-1 rounded border cursor-pointer"
        />
        <Input
          placeholder="#ffffff"
          value={formData.hex_code}
          onChange={(e) => handleInputChange('hex_code', e.target.value)}
          error={getFieldError('hex_code')}
          required
        />
      </div>

      {formData.hex_code && (
        <div 
          className="h-8 rounded border"
          style={{ backgroundColor: formData.hex_code }}
          title={`Preview: ${formData.hex_code}`}
        />
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          loading={loading}
          disabled={!formData.name || !formData.hex_code}
        >
          {isEditing ? 'Salvar' : 'Criar cor'}
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