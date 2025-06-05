import { motion } from 'framer-motion'

export interface LinkData {
  id: number
  title: string
  url: string
  color?: string
  imageUrl?: string
  category?: string
}

export default function LinkCard({ link }: { link: LinkData }) {
  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-xl overflow-hidden shadow-lg transform transition-all hover:scale-105"
      style={{ backgroundColor: link.color || '#1e293b' }}
    >
      {link.imageUrl && (
        <img src={link.imageUrl} alt="" className="h-32 w-full object-cover" />
      )}
      <div className="p-4 text-white backdrop-blur-sm bg-black/20">
        <h3 className="font-semibold">{link.title}</h3>
        {link.category && <p className="text-sm opacity-80">{link.category}</p>}
      </div>
    </motion.a>
  )
}
