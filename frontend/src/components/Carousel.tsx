import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Carousel({ children }: { children: React.ReactNode[] }) {
  const [pos, setPos] = useState(0)

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

  useEffect(() => {
    setPos(0)
  }, [visible, count])

  const [skip, setSkip] = useState(false)

  const prev = () => {
    setSkip(false)
    setPos((p) => p - 1)
  }
  const next = () => {
    setSkip(false)
    setPos((p) => p + 1)
  }


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


  const handleEnd = () => {
    if (pos < 0) {
      setSkip(true)
      setPos(pos + count)
    } else if (pos >= count) {
      setSkip(true)
      setPos(pos - count)
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div
        onTransitionEnd={handleEnd}
        className={`flex gap-4 ${skip ? '' : 'transition-transform duration-500 ease-out'}`}
        style={{
          width: `calc(${total} * 100% / ${visible})`,
          transform: `translateX(-${((pos + visible) * 100) / total}%)`,
        }}
      >
        {extended.map((child, i) => (
          <div
            key={i}
            className="flex-none"
            style={{ width: `calc(100% / ${total})` }}
          >
            {child}
          </div>
        ))}
      </div>
      <button
        aria-label="Anterior"
        role="button"
        onClick={prev}
        className="absolute top-1/2 -translate-y-1/2 z-10 left-[-2rem] sm:left-2 bg-black/40 hover:bg-white/20 rounded-full border border-white/10 shadow-lg backdrop-blur-md p-1 cursor-pointer transition-transform hover:scale-105"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        aria-label="Próximo"
        role="button"
        onClick={next}
        className="absolute top-1/2 -translate-y-1/2 z-10 right-[-2rem] sm:right-2 bg-black/40 hover:bg-white/20 rounded-full border border-white/10 shadow-lg backdrop-blur-md p-1 cursor-pointer transition-transform hover:scale-105"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

