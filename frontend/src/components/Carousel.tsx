import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Carousel({ children }: { children: React.ReactNode[] }) {
  const items = Array.isArray(children) ? children : [children]
  const containerRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  const scrollToIndex = (idx: number) => {
    const container = containerRef.current
    if (!container) return
    const child = container.children[idx] as HTMLElement | undefined
    if (child) {
      child.scrollIntoView({ behavior: 'smooth', inline: 'start' })
    }
  }

  const next = () => {
    const nextIdx = (index + 1) % items.length
    setIndex(nextIdx)
    scrollToIndex(nextIdx)
  }

  const prev = () => {
    const prevIdx = (index - 1 + items.length) % items.length
    setIndex(prevIdx)
    scrollToIndex(prevIdx)
  }

  useEffect(() => {
    scrollToIndex(index)
  }, [index])

  if (!items.length) return null

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 no-scrollbar scroll-smooth"
        style={{ scrollPaddingLeft: '1rem' }}
      >
        {items.map((child, i) => (
          <div
            key={i}
            className="flex-none snap-start min-w-[250px] max-w-[300px] rounded-[1rem]"
          >
            {child}
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <>
          <button
            aria-label="Anterior"
            onClick={prev}
            className="absolute top-1/2 -translate-y-1/2 z-10 left-4 flex items-center justify-center bg-black/30 rounded-full h-10 w-10 text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            aria-label="Próximo"
            onClick={next}
            className="absolute top-1/2 -translate-y-1/2 z-10 right-4 flex items-center justify-center bg-black/30 rounded-full h-10 w-10 text-white"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  )
}

