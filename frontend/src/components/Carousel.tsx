import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Carousel({ children }: { children: React.ReactNode[] }) {
  const [index, setIndex] = useState(0)
  const count = children.length

  const prev = () => setIndex((index - 1 + count) % count)
  const next = () => setIndex((index + 1) % count)

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex transition-transform"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {children.map((child, i) => (
          <div key={i} className="min-w-full px-4">
            {child}
          </div>
        ))}
      </div>
      {count > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 dark:bg-slate-700/80"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 dark:bg-slate-700/80"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  )
}
