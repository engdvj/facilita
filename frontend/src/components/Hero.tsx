import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white py-16 rounded-b-3xl shadow-lg mb-8">

      <motion.div
        className="container text-center px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-heading font-bold mb-2">Bem-vindo ao FACILITA CHVC</h1>
        <p className="text-lg max-w-2xl mx-auto">Encontre rapidamente links úteis e recursos organizados em categorias.</p>
      </motion.div>
    </section>
  )
}
