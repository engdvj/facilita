export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class ValidationBuilder {
  private errors: ValidationError[] = [];
  private currentField: string = '';

  field(fieldName: string): this {
    this.currentField = fieldName;
    return this;
  }

  required(value: any, message: string = 'Este campo é obrigatório'): this {
    if (value === null || value === undefined || value === '') {
      this.errors.push({ field: this.currentField, message });
    }
    return this;
  }

  email(value: string, message: string = 'Email inválido'): this {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      this.errors.push({ field: this.currentField, message });
    }
    return this;
  }

  minLength(value: string, min: number, message?: string): this {
    if (value && value.length < min) {
      const defaultMessage = `Mínimo de ${min} caracteres`;
      this.errors.push({ field: this.currentField, message: message || defaultMessage });
    }
    return this;
  }

  maxLength(value: string, max: number, message?: string): this {
    if (value && value.length > max) {
      const defaultMessage = `Máximo de ${max} caracteres`;
      this.errors.push({ field: this.currentField, message: message || defaultMessage });
    }
    return this;
  }

  url(value: string, message: string = 'URL inválida'): this {
    try {
      if (value) {
        new URL(value);
      }
    } catch {
      this.errors.push({ field: this.currentField, message });
    }
    return this;
  }

  custom(condition: boolean, message: string): this {
    if (condition) {
      this.errors.push({ field: this.currentField, message });
    }
    return this;
  }

  build(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors]
    };
  }
}

export function validate(): ValidationBuilder {
  return new ValidationBuilder();
}

export const commonValidations = {
  user: (data: any): ValidationResult => {
    return validate()
      .field('name')
      .required(data.name)
      .minLength(data.name, 2, 'Nome deve ter pelo menos 2 caracteres')
      .field('email')
      .required(data.email)
      .email(data.email)
      .field('password')
      .required(data.password)
      .minLength(data.password, 6, 'Senha deve ter pelo menos 6 caracteres')
      .build();
  },

  link: (data: any): ValidationResult => {
    return validate()
      .field('title')
      .required(data.title)
      .maxLength(data.title, 100, 'Título deve ter no máximo 100 caracteres')
      .field('url')
      .required(data.url)
      .url(data.url)
      .field('category_id')
      .required(data.category_id, 'Categoria é obrigatória')
      .build();
  },

  category: (data: any): ValidationResult => {
    return validate()
      .field('name')
      .required(data.name)
      .maxLength(data.name, 50, 'Nome deve ter no máximo 50 caracteres')
      .build();
  },

  color: (data: any): ValidationResult => {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    
    return validate()
      .field('name')
      .required(data.name)
      .maxLength(data.name, 30, 'Nome deve ter no máximo 30 caracteres')
      .field('hex_code')
      .required(data.hex_code)
      .custom(!hexColorRegex.test(data.hex_code), 'Código hex inválido (ex: #FF0000)')
      .build();
  }
};