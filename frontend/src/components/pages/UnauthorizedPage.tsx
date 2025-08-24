import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../ui';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Acesso Negado
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Você não possui permissão para acessar esta página. Esta área é restrita a administradores.
        </p>
        
        <div className="space-y-3">
          <Link to="/dashboard">
            <Button className="w-full" icon={<Home size={16} />}>
              Ir para Dashboard
            </Button>
          </Link>
          
          <Button 
            variant="secondary" 
            className="w-full"
            icon={<ArrowLeft size={16} />}
            onClick={() => window.history.back()}
          >
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}