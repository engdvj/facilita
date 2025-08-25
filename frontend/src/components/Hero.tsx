import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="py-1 sm:py-2 lg:py-3 xl:py-3 mb-1 sm:mb-2 lg:mb-3 xl:mb-3">
      <motion.div
        className="container text-center px-4 mx-auto max-w-4xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >

      </motion.div>
    </section>
  )
}
