import { Download, Trash2 } from "lucide-react";
import { FileData } from "../../types/admin";

interface AdminFileListProps {
  files: FileData[];
  onDownload: (file: FileData) => void;
  onDelete: (id: number) => void;
}

export default function AdminFileList({ files, onDownload, onDelete }: AdminFileListProps) {
  if (files.length === 0) {
    return (
      <div className="h-full p-4 rounded-lg border flex items-center justify-center" 
           style={{ background: 'var(--card-background)', borderColor: 'var(--card-border)' }}>
        <p className="text-center" style={{ color: 'var(--text-secondary)' }}>
          Nenhum arquivo encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="h-full p-4 rounded-lg border overflow-y-auto" 
         style={{ 
           background: 'var(--card-background)', 
           borderColor: 'var(--card-border)',
           maxHeight: 'calc(100vh - 200px)' 
         }}>
      <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        Arquivos ({files.length})
      </h3>
      <div className="space-y-1">
        {files.map((file) => (
          <div 
            key={file.id} 
            className="p-1.5 border rounded hover:shadow-sm transition-all duration-200" 
            style={{ borderColor: 'var(--card-border)', background: 'var(--input-background)' }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-xs truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
                  {file.title}
                </h4>
                <p className="text-xs truncate opacity-60 leading-tight" style={{ color: 'var(--text-secondary)' }}>
                  {file.description || 'Sem descrição'}
                </p>
              </div>
              <div className="flex gap-0.5 ml-1">
                <button 
                  className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-green-600 hover:text-green-700"
                  onClick={() => onDownload(file)}
                  title="Download"
                >
                  <Download size={10} />
                </button>
                <button 
                  className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-500 hover:text-red-600"
                  onClick={() => onDelete(file.id)}
                  title="Excluir"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}