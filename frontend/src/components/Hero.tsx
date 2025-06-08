import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="py-8 mb-6">
      <motion.div
        className="container text-center px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-heading font-bold mb-1">Bem-vindo ao FACILITA CHVC</h1>
        <p className="text-base max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
          Encontre rapidamente links úteis e recursos organizados em categorias.
        </p>
      </motion.div>
    </section>
  )
}
