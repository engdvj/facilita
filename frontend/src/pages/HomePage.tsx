import React, { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '../components/layout';
import { SearchBar, CategoryFilter, LinksGrid } from '../components/features';
import { Pagination } from '../components/common';
import { Link, Category } from '../types';
import { linksApi, categoriesApi } from '../services';
import { useDebounce, usePerformanceMonitor } from '../hooks';

const LINKS_PER_PAGE = 12;

export default function HomePage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { markStart, measureEnd } = usePerformanceMonitor('HomePage');

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      markStart('data-load');
      setLoading(true);
      
      try {
        const [linksResponse, categoriesResponse] = await Promise.all([
          linksApi.getAll(),
          categoriesApi.getAll()
        ]);
        
        setLinks(linksResponse.data || []);
        setCategories(categoriesResponse.data || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
        measureEnd('data-load');
      }
    };

    loadData();
  }, [markStart, measureEnd]);

  // Filter and paginate links
  const filteredAndPaginatedLinks = useMemo(() => {
    let filtered = links;

    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(link => 
        link.title.toLowerCase().includes(query) ||
        link.category?.name.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(link => link.category?.id === selectedCategory);
    }

    // Sort alphabetically
    filtered.sort((a, b) => a.title.localeCompare(b.title));

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / LINKS_PER_PAGE);
    const startIndex = (currentPage - 1) * LINKS_PER_PAGE;
    const paginatedLinks = filtered.slice(startIndex, startIndex + LINKS_PER_PAGE);

    return {
      links: paginatedLinks,
      totalLinks: filtered.length,
      totalPages,
      hasResults: filtered.length > 0
    };
  }, [links, debouncedSearchQuery, selectedCategory, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedCategory]);

  const handleLinkClick = (link: Link) => {
    // Track link click if analytics needed
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <header className="text-center space-y-6 sm:space-y-8 mb-8 sm:mb-12">
          <div className="animate-scale-in">
            <h1 className="text-display-lg sm:text-display-xl text-white mb-4 sm:mb-6">
              FACILITA{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300">
                CHVC
              </span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full mb-6" />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
            <p className="text-body-lg sm:text-heading-sm text-white/85 max-w-3xl mx-auto leading-relaxed px-4">
              Seu portal centralizado para acesso rápido e organizado aos recursos 
              e sistemas do{' '}
              <span className="text-blue-300 font-semibold">Centro Hospitalar Virtual Completo</span>
            </p>
          </div>
        </header>

        {/* Search and Filter Section */}
        <section className="container-lg space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Buscar por título ou categoria..."
              className="mb-4 sm:mb-6"
            />
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 animate-slide-up" style={{ animationDelay: '450ms' }}>
            <div className="flex-1">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
            
            {/* Enhanced Results Summary */}
            {!loading && (
              <div className="flex items-center justify-center lg:justify-end">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-body-sm sm:text-body-md text-white/85 font-medium">
                      {filteredAndPaginatedLinks.totalLinks}{' '}
                      {filteredAndPaginatedLinks.totalLinks === 1 ? 'resultado' : 'resultados'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Links Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <LinksGrid
            links={filteredAndPaginatedLinks.links}
            loading={loading}
            onLinkClick={handleLinkClick}
            className="min-h-[400px] sm:min-h-[500px]"
          />
        </section>

        {/* Enhanced Pagination */}
        {filteredAndPaginatedLinks.totalPages > 1 && (
          <section className="flex justify-center mt-8 sm:mt-12 animate-slide-up" style={{ animationDelay: '750ms' }}>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2">
              <Pagination
                currentPage={currentPage}
                totalPages={filteredAndPaginatedLinks.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </section>
        )}

        {/* Enhanced Empty State */}
        {!loading && !filteredAndPaginatedLinks.hasResults && (debouncedSearchQuery || selectedCategory) && (
          <section className="text-center py-16 sm:py-20 animate-scale-in">
            <div className="max-w-sm mx-auto px-4">
              <div className="bg-white/15 backdrop-blur-lg border border-white/30 rounded-xl p-8 sm:p-12 space-y-6 sm:space-y-8">
                <div className="space-y-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center animate-float">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-heading-md text-white">Nenhum resultado encontrado</h3>
                  <p className="text-body-lg text-white/75 leading-relaxed max-w-md mx-auto">
                    Não encontramos links que correspondam aos seus critérios. 
                    Tente ajustar sua busca ou filtros.
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-3 text-white font-medium hover:bg-white/20 hover:scale-105 hover:shadow-lg transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Limpar filtros
                  </span>
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}