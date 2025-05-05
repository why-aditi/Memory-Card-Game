import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ id, symbol, isFlipped, isMatched, onClick, animationDelay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1,
        scale: 1,
        transition: { 
          delay: animationDelay,
          duration: 0.3,
          ease: "easeOut"
        }
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="w-full max-w-[80px] aspect-square cursor-pointer perspective-1000"
    >
      <div
        className={`relative w-full h-full transition-all duration-500 transform-gpu preserve-3d ${
          isFlipped ? 'rotate-y-0' : 'rotate-y-180'
        }`}
        onClick={() => !isFlipped && !isMatched && onClick(id)}
      >
        {/* Front face (symbol side) */}
        <div 
          className={`absolute inset-0 flex items-center justify-center text-xl sm:text-2xl md:text-3xl rounded-lg shadow-md ${
            isMatched 
              ? 'bg-gradient-to-br from-green-400 to-green-600'
              : 'bg-gradient-to-br from-violet-400 to-violet-600'
          }`}
          style={{
            transform: 'rotateY(0deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {symbol}
        </div>

        {/* Back face (hidden side) */}
        <div 
          className="absolute inset-0 flex items-center justify-center rounded-lg shadow-md bg-gradient-to-br from-indigo-500 to-purple-600"
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          <div className="w-1/3 h-1/3 rounded-full bg-white/20 backdrop-blur-sm" />
        </div>
      </div>
    </motion.div>
  );
};

export default Card; 