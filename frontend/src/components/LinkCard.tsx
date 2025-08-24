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
      className="block w-full min-h-[140px] sm:min-h-[160px] md:min-h-[180px] lg:min-h-[200px] xl:min-h-[220px] aspect-square flex flex-col justify-between overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-transform duration-300 relative bg-gradient-to-b from-slate-800 to-slate-950 text-white"
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
              className="h-20 sm:h-24 md:h-28 lg:h-32 xl:h-36 w-full object-cover"
            />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
      <div className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-7 text-white flex-1 flex flex-col justify-between text-left">
        <h3 className="font-semibold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-tight line-clamp-2">{link.title}</h3>

        {link.category && (
          <p className="text-xs sm:text-sm md:text-base opacity-80 truncate mt-1 lg:mt-2">{link.category}</p>
        )}
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
