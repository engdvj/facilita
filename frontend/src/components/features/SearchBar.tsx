import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useDebouncedCallback } from '../../hooks';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Buscar links...",
  debounceMs = 300,
  className = '' 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const debouncedSearch = useDebouncedCallback(onSearch, debounceMs);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  return (
    <div className={`relative w-full ${className}`}>
      <div className={`
        relative flex items-center w-full
        bg-white/10 backdrop-blur-md border border-white/20 rounded-xl transition-all duration-300 ease-out
        ${isFocused ? 'bg-white/15 backdrop-blur-lg shadow-xl border-blue-400/30' : 'hover:bg-white/12'}
        focus-within:ring-2 focus-within:ring-blue-400/30 focus-within:ring-offset-2 focus-within:ring-offset-transparent
      `}>
        {/* Search Icon */}
        <div className="absolute left-4 sm:left-5 z-10">
          <div className={`
            p-1 rounded-lg transition-all duration-200
            ${isFocused ? 'bg-blue-400/20 text-blue-300' : 'text-white/60'}
          `}>
            <Search size={18} />
          </div>
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="
            w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-3 sm:py-4 bg-transparent
            text-white placeholder-white/50
            focus:outline-none focus:ring-0
            text-base sm:text-lg font-medium
            transition-all duration-200
          "
          aria-label="Buscar links"
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className="
              absolute right-4 sm:right-5 z-10
              p-1.5 rounded-lg
              text-white/50 hover:text-white
              hover:bg-white/15 active:bg-white/20
              transition-all duration-200
              hover:scale-110 active:scale-95
            "
            aria-label="Limpar busca"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Enhanced Search Feedback */}
      {query && isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-slide-down">
          <div className="bg-white/15 backdrop-blur-lg border border-white/30 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <p className="text-body-sm text-white/80">
                Buscando por: 
                <span className="text-white font-semibold ml-1">"{query}"</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}