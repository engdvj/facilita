import React from 'react';
import { Link } from '../../types';
import LinkCard from './LinkCard';
import { SkeletonCard } from '../ui';
import { useVirtualScroll, usePerformanceMonitor } from '../../hooks';

interface LinksGridProps {
  links: Link[];
  loading?: boolean;
  onLinkClick?: (link: Link) => void;
  className?: string;
  enableVirtualization?: boolean;
  itemsPerRow?: number;
}

export default function LinksGrid({ 
  links, 
  loading = false,
  onLinkClick,
  className = '',
  enableVirtualization = false,
  itemsPerRow = 4
}: LinksGridProps) {
  const { markStart, measureEnd } = usePerformanceMonitor('LinksGrid');
  
  React.useEffect(() => {
    markStart('render');
    return () => measureEnd('render');
  }, [links, markStart, measureEnd]);

  if (loading) {
    return (
      <div className={`grid-responsive ${className}`}>
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            <SkeletonCard />
          </div>
        ))}
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 sm:py-20 ${className}`}>
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="animate-scale-in">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-heading-md text-white mb-2">Nenhum link encontrado</h3>
            <p className="text-body-md text-white/70 leading-relaxed">
              Não encontramos links que correspondam aos seus critérios de busca. 
              Tente ajustar os filtros ou termos de busca.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Regular grid rendering (most common case)
  if (!enableVirtualization || links.length < 50) {
    return (
      <div className={`
        grid-responsive
        ${className}
      `}>
        {links.map((link, index) => (
          <LinkCard
            key={link.id}
            link={link}
            onClick={onLinkClick}
            animationDelay={Math.min(index * 100, 800)}
            className=""
          />
        ))}
      </div>
    );
  }

  // Virtual scrolling for large datasets
  return <VirtualLinksGrid links={links} onLinkClick={onLinkClick} className={className} />;
}

// Virtualized version for large datasets
function VirtualLinksGrid({ 
  links, 
  onLinkClick,
  className = ''
}: {
  links: Link[];
  onLinkClick?: (link: Link) => void;
  className?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = React.useState(800);
  
  const itemHeight = 200; // Approximate height of each card
  const { visibleItems, totalHeight, onScroll } = useVirtualScroll(
    links, 
    itemHeight, 
    containerHeight,
    5 // overscan
  );

  React.useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={onScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleItems.map(({ item: link, index, offsetY }) => (
            <div
              key={link.id}
              style={{
                position: 'absolute',
                top: Math.floor(index / 4) * itemHeight,
                left: `${(index % 4) * 25}%`,
                width: '23%'
              }}
            >
              <LinkCard
                link={link}
                onClick={onLinkClick}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}