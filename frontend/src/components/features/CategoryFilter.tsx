import React, { useState } from 'react';
import { ChevronDown, Filter, X } from 'lucide-react';
import { Category } from '../../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  className?: string;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange,
  className = '' 
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCategoryData = selectedCategory 
    ? categories.find(cat => cat.id === selectedCategory)
    : null;

  const handleCategorySelect = (categoryId: number | null) => {
    onCategoryChange(categoryId);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCategoryChange(null);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full px-4 sm:px-6 py-3 sm:py-4
          bg-white/10 backdrop-blur-md border border-white/20 rounded-xl transition-all duration-300 ease-out
          hover:bg-white/15 hover:border-white/40
          text-white font-medium text-base sm:text-lg
          focus:ring-2 focus:ring-blue-400/30 focus:ring-offset-2 focus:ring-offset-transparent
          ${isOpen ? 'bg-white/15 backdrop-blur-lg shadow-xl border-blue-400/30' : ''}
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <div className={`
            p-1 rounded-lg transition-all duration-200
            ${isOpen ? 'bg-blue-400/20 text-blue-300' : 'text-white/70'}
          `}>
            <Filter size={18} />
          </div>
          <span className="truncate">
            {selectedCategoryData ? selectedCategoryData.name : 'Todas as categorias'}
          </span>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {selectedCategory && (
            <button
              onClick={handleClear}
              className="
                p-1.5 rounded-lg
                text-white/50 hover:text-white
                hover:bg-white/20 active:bg-white/25
                transition-all duration-200
                hover:scale-110 active:scale-95
              "
              aria-label="Limpar filtro"
            >
              <X size={14} />
            </button>
          )}
          
          <ChevronDown 
            size={18} 
            className={`
              text-white/70 transition-transform duration-300 ease-out
              ${isOpen ? 'rotate-180' : ''}
            `}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="
            absolute top-full left-0 right-0 mt-2 z-50
            bg-white/15 backdrop-blur-lg border border-white/30 rounded-xl shadow-2xl overflow-hidden
            max-h-64 sm:max-h-72 overflow-y-auto
            animate-slide-down
          ">
            <style jsx>{`
              div::-webkit-scrollbar {
                width: 6px;
              }
              div::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
              }
              div::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 3px;
              }
              div::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.5);
              }
            `}</style>
            {/* All Categories Option */}
            <button
              onClick={() => handleCategorySelect(null)}
              className={`
                w-full px-4 sm:px-6 py-3 text-left
                hover:bg-white/15 active:bg-white/20 transition-all duration-200
                flex items-center space-x-3 group
                ${selectedCategory === null ? 'bg-white/20 text-white' : 'text-white/90'}
              `}
            >
              <div className={`
                p-1 rounded-lg transition-all duration-200
                ${selectedCategory === null ? 'bg-blue-400/20 text-blue-300' : 'text-white/70 group-hover:text-white'}
              `}>
                <Filter size={14} />
              </div>
              <span className="text-sm sm:text-base font-medium">Todas as categorias</span>
            </button>

            {/* Category Divider */}
            {categories.length > 0 && (
              <div className="mx-4 sm:mx-6 my-2 border-t border-white/10" />
            )}

            {/* Individual Categories */}
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`
                  w-full px-4 sm:px-6 py-3 text-left
                  hover:bg-white/15 active:bg-white/20 transition-all duration-200
                  flex items-center justify-between group
                  ${selectedCategory === category.id ? 'bg-white/20 text-white' : 'text-white/90'}
                  animate-slide-left
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {/* Category Color Indicator */}
                  <div 
                    className="w-3 h-3 rounded-full border border-white/30 flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: category.color || '#6B7280' }}
                  />
                  <span className="text-sm sm:text-base font-medium truncate">{category.name}</span>
                </div>
                
                {/* Links Count Badge */}
                {category.links_count !== undefined && category.links_count > 0 && (
                  <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-white/20 rounded-full text-white/80">
                    {category.links_count}
                  </span>
                )}
              </button>
            ))}

            {categories.length === 0 && (
              <div className="px-6 py-8 text-center animate-in fade-in">
                <div className="text-white/60 text-sm">
                  Nenhuma categoria encontrada
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}