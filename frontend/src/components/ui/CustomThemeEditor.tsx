import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Trash2, Edit3, Palette, Eye } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeColors, ThemeDefinition, ThemeId } from '../../types/theme';
import { themeService, CustomTheme } from '../../services/themeService';

// Remove duplicate interface definition as it's now imported from themeService

interface CustomThemeEditorProps {
  onSave?: (theme: CustomTheme) => void;
  onDelete?: (themeId: string) => void;
  customThemes?: CustomTheme[];
}

const defaultCustomTheme: ThemeColors = {
  backgroundMain: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
  backgroundCard: 'rgba(30, 41, 59, 0.8)',
  backgroundElevated: 'rgba(51, 65, 85, 0.9)',
  
  textPrimary: 'rgba(255, 255, 255, 0.95)',
  textSecondary: 'rgba(255, 255, 255, 0.75)',
  textTertiary: 'rgba(255, 255, 255, 0.6)',
  textAccent: '#60a5fa',
  
  borderPrimary: 'rgba(255, 255, 255, 0.1)',
  borderSecondary: 'rgba(255, 255, 255, 0.05)',
  
  buttonPrimary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  buttonPrimaryHover: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
  buttonSecondary: 'rgba(59, 130, 246, 0.1)',
  buttonSecondaryHover: 'rgba(59, 130, 246, 0.2)',
  
  sidebarBackground: 'rgba(15, 23, 42, 0.95)',
  sidebarText: 'rgba(255, 255, 255, 0.8)',
  sidebarActiveBackground: 'rgba(59, 130, 246, 0.2)',
  
  headerBackground: 'rgba(15, 23, 42, 0.9)',
  headerText: 'rgba(255, 255, 255, 0.95)',
  
  linkBackground: 'rgba(59, 130, 246, 0.1)',
  linkText: 'rgba(255, 255, 255, 0.9)',
  linkHover: 'rgba(59, 130, 246, 0.2)',
  
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
};

const colorGroups = [
  {
    title: 'Fundos',
    colors: ['backgroundMain', 'backgroundCard', 'backgroundElevated']
  },
  {
    title: 'Textos',
    colors: ['textPrimary', 'textSecondary', 'textTertiary', 'textAccent']
  },
  {
    title: 'Bordas',
    colors: ['borderPrimary', 'borderSecondary']
  },
  {
    title: 'Botões',
    colors: ['buttonPrimary', 'buttonPrimaryHover', 'buttonSecondary', 'buttonSecondaryHover']
  },
  {
    title: 'Sidebar',
    colors: ['sidebarBackground', 'sidebarText', 'sidebarActiveBackground']
  },
  {
    title: 'Header',
    colors: ['headerBackground', 'headerText']
  },
  {
    title: 'Links',
    colors: ['linkBackground', 'linkText', 'linkHover']
  },
  {
    title: 'Status',
    colors: ['success', 'warning', 'error', 'info']
  }
];

export default function CustomThemeEditor({ onSave, onDelete, customThemes = [] }: CustomThemeEditorProps) {
  const { currentTheme, applyTheme } = useTheme();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [themeName, setThemeName] = useState('');
  const [themeDescription, setThemeDescription] = useState('');
  const [editingColors, setEditingColors] = useState<ThemeColors>(defaultCustomTheme);
  const [previewMode, setPreviewMode] = useState(false);

  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    setEditingColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };

  const extractColorFromString = (colorString: string): string => {
    // Extract hex color from gradients or rgba strings
    const hexMatch = colorString.match(/#[0-9A-Fa-f]{6}/);
    if (hexMatch) return hexMatch[0];
    
    // For rgba, convert to approximate hex
    const rgbaMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbaMatch) {
      const [, r, g, b] = rgbaMatch;
      return `#${[r, g, b].map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('')}`;
    }
    
    return '#3b82f6'; // fallback
  };

  const handleSaveTheme = () => {
    if (!themeName.trim()) return;
    
    try {
      const customTheme = themeService.saveCustomTheme({
        name: themeName,
        description: themeDescription || 'Tema personalizado',
        colors: editingColors,
        preview: {
          primary: extractColorFromString(editingColors.backgroundMain),
          secondary: extractColorFromString(editingColors.buttonPrimary),
          accent: extractColorFromString(editingColors.textAccent)
        }
      }, user?.id);
      
      onSave?.(customTheme);
      
      // Reset form
      setThemeName('');
      setThemeDescription('');
      setEditingColors(defaultCustomTheme);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save theme:', error);
      // Could show a toast notification here
    }
  };

  const handleDeleteTheme = (themeId: string) => {
    if (themeService.deleteCustomTheme(themeId)) {
      onDelete?.(themeId);
    }
  };

  const handlePreviewTheme = () => {
    if (previewMode) {
      // Restore original theme
      applyTheme(currentTheme);
      setPreviewMode(false);
    } else {
      // Apply preview theme
      const previewTheme: ThemeDefinition = {
        id: 'preview',
        name: 'Preview',
        description: 'Preview',
        colors: editingColors,
        preview: { primary: '#000', secondary: '#000', accent: '#000' }
      };
      applyTheme(previewTheme);
      setPreviewMode(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Custom Theme Creator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Edit3 size={18} />
            Criar Tema Personalizado
          </h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-2 text-sm rounded-lg transition-all hover:scale-105"
            style={{
              backgroundColor: isEditing ? 'var(--error)' : 'var(--button-primary)',
              color: 'white'
            }}
          >
            {isEditing ? 'Cancelar' : 'Novo Tema'}
          </button>
        </div>

        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border rounded-xl p-6 space-y-4"
            style={{
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--background-elevated)'
            }}
          >
            {/* Theme Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Nome do Tema
                </label>
                <input
                  type="text"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  placeholder="Ex: Meu Tema Azul"
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--background-card)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Descrição
                </label>
                <input
                  type="text"
                  value={themeDescription}
                  onChange={(e) => setThemeDescription(e.target.value)}
                  placeholder="Descrição opcional"
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--background-card)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            {/* Color Groups - More Compact */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {colorGroups.map((group) => (
                <div key={group.title} className="space-y-2">
                  <h4 className="font-medium text-xs uppercase tracking-wide" style={{ color: 'var(--text-accent)' }}>
                    {group.title}
                  </h4>
                  <div className="space-y-1">
                    {group.colors.map((colorKey) => (
                      <div key={colorKey} className="flex items-center gap-2">
                        <input
                          type="color"
                          value={extractColorFromString(editingColors[colorKey as keyof ThemeColors])}
                          onChange={(e) => handleColorChange(colorKey as keyof ThemeColors, e.target.value)}
                          className="w-6 h-6 rounded border cursor-pointer"
                          style={{ borderColor: 'var(--border-primary)' }}
                        />
                        <span className="text-xs flex-1" style={{ color: 'var(--text-secondary)' }}>
                          {colorKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <button
                onClick={handlePreviewTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: previewMode ? 'var(--warning)' : 'var(--info)',
                  color: 'white'
                }}
              >
                <Eye size={16} />
                {previewMode ? 'Parar Preview' : 'Visualizar'}
              </button>
              
              <button
                onClick={handleSaveTheme}
                disabled={!themeName.trim()}
                className="flex items-center gap-2 px-6 py-2 rounded-lg transition-all hover:scale-105 disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--success)',
                  color: 'white'
                }}
              >
                <Save size={16} />
                Salvar Tema
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Custom Themes List */}
      {customThemes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Palette size={20} />
            Meus Temas ({customThemes.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customThemes.map((theme) => (
              <motion.div
                key={theme.id}
                className="relative p-4 rounded-xl border transition-all hover:scale-[1.02]"
                style={{
                  borderColor: 'var(--border-primary)',
                  backgroundColor: 'var(--background-card)'
                }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full border"
                      style={{
                        background: `linear-gradient(135deg, ${theme.preview.primary} 0%, ${theme.preview.secondary} 50%, ${theme.preview.accent} 100%)`,
                        borderColor: 'var(--border-primary)'
                      }}
                    />
                    <div>
                      <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {theme.name}
                      </h4>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {theme.description}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteTheme(theme.id)}
                    className="p-2 rounded-lg transition-colors hover:scale-105"
                    style={{
                      color: 'var(--error)',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)'
                    }}
                    title="Excluir tema"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}