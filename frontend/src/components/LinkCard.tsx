
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";


export interface LinkData {
  id: number;
  title: string;
  url: string;
  categoryId?: number;
  color?: string;
  imageUrl?: string;
  category?: string;

  categoryColor?: string;

}

export default function LinkCard({ link }: { link: LinkData }) {
  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-2xl overflow-hidden shadow-lg transform transition-all hover:scale-105 relative group border-2"
      style={{
        backgroundColor: link.color || "#1e293b",
        borderColor: link.categoryColor || "transparent",
      }}

    >
      {link.categoryColor && (
        <span
          className="absolute top-2 left-2 w-3 h-3 rounded-full border border-white"
          style={{ backgroundColor: link.categoryColor }}
        />
      )}
      {link.imageUrl && (
        <img src={link.imageUrl} alt="" className="h-32 w-full object-cover" />
      )}
      <div className="p-4 text-white backdrop-blur-sm bg-black/20">
        <h3 className="font-semibold">{link.title}</h3>
        {link.category && <p className="text-sm opacity-80">{link.category}</p>}
      </div>
      <div className="absolute top-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight size={18} />
      </div>
    </motion.a>
  );
}
