import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeId, ThemeDefinition } from '../../types/theme';

interface ThemeSelectorProps {
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ThemeSelector({ 
  showLabels = true, 
  size = 'md',
  className = '' 
}: ThemeSelectorProps) {
  const { currentThemeId, availableThemes, setTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const containerClasses = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4'
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {showLabels && (
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          <Palette size={16} />
          Temas
        </div>
      )}
      
      <div className={`flex flex-wrap ${containerClasses[size]}`}>
        {availableThemes.map((theme) => (
          <ThemeOption
            key={theme.id}
            theme={theme}
            isSelected={currentThemeId === theme.id}
            onSelect={() => setTheme(theme.id as ThemeId)}
            size={size}
            showLabel={showLabels}
          />
        ))}
      </div>
    </div>
  );
}

interface ThemeOptionProps {
  theme: ThemeDefinition;
  isSelected: boolean;
  onSelect: () => void;
  size: 'sm' | 'md' | 'lg';
  showLabel: boolean;
}

function ThemeOption({ theme, isSelected, onSelect, size, showLabel }: ThemeOptionProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-2 cursor-pointer group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
    >
      <div className="relative">
        {/* Theme preview circle with gradient */}
        <div 
          className={`
            ${sizeClasses[size]} 
            rounded-full border-2 transition-all duration-300 relative overflow-hidden
            ${isSelected 
              ? 'border-white shadow-lg shadow-white/20' 
              : 'border-white/30 hover:border-white/60'
            }
          `}
          style={{
            background: `linear-gradient(135deg, ${theme.preview.primary} 0%, ${theme.preview.secondary} 50%, ${theme.preview.accent} 100%)`
          }}
        >
          {/* Selection indicator */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                className="absolute inset-0 bg-black/20 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <Check 
                  size={iconSizes[size]} 
                  className="text-white drop-shadow-lg" 
                  strokeWidth={3}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
        </div>
      </div>
      
      {showLabel && (
        <div className="text-center min-w-0">
          <div 
            className="text-xs font-medium truncate max-w-16"
            style={{ color: isSelected ? 'var(--text-accent)' : 'var(--text-secondary)' }}
          >
            {theme.name}
          </div>
          {size !== 'sm' && (
            <div 
              className="text-xs opacity-70 truncate max-w-20"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {theme.description}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Compact version for headers or smaller spaces
export function CompactThemeSelector({ className = '' }: { className?: string }) {
  return (
    <ThemeSelector 
      showLabels={false} 
      size="sm" 
      className={`flex-row items-center ${className}`}
    />
  );
}

// Large version for settings pages
export function LargeThemeSelector({ className = '' }: { className?: string }) {
  const { availableThemes, currentThemeId, setTheme } = useTheme();

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-3">
        <Palette size={20} style={{ color: 'var(--text-accent)' }} />
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Escolha seu Tema
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableThemes.map((theme) => (
          <motion.div
            key={theme.id}
            className={`
              relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
              ${currentThemeId === theme.id
                ? 'border-white/40 shadow-lg' 
                : 'border-white/10 hover:border-white/25'
              }
            `}
            style={{ 
              backgroundColor: 'var(--background-card)',
              backdropFilter: 'blur(20px)'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTheme(theme.id as ThemeId)}
          >
            {/* Theme preview */}
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-8 h-8 rounded-full border border-white/20"
                style={{
                  background: `linear-gradient(135deg, ${theme.preview.primary} 0%, ${theme.preview.secondary} 50%, ${theme.preview.accent} 100%)`
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
            
            {/* Color palette preview */}
            <div className="flex gap-1 mb-3">
              <div 
                className="flex-1 h-2 rounded-l"
                style={{ backgroundColor: theme.preview.primary }}
              />
              <div 
                className="flex-1 h-2"
                style={{ backgroundColor: theme.preview.secondary }}
              />
              <div 
                className="flex-1 h-2 rounded-r"
                style={{ backgroundColor: theme.preview.accent }}
              />
            </div>
            
            {/* Selection indicator */}
            <AnimatePresence>
              {currentThemeId === theme.id && (
                <motion.div
                  className="absolute top-2 right-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--button-primary)' }}
                  >
                    <Check size={14} className="text-white" strokeWidth={3} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}