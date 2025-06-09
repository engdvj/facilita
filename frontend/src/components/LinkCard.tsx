import { motion } from "framer-motion";


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
      className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transform hover:scale-[1.02] transition-transform duration-300 relative bg-gradient-to-b from-slate-800 to-slate-950 text-white"
    >
      {link.imageUrl && (
        <div className="relative overflow-hidden">
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
      <div className="p-4 text-white">
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
