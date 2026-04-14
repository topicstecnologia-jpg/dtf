import React from 'react';
import { motion } from 'framer-motion';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17171B]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center w-full max-w-xs px-8"
      >
        <img 
          src="https://i.postimg.cc/GpHmXR5D/Design-sem-nome.png" 
          alt="DTF Logo" 
          className="w-48 h-auto drop-shadow-lg"
        />
      </motion.div>
    </div>
  );
};
