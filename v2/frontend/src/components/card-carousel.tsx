'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type CardCarouselProps = {
  items: ReactNode[];
  threshold?: number;
};

const itemWidthClassName = 'w-full sm:w-[calc((100%-1rem)/2)] xl:w-[calc((100%-2rem)/3)]';

export default function CardCarousel({
  items,
  threshold = 3,
}: CardCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const useCarousel = items.length > threshold;
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(useCarousel);

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
    const nextCanScrollLeft = viewport.scrollLeft > 4;
    const nextCanScrollRight = maxScrollLeft - viewport.scrollLeft > 4;

    setCanScrollLeft(nextCanScrollLeft);
    setCanScrollRight(nextCanScrollRight);
  }, []);

  const scrollByPage = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const amount = Math.max(viewport.clientWidth - 72, 260);
    viewport.scrollBy({
      left: amount * direction,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (!useCarousel) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    updateScrollState();
    const handleResize = () => updateScrollState();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [items.length, updateScrollState, useCarousel]);

  if (!useCarousel) {
    return (
      <div className="flex flex-wrap gap-4">
        {items.map((item, index) => (
          <div key={index} className={itemWidthClassName}>
            {item}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className={cn(
            'fac-button-secondary !h-9 !w-9 !px-0 transition-colors',
            canScrollLeft
              ? '!border-foreground !bg-foreground !text-background hover:!border-foreground hover:!bg-foreground/90 hover:!text-background'
              : '',
          )}
          onClick={() => scrollByPage(-1)}
          aria-label="Rolar para a esquerda"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          className={cn(
            'fac-button-secondary !h-9 !w-9 !px-0 transition-colors',
            canScrollRight
              ? '!border-foreground !bg-foreground !text-background hover:!border-foreground hover:!bg-foreground/90 hover:!text-background'
              : '',
          )}
          onClick={() => scrollByPage(1)}
          aria-label="Rolar para a direita"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div
        ref={viewportRef}
        onScroll={updateScrollState}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <div key={index} className={`snap-start shrink-0 ${itemWidthClassName}`}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
