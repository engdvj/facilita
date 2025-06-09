import { motion } from "framer-motion";

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
      className="rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all relative bg-white dark:bg-slate-800 hover:pulse-fast"
    >
      {link.imageUrl && (
        <div className="relative">
          <img
            src={
              link.imageUrl.startsWith("/api/")
                ? link.imageUrl
                : link.imageUrl.startsWith("/uploads/")
                ? `/api${link.imageUrl}`
                : link.imageUrl
            }
            alt=""
            className="h-40 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
      <div className="p-4" style={{ color: textColor }}>
        <h3 className="font-semibold text-lg">{link.title}</h3>
        {link.category && <p className="text-sm opacity-80">{link.category}</p>}
      </div>
      {link.categoryColor && (
        <span
          className="h-1 block"
          style={{ backgroundColor: link.categoryColor }}
        />
      )}
    </motion.a>
  );
}
