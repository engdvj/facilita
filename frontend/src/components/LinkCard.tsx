import { motion } from "framer-motion";


export interface LinkData {
  id: number;
  title: string;
  url: string;
  fileUrl?: string;
  userId?: number;
  user?: string;
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
      className="group relative flex w-full h-[200px] sm:h-[260px] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 text-white shadow-[0_18px_36px_rgba(15,23,42,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_rgba(15,23,42,0.4)]"
      style={{
        background:
          'linear-gradient(140deg, rgba(15,23,42,0.96), rgba(17,24,39,0.92))',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(600px 240px at 80% 0%, rgba(251,191,36,0.35), transparent 60%)',
        }}
      />
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
            className="h-28 sm:h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>
      )}
      <div className="relative z-10 p-4 text-white flex-1 flex flex-col justify-between text-left">
        <h3 className="font-heading text-base sm:text-lg leading-tight truncate">
          {link.title}
        </h3>

        {link.category && (
          <p className="text-xs sm:text-sm text-white/70 truncate">{link.category}</p>
        )}
      </div>
      {link.categoryColor && (
        <span
          className="relative z-10 h-1.5 block"
          style={{ backgroundColor: link.categoryColor }}
        />
      )}
    </motion.a>
  );
}
