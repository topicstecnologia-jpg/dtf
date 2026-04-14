import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { Movie } from '../types';
import { Star, Info, Play } from 'lucide-react';

interface VerticalSwipeCardProps {
  movie: Movie;
  index: number;
  onSwipe: (direction: 'up' | 'down') => void;
}

export const VerticalSwipeCard: React.FC<VerticalSwipeCardProps> = ({ movie, index, onSwipe }) => {
  const y = useMotionValue(0);
  const scale = useTransform(y, [-200, 0, 200], [0.9, 1, 0.9]);
  const opacity = useTransform(y, [-200, 0, 200], [0.5, 1, 0.5]);
  const [exitY, setExitY] = useState<number | null>(null);

  const handleDragEnd = (e: any, info: PanInfo) => {
    if (info.offset.y < -100) {
      setExitY(-200);
      onSwipe('up');
    } else {
      // Snap back
    }
  };

  // 3D Stack Effect
  const cardStyle = {
    zIndex: 100 - index,
    scale: 1 - index * 0.05,
    y: index * 15, // Stack vertical offset
    opacity: 1 - index * 0.2,
  };

  return (
    <motion.div
      style={{ 
        ...cardStyle,
        y: index === 0 ? y : cardStyle.y, // Only top card moves
      }}
      drag={index === 0 ? "y" : false}
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitY ? { y: exitY, opacity: 0 } : { 
        scale: cardStyle.scale, 
        y: cardStyle.y, 
        opacity: cardStyle.opacity 
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="absolute top-0 w-full h-[65vh] max-w-sm mx-auto rounded-[32px] overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing bg-black"
    >
      {/* Full Image */}
      <div className="absolute inset-0">
        <img 
          src={movie.posterUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover opacity-80"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />
      </div>

      {/* Play Button Overlay (Reels Style) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
          <Play size={32} className="text-white fill-white ml-1" />
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        <div className="flex items-center space-x-2 mb-3">
          <div className="bg-yellow-500 px-2 py-0.5 rounded text-black text-xs font-bold flex items-center">
            <Star size={10} className="fill-black mr-1" />
            {movie.rating}
          </div>
          <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded backdrop-blur-md">
            {movie.year}
          </span>
        </div>

        <h2 className="text-3xl font-display font-bold mb-2 leading-tight">{movie.title}</h2>
        
        <p className="text-sm text-gray-300 line-clamp-2 mb-4 font-light">
          {movie.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {movie.genres.slice(0, 3).map(g => (
            <span key={g} className="text-[10px] font-semibold uppercase tracking-wider bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              {g}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
