import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="py-1 sm:py-2 lg:py-3 xl:py-3 mb-1 sm:mb-2 lg:mb-3 xl:mb-3">
      <motion.div
        className="container text-center px-4 mx-auto max-w-4xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-heading font-bold mb-1 lg:mb-2">FACILITA</h3>
        <p className="text-xs sm:text-sm md:text-base max-w-2xl mx-auto" style={{ color: 'var(--text-color)' }}>
          Links organizados por categoria
        </p>
      </motion.div>
    </section>
  )
}
