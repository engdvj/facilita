import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Carousel({ children }: { children: React.ReactNode[] }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(4)
  const items = Array.isArray(children) ? children : [children]
  const count = items.length

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w >= 1024) setVisible(4)
      else if (w >= 768) setVisible(3)
      else if (w >= 500) setVisible(2)
      else setVisible(1)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const prev = () => setIndex((index - 1 + count) % count)
  const next = () => setIndex((index + 1) % count)

  if (count <= visible) {
    return (
      <div className="flex justify-center gap-4">
        {items.map((child, i) => (
          <div key={i} className="w-full max-w-xs flex-none">
            {child}
          </div>
        ))}
      </div>
    )
  }

  const extended = [
    ...items.slice(count - visible),
    ...items,
    ...items.slice(0, visible),
  ]
  const total = extended.length

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex transition-transform"
        style={{
          width: `calc(${total} * 100% / ${visible})`,
          transform: `translateX(-${((index + visible) * 100) / total}%)`,
        }}
      >
        {extended.map((child, i) => (
          <div
            key={i}
            className="px-2 flex-none"
            style={{ width: `calc(100% / ${visible})` }}
          >
            {child}
          </div>
        ))}
      </div>
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
    </div>
  )
}
