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
  const cardType = link.fileUrl ? "DOC" : link.url ? "LINK" : "NOTA";

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
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-black/40 via-black/15 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />
      <div className="absolute left-3 top-3 z-20 max-w-[calc(100%-24px)] truncate rounded-xl border border-slate-200/80 bg-white/95 px-2 py-1.5 text-sm font-semibold text-[#111] shadow-[0_6px_16px_rgba(15,23,42,0.12)]">
        {link.title}
      </div>
      <div className="absolute bottom-3 right-3 z-20 rounded-[10px] border border-slate-200/80 bg-white/90 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#111] shadow-[0_4px_10px_rgba(15,23,42,0.08)] sm:text-[12px]">
        {cardType}
      </div>
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
      <div className="flex-1" />
    </motion.a>
  );
}
