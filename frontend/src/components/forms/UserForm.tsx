import React, { useState } from 'react';
import { Input, Button } from '../ui';
import { User } from '../../types';
import { useValidation } from '../../hooks';
import { commonValidations } from '../../utils/validation';

interface UserFormProps {
  initialData?: Partial<User>;
  isEditing?: boolean;
  onSubmit: (data: Partial<User>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export default function UserForm({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel,
  loading = false
}: UserFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    username: initialData?.username || '',
    email: initialData?.email || '',
    password: '',
    theme: initialData?.theme || 'light',
    is_admin: initialData?.is_admin || false
  });

  const { errors, validateForm, clearAllErrors, getFieldError } = useValidation();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAllErrors();
    
    const isValid = validateForm(formData, commonValidations.user);
    if (!isValid) {
      return;
    }
    
    try {
      const payload = { ...formData };
      
      // Remove password if empty and editing
      if (isEditing && !payload.password) {
        delete (payload as any).password;
      }

      await onSubmit(payload);
      
      // Reset form if not editing
      if (!isEditing) {
        setFormData({
          name: '',
          username: '',
          email: '',
          password: '',
          theme: 'light',
          is_admin: false
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
        placeholder="Nome completo"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        error={getFieldError('name')}
        required
      />

      <Input
        placeholder="Nome de usuário"
        value={formData.username}
        onChange={(e) => handleInputChange('username', e.target.value)}
        error={getFieldError('username')}
        required
      />

      <Input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        error={getFieldError('email')}
        required
      />

      <Input
        type="password"
        placeholder={isEditing ? "Nova senha (deixe vazio para manter)" : "Senha"}
        value={formData.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        error={getFieldError('password')}
        required={!isEditing}
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_admin"
          checked={formData.is_admin}
          onChange={(e) => handleInputChange('is_admin', e.target.checked)}
        />
        <label htmlFor="is_admin" className="text-sm">
          Administrador
        </label>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          loading={loading}
          disabled={!formData.name || !formData.username || !formData.email || (!isEditing && !formData.password)}
        >
          {isEditing ? 'Salvar' : 'Criar usuário'}
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