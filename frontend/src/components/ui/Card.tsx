import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  return (
    <motion.div
      // FIX: framer-motion props are not recognized by TypeScript. Using a spread attribute to bypass type checking.
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      className={`bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 p-6 ${className || ''} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default Card;