import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Palette, Star, User, Edit3, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeId, ThemeDefinition } from '../../types/theme';
import CustomThemeEditor, { CustomThemeEditorRef } from './CustomThemeEditor';
import { themeService, CustomTheme } from '../../services/themeService';

export default function EnhancedThemeSelector() {
  const { currentThemeId, currentTheme, availableThemes, setTheme, applyTheme } = useTheme();
  const { user } = useAuth();
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState(() => {
    return localStorage.getItem('selectedCustomTheme') || currentThemeId;
  });
  const themeEditorRef = useRef<CustomThemeEditorRef>(null);

  useEffect(() => {
    // Load custom themes for current user
    const userThemes = themeService.getCustomThemes(user?.id);
    setCustomThemes(userThemes);
    
    // Check if current selected theme is custom and still exists
    const selectedCustomTheme = localStorage.getItem('selectedCustomTheme');
    if (selectedCustomTheme) {
      const customTheme = userThemes.find(t => t.id === selectedCustomTheme);
      if (customTheme) {
        applyTheme(customTheme);
        setSelectedThemeId(selectedCustomTheme);
      } else {
        // Custom theme no longer exists, fallback to default
        localStorage.removeItem('selectedCustomTheme');
        setSelectedThemeId(currentThemeId);
      }
    }
  }, [user?.id, currentThemeId]);

  const handleThemeSelect = (theme: ThemeDefinition | CustomTheme, isCustom = false) => {
    if (isCustom) {
      setSelectedThemeId(theme.id);
      localStorage.setItem('selectedCustomTheme', theme.id);
      localStorage.removeItem('selectedTheme'); // Remove default theme selection
      applyTheme(theme);
    } else {
      setTheme(theme.id as ThemeId);
      setSelectedThemeId(theme.id);
      localStorage.removeItem('selectedCustomTheme'); // Remove custom theme selection
    }
  };

  const handleSaveCustomTheme = (theme: CustomTheme) => {
    setCustomThemes(prev => [...prev, theme]);
  };

  const handleDeleteCustomTheme = (themeId: string) => {
    if (themeService.deleteCustomTheme(themeId)) {
      setCustomThemes(prev => prev.filter(t => t.id !== themeId));
      
      // If deleted theme was selected, switch to default
      if (selectedThemeId === themeId) {
        localStorage.removeItem('selectedCustomTheme');
        setTheme('midnight');
        setSelectedThemeId('midnight');
      }
    }
  };

  const handleUpdateCustomTheme = (themeId: string, updatedTheme: CustomTheme) => {
    setCustomThemes(prev => prev.map(t => t.id === themeId ? updatedTheme : t));
  };

  return (
    <div className="space-y-6">
      {/* Theme Selection Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Default Themes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star size={18} style={{ color: 'var(--text-accent)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Temas Padrão
            </h3>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {availableThemes.map((theme) => (
              <CompactThemeCard
                key={theme.id}
                theme={theme}
                isSelected={selectedThemeId === theme.id}
                onSelect={() => handleThemeSelect(theme)}
              />
            ))}
          </div>
        </div>

        {/* Custom Themes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User size={18} style={{ color: 'var(--text-accent)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Meus Temas ({customThemes.length})
            </h3>
          </div>
          
          {customThemes.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {customThemes.map((theme) => (
                <CompactThemeCard
                  key={theme.id}
                  theme={theme}
                  isSelected={selectedThemeId === theme.id}
                  onSelect={() => handleThemeSelect(theme, true)}
                  isCustom
                  onDelete={() => {
                    if (confirm('Tem certeza que deseja excluir este tema?')) {
                      handleDeleteCustomTheme(theme.id);
                    }
                  }}
                  onEdit={() => themeEditorRef.current?.editTheme(theme)}
                />
              ))}
            </div>
          ) : (
            <div 
              className="text-center py-4 rounded-lg border border-dashed"
              style={{ 
                borderColor: 'var(--border-secondary)',
                color: 'var(--text-tertiary)'
              }}
            >
              <Palette size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum tema personalizado</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Theme Editor */}
      <div className="border-t pt-4" style={{ borderColor: 'var(--border-primary)' }}>
        <CustomThemeEditor
          ref={themeEditorRef}
          onSave={handleSaveCustomTheme}
          onDelete={handleDeleteCustomTheme}
          onUpdate={handleUpdateCustomTheme}
          customThemes={customThemes}
        />
      </div>
    </div>
  );
}

interface ThemeCardProps {
  theme: ThemeDefinition | CustomTheme;
  isSelected: boolean;
  onSelect: () => void;
  isCustom?: boolean;
  onDelete?: () => void;
  onEdit?: (theme: CustomTheme) => void;
}

// Compact Theme Card for better space utilization
function CompactThemeCard({ theme, isSelected, onSelect, isCustom = false, onDelete, onEdit }: ThemeCardProps) {
  return (
    <motion.div
      className={`
        relative p-3 rounded-lg border cursor-pointer transition-all duration-200
        ${isSelected ? 'border-2' : 'border hover:border-2'}
      `}
      style={{
        backgroundColor: 'var(--background-elevated)',
        borderColor: isSelected ? 'var(--text-accent)' : 'var(--border-primary)',
      }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        {/* Theme Preview Circle */}
        <div className="relative">
          <div 
            className="w-8 h-8 rounded-full border"
            style={{
              background: `linear-gradient(135deg, ${theme.preview.primary} 0%, ${theme.preview.secondary} 50%, ${theme.preview.accent} 100%)`,
              borderColor: 'var(--border-primary)'
            }}
          />
          {isCustom && (
            <div 
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full border flex items-center justify-center"
              style={{
                backgroundColor: 'var(--text-accent)',
                borderColor: 'var(--background-elevated)'
              }}
            >
              <User size={6} className="text-white" />
            </div>
          )}
        </div>
        
        {/* Theme Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
            {theme.name}
          </h4>
          <p className="text-xs opacity-75 truncate" style={{ color: 'var(--text-tertiary)' }}>
            {theme.description}
          </p>
        </div>
        
        {/* Actions for custom themes */}
        {isCustom && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEdit) {
                    onEdit(theme as CustomTheme);
                  }
                }}
                className="p-1 rounded hover:bg-white/10 transition-colors"
                title="Editar tema"
              >
                <Edit3 size={12} style={{ color: 'var(--text-secondary)' }} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 rounded hover:bg-red-500/20 transition-colors"
                title="Excluir tema"
              >
                <Trash2 size={12} style={{ color: 'var(--error)' }} />
              </button>
            )}
          </div>
        )}
        
        {/* Selection Indicator */}
        {isSelected && (
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--success)' }}
          >
            <Check size={12} className="text-white" strokeWidth={3} />
          </div>
        )}
      </div>
      
      {/* Mini Color Palette */}
      <div className="flex gap-1 mt-2">
        <div 
          className="flex-1 h-1.5 rounded-full"
          style={{ backgroundColor: theme.preview.primary }}
        />
        <div 
          className="flex-1 h-1.5 rounded-full"
          style={{ backgroundColor: theme.preview.secondary }}
        />
        <div 
          className="flex-1 h-1.5 rounded-full"
          style={{ backgroundColor: theme.preview.accent }}
        />
      </div>
    </motion.div>
  );
}

// Keep the original for reference but use compact version
function ThemeCard({ theme, isSelected, onSelect, isCustom = false, onDelete }: ThemeCardProps) {
  return <CompactThemeCard theme={theme} isSelected={isSelected} onSelect={onSelect} isCustom={isCustom} onDelete={onDelete} />;
}