import React, { useState } from 'react';
import { ExternalLink, Image as ImageIcon, Bookmark, Star } from 'lucide-react';
import { Link as LinkType } from '../../types';
import { usePerformanceMonitor } from '../../hooks';

interface LinkCardProps {
  link: LinkType;
  onClick?: (link: LinkType) => void;
  className?: string;
  animationDelay?: number;
}

export default function LinkCard({ link, onClick, className = '', animationDelay = 0 }: LinkCardProps) {
  const { markStart, measureEnd } = usePerformanceMonitor('LinkCard');
  const [isLoaded, setIsLoaded] = useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  const handleClick = (e: React.MouseEvent) => {
    markStart('click');
    
    if (onClick) {
      e.preventDefault();
      onClick(link);
    } else {
      // Default behavior: open in new tab
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
    
    measureEnd('click');
  };

  const hasImage = Boolean(link.image_url);
  const hasCategory = Boolean(link.category);
  const cardColor = link.color || 'rgba(99, 102, 241, 0.1)';

  const cardStyle = {
    backgroundImage: hasImage 
      ? `linear-gradient(135deg, ${cardColor}40 0%, ${cardColor}20 100%), url(${link.image_url})`
      : `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}80 100%)`,
    backgroundSize: hasImage ? 'cover, cover' : 'cover',
    backgroundPosition: hasImage ? 'center, center' : 'center',
    backgroundBlendMode: hasImage ? 'overlay, normal' : 'normal',
  };

  return (
    <article
      className={`
        group relative overflow-hidden cursor-pointer
        bg-white/10 backdrop-blur-md border border-white/20 rounded-xl
        hover:bg-white/15 hover:border-white/40 hover:shadow-xl hover:-translate-y-1
        min-h-[200px] sm:min-h-[180px] md:min-h-[200px]
        transform transition-all duration-300 ease-out
        ${isLoaded ? 'animate-fade-in animate-scale-in opacity-100' : 'opacity-0'}
        ${className}
      `}
      style={{
        ...cardStyle,
        animationDelay: `${animationDelay}ms`
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e as any);
        }
      }}
      aria-label={`Acessar ${link.title}`}
    >
      {/* Enhanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      
      {/* Hover Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
      
      {/* Content Container */}
      <div className="relative h-full flex flex-col justify-between p-4 sm:p-5 md:p-6">
        {/* Header Section */}
        <header className="flex items-start justify-between gap-3 mb-4">
          {/* Category Badge */}
          <div className="flex-1 min-w-0">
            {hasCategory && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white/90 mb-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: link.category?.color || '#6366f1' }}
                />
                <span className="truncate">{link.category.name}</span>
              </div>
            )}
          </div>
          
          {/* Action Icon */}
          <div className="flex-shrink-0 p-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 opacity-70 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
            {link.file_url ? (
              <ImageIcon size={16} className="text-white" />
            ) : (
              <ExternalLink size={16} className="text-white" />
            )}
          </div>
        </header>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-end">
          {/* Title */}
          <h3 className="text-heading-sm text-white font-semibold leading-tight line-clamp-2 mb-2 group-hover:text-white transition-colors">
            {link.title}
          </h3>
          
          {/* Description */}
          {link.description && (
            <p className="text-body-sm text-white/70 line-clamp-2 mb-3 group-hover:text-white/80 transition-colors">
              {link.description}
            </p>
          )}
          
          {/* Footer Info */}
          <footer className="flex items-center justify-between text-xs text-white/60 group-hover:text-white/80 transition-colors">
            <div className="flex items-center gap-2">
              {link.clickCount !== undefined && link.clickCount > 0 && (
                <span className="flex items-center gap-1">
                  <Star size={12} className="text-yellow-400" />
                  {link.clickCount}
                </span>
              )}
            </div>
            
            {link.user && (
              <span className="text-white/50">por {link.user.name}</span>
            )}
          </footer>
        </div>
      </div>

      {/* Enhanced Border Glow Effect */}
      <div className="absolute inset-0 rounded-xl border border-transparent bg-gradient-to-r from-white/20 via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Focus Ring */}
      <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-focus:ring-blue-400/50 transition-all duration-300" />
    </article>
  );
}