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
    <MainLayout 
      headerProps={{
        showSearchBar: true,
        onSearch: setSearchQuery
      }}
    >
      <div className="min-h-screen w-full">
        {/* Tags de Categoria - Logo abaixo da navbar */}
        <section className="py-4 px-4">
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === null 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/20 text-white/80 hover:bg-white/30'
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/20 text-white/80 hover:bg-white/30'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        {/* Conteúdo principal - Cards ocupando toda a largura */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-4">
          <LinksGrid
            links={filteredAndPaginatedLinks.links}
            loading={loading}
            onLinkClick={handleLinkClick}
            className="w-full"
          />
        </main>
      </div>

      {/* Enhanced Pagination */}
      {filteredAndPaginatedLinks.totalPages > 1 && (
        <section className="flex justify-center py-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2">
            <Pagination
              currentPage={currentPage}
              totalPages={filteredAndPaginatedLinks.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </section>
      )}
    </MainLayout>
  );
}