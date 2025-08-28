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
  const categoryColor = link.categoryColor || '#6366f1';
  
  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full max-w-[180px] mx-auto"
      whileHover={{ 
        y: -8, 
        rotate: Math.random() > 0.5 ? 1 : -1,
        scale: 1.05 
      }}
      whileTap={{ scale: 0.95, rotate: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
    >
      <div 
        className="relative rounded-2xl h-[210px] flex flex-col overflow-hidden transition-all duration-500 group-hover:shadow-2xl"
        style={{
          background: `linear-gradient(135deg, var(--card-background) 0%, ${categoryColor}05 100%)`,
          border: `2px solid var(--card-border)`,
          boxShadow: `0 4px 16px ${categoryColor}10`
        }}
      >
        {/* Expanding color circle */}
        <div 
          className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out group-hover:scale-[25] opacity-0 group-hover:opacity-20"
          style={{ backgroundColor: categoryColor }}
        />
        
        {/* Image/Icon Section */}
        <div className="relative p-6 pb-4 flex justify-center">
          {link.imageUrl ? (
            <motion.div 
              className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg"
              whileHover={{ x: Math.random() > 0.5 ? 3 : -3 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <img
                src={
                  link.imageUrl.startsWith("/api/")
                    ? link.imageUrl
                    : link.imageUrl.startsWith("/uploads/")
                    ? `/api${link.imageUrl}`
                    : link.imageUrl
                }
                alt=""
                className="w-full h-full object-cover"
              />
            </motion.div>
          ) : (
            <motion.div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl"
              style={{ 
                background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}CC 100%)` 
              }}
              whileHover={{ 
                x: Math.random() > 0.5 ? 3 : -3,
                scale: 1.05
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <motion.div 
                className="w-8 h-8 rounded-xl bg-white"
                style={{ opacity: 0.95 }}
              />
            </motion.div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between px-6 pb-6">
          {/* Title */}
          <motion.div 
            className="text-center mb-4"
            whileHover={{ scale: 1.02 }}
          >
            <h3 
              className="font-semibold text-base leading-tight line-clamp-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {link.title}
            </h3>
          </motion.div>

          {/* Category Badge */}
          {link.category && (
            <motion.div 
              className="flex justify-center"
              whileHover={{ scale: 1.05 }}
            >
              <div 
                className="px-4 py-2 rounded-full text-xs font-bold text-white shadow-md relative overflow-hidden"
                style={{ backgroundColor: categoryColor }}
              >
                {/* Animated shine effect */}
                <div 
                  className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-pulse"
                  style={{ 
                    transform: 'translateX(-100%)',
                    transition: 'transform 0.6s ease-in-out'
                  }}
                />
                <span className="relative z-10">{link.category}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Hover glow effect */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ 
            background: `radial-gradient(circle at center, ${categoryColor}15 0%, transparent 70%)`,
            border: `2px solid ${categoryColor}30`
          }}
        />
      </div>
    </motion.a>
  );
}
