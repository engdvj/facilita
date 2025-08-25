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
      className="group block w-full max-w-[180px] mx-auto"
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div 
        className="relative overflow-hidden rounded-2xl h-[200px] flex flex-col transition-all duration-300 shadow-lg hover:shadow-2xl"
        style={{
          background: 'var(--card-background)',
          border: `2px solid var(--card-border)`,
        }}
      >
        {/* Large Image/Icon Section */}
        <div className="flex-shrink-0 p-4 pb-2">
          {link.imageUrl ? (
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md mx-auto">
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
            </div>
          ) : (
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-md"
              style={{ background: 'var(--card-image-background)' }}
            >
              <div 
                className="w-8 h-8 rounded-xl"
                style={{ backgroundColor: 'var(--card-accent)' }}
              ></div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between px-4 pb-4">
          <div className="text-center">
            <h3 
              className="font-semibold text-sm leading-tight line-clamp-2 mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {link.title}
            </h3>
            
            {link.category && (
              <p 
                className="text-xs truncate px-2 py-1 rounded-full inline-block"
                style={{ 
                  color: 'var(--text-accent)',
                  backgroundColor: 'var(--card-hover)'
                }}
              >
                {link.category}
              </p>
            )}
          </div>

          {/* Action Indicator with Category Color */}
          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid var(--border-secondary)` }}>
            <div 
              className="flex items-center text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Abrir
            </div>
            
            {link.categoryColor && (
              <div className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: link.categoryColor }}
                />
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: link.categoryColor, opacity: 0.6 }}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Accent border on hover */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ 
            background: `linear-gradient(135deg, var(--card-accent)22, transparent 50%, var(--card-accent)22)`,
            border: `1px solid var(--card-accent)`
          }}
        />
      </div>
    </motion.a>
  );
}
