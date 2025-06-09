/**
 * Carousel responsivo
 * – Máx. 4 colunas
 * – Largura mínima do card = 200 px
 * – gap fixo = 16 px
 * – Considera o padding lateral (px-4 → 32 px) para não cortar cards
 */

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

export interface CarouselHandle {
  next: () => void
  prev: () => void
}

/* ---- parâmetros ---- */
const MIN_CARD = 200   // px
const GAP      = 16    // px (gap-4)
const MAX_COLS = 4
const PAD_X    = 32    // px-4 → 16 px de cada lado

function columnsFor(innerWidth: number) {
  /* (+GAP para considerar o espaço à direita) */
  const cols = Math.floor((innerWidth + GAP) / (MIN_CARD + GAP))
  return Math.max(1, Math.min(MAX_COLS, cols))
}

const Carousel = forwardRef<CarouselHandle, { children: React.ReactNode[] }>(
  ({ children }, ref) => {
    const items = Array.isArray(children) ? children : [children]

    const viewportRef = useRef<HTMLDivElement>(null)
    const trackRef    = useRef<HTMLDivElement>(null)

    const [viewportW, setViewportW] = useState(0)   // largura total do wrapper
    const [cols, setCols]           = useState(1)   // colunas visíveis
    const [index, setIndex]         = useState(0)

    /* -------- ResizeObserver -------- */
    useLayoutEffect(() => {
      const el = viewportRef.current
      if (!el) return
      const update = () => {
        const w = el.clientWidth           // inclui padding px-4
        setViewportW(w)
        setCols(columnsFor(w - PAD_X))     // largura interna!
      }
      update()
      const ro = new ResizeObserver(update)
      ro.observe(el)
      return () => ro.disconnect()
    }, [])

    /* -------- navegação -------- */
    const last = Math.max(0, items.length - cols)

    const scrollTo = (i: number) => {
      const el = trackRef.current?.children[i] as HTMLElement | undefined
      el?.scrollIntoView({ behavior: 'smooth', inline: 'start' })
    }
    const next = () => {
      const n = index >= last ? 0 : index + 1
      setIndex(n)
      scrollTo(n)
    }
    const prev = () => {
      const p = index <= 0 ? last : index - 1
      setIndex(p)
      scrollTo(p)
    }

    useImperativeHandle(ref, () => ({ next, prev }))

    useEffect(() => {
      if (index > last) setIndex(0)
      scrollTo(index)
    }, [cols])

    if (!items.length) return null

    /* largura interna realmente disponível */
    const inner = viewportW - PAD_X
    const cardW = (inner - GAP * (cols - 1)) / cols
    const cardH = cardW * 1.04

    return (
      <div ref={viewportRef} className="overflow-hidden px-4">
        <div
          ref={trackRef}
          className="flex overflow-x-auto gap-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
          style={{ scrollPadding: '0 1rem' }}
        >
          {items.map((child, i) => (
            <div
              key={i}
              className="flex-none snap-start rounded-xl overflow-hidden"
              style={{ width: cardW, height: cardH }}
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
