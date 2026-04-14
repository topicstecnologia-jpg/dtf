import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Movie } from '../types';
import { Info, Star } from 'lucide-react';

interface SwipeCardProps {
  movie: Movie;
  onSwipe: (direction: 'left' | 'right') => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ movie, onSwipe }) => {
  const [exitX, setExitX] = useState<number | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

  const handleDragEnd = (e: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      setExitX(200);
      onSwipe('right');
    } else if (info.offset.x < -100) {
      setExitX(-200);
      onSwipe('left');
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX ? { x: exitX, opacity: 0 } : { x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="absolute top-0 left-0 w-full h-full max-w-sm mx-auto bg-white rounded-[40px] overflow-hidden shadow-soft border border-white/50 cursor-grab active:cursor-grabbing"
    >
      {/* Background Image - Full Height */}
      <div className="absolute inset-0">
        <img 
          src={movie.posterUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover"
          draggable={false}
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
      </div>

      {/* Swipe Indicators */}
      <motion.div 
        style={{ opacity: likeOpacity }}
        className="absolute top-8 left-8 bg-green-500/90 backdrop-blur-md rounded-full px-6 py-2 transform -rotate-12 z-20 shadow-lg"
      >
        <span className="text-white font-bold text-xl uppercase tracking-widest">AMEI</span>
      </motion.div>

      <motion.div 
        style={{ opacity: nopeOpacity }}
        className="absolute top-8 right-8 bg-red-500/90 backdrop-blur-md rounded-full px-6 py-2 transform rotate-12 z-20 shadow-lg"
      >
        <span className="text-white font-bold text-xl uppercase tracking-widest">NÃO</span>
      </motion.div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-10 text-white">
        <div className="flex items-center space-x-2 mb-2">
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
            <Star size={14} className="fill-current text-yellow-400" />
            <span>{movie.rating}</span>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium">
            {movie.year}
          </div>
        </div>

        <h2 className="text-4xl font-bold font-display leading-tight mb-2 shadow-sm">{movie.title}</h2>
        
        <p className="text-sm text-gray-200 line-clamp-2 mb-4 font-light leading-relaxed opacity-90">
          {movie.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {movie.genres.slice(0, 3).map(g => (
            <span key={g} className="text-xs font-semibold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {g}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
