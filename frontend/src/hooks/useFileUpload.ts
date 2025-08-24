import { useState, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

interface UseFileUploadReturn {
  uploading: boolean;
  uploadFile: (file: File) => Promise<string>;
  uploadProgress: number;
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    if (!file) {
      throw new Error('Arquivo não fornecido');
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        },
      });

      toast.success('Arquivo enviado com sucesso');
      return response.data.url;
    } catch (error) {
      toast.error('Erro ao enviar arquivo');
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  return {
    uploading,
    uploadFile,
    uploadProgress,
  };
}