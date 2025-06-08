import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

function isLight(hex: string) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}


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
  const textColor = link.color || "#1e293b";

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-3xl overflow-hidden shadow-lg transform transition-all hover:scale-105 relative group border border-black/10 dark:border-white/10 bg-white dark:bg-slate-800"

    >
      {link.categoryColor && (
        <span
          className="absolute top-2 left-2 w-3 h-3 rounded-full border border-white"
          style={{ backgroundColor: link.categoryColor }}
        />
      )}
      {link.imageUrl && (
        <img
          src={
            link.imageUrl.startsWith("/api/")
              ? link.imageUrl
              : link.imageUrl.startsWith("/uploads/")
              ? `/api${link.imageUrl}`
              : link.imageUrl
          }
          alt=""
          className="h-32 w-full object-cover"
        />
      )}
      <div className="p-4 backdrop-blur-sm bg-black/70" style={{ color: textColor }}>
        <h3 className="font-semibold">{link.title}</h3>
        {link.category && <p className="text-sm opacity-80">{link.category}</p>}
      </div>
      <div
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: textColor }}
      >

        <ArrowUpRight size={18} />
      </div>
      <span className="h-1 block bg-black" />
    </motion.a>
  );
}
