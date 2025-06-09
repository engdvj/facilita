
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

export interface CarouselHandle {
  next: () => void
  prev: () => void
}

const Carousel = forwardRef<CarouselHandle, { children: React.ReactNode[] }>(
  ({ children }, ref) => {
    const items = Array.isArray(children) ? children : [children]
    const containerRef = useRef<HTMLDivElement>(null)
    const [index, setIndex] = useState(0)
    const slidesToShow = 4

    const lastIndex = Math.max(0, items.length - slidesToShow)

    const scrollToIndex = (idx: number) => {
      const container = containerRef.current
      if (!container) return
      const child = container.children[idx] as HTMLElement | undefined
      if (child) {
        child.scrollIntoView({ behavior: 'smooth', inline: 'start' })
      }
    }

    const next = () => {
      const nextIdx = index >= lastIndex ? 0 : index + 1
      setIndex(nextIdx)
      scrollToIndex(nextIdx)
    }

    const prev = () => {
      const prevIdx = index <= 0 ? lastIndex : index - 1
      setIndex(prevIdx)
      scrollToIndex(prevIdx)
    }

    useImperativeHandle(ref, () => ({ next, prev }))

    useEffect(() => {
      scrollToIndex(index)
    }, [index])

    useEffect(() => {
      if (index > lastIndex) {
        setIndex(0)
        scrollToIndex(0)
      }
    }, [lastIndex])

    if (!items.length) return null

    return (
      <div
        className="overflow-hidden"
        style={{ maxWidth: 'calc(250px * 4 + 3rem)' }}
      >
        <div
          ref={containerRef}
          className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar scroll-smooth"
          style={{ scrollPaddingLeft: '1rem' }}
        >
          {items.map((child, i) => (
            <div
              key={i}
              className="flex-none snap-start w-[250px] h-[260px] rounded-[1rem]"
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    )
  }
)

export default Carousel


