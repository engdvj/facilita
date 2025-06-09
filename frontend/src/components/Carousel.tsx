import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

export interface CarouselHandle {
  next(): void
  prev(): void
}

interface CarouselProps {
  children: React.ReactNode[]
  onVisibleChange?: (cols: number) => void
}

/* ---- parâmetros visuais ---- */
const CARD_W   = 250      // largura fixa
const CARD_H   = 260      // altura fixa
const GAP      = 16       // gap constante
const MAX_COLS = 4        // 1-4 cartões visíveis

function colsFor(container: number) {
  return Math.max(1, Math.floor((container + GAP) / (CARD_W + GAP)))
}

const Carousel = forwardRef<CarouselHandle, CarouselProps>(
  ({ children, onVisibleChange }, ref) => {
    const items = Array.isArray(children) ? children : [children]

    const wrapperRef = useRef<HTMLDivElement>(null)
    const trackRef   = useRef<HTMLDivElement>(null)

    const [cols,  setCols]  = useState(1)
    const [index, setIndex] = useState(0)

    /* --------- medir wrapper via ResizeObserver --------- */
    useLayoutEffect(() => {
      if (!wrapperRef.current) return

      const obs = new ResizeObserver(([entry]) => {
        const detected = colsFor(entry.contentRect.width)
        const c = Math.min(detected, MAX_COLS)
        setCols(c)
        onVisibleChange?.(c)
      })

      obs.observe(wrapperRef.current)
      return () => obs.disconnect()
    }, [onVisibleChange])

    /* --------- navegação infinita --------- */
    const scrollTo = (i: number) => {
      const node = trackRef.current?.children[i] as HTMLElement | undefined
      if (node && trackRef.current) {
        trackRef.current.scrollTo({
          left: node.offsetLeft,
          behavior: 'smooth',
        })
      }
    }

    const move = (dir: 1 | -1) => {
      const last = Math.max(0, items.length - cols)
      const nxt  = (index + dir + (last + 1)) % (last + 1)
      setIndex(nxt)
      scrollTo(nxt)
    }

    useImperativeHandle(ref, () => ({
      next: () => move(1),
      prev: () => move(-1),
    }))

    /* --------- corrige índice ao mudar layout --------- */
    useEffect(() => {
      const last = Math.max(0, items.length - cols)
      if (index > last) {
        setIndex(0)
        scrollTo(0)
      }
    }, [items.length, cols]) // eslint-disable-line react-hooks/exhaustive-deps

    /* largura total da faixa (todos os cartões + gaps internos) */
    const trackW = items.length * (CARD_W + GAP) - GAP
    /* largura ocupada pelos cartões visíveis (para centragem) */
    const visibleW = cols * (CARD_W + GAP) - GAP

    /* margem lateral para centralizar o bloco visível */
    const padSide =
      wrapperRef.current
        ? Math.max(
            0,
            (wrapperRef.current.clientWidth - visibleW) / 2,
          )
        : 0

    return (
      <div ref={wrapperRef} className="overflow-hidden w-full">
        <div
          ref={trackRef}
          className="flex gap-4 no-scrollbar scroll-smooth"
          style={{
            width: trackW,
            paddingLeft: padSide,
            paddingRight: padSide,
          }}
        >
          {items.map((child, i) => (
            <div
              key={i}
              className="flex-none rounded-xl overflow-hidden"
              style={{ width: CARD_W, height: CARD_H }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    )
  },
)

export default Carousel
