'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GradientCardProps {
  children: ReactNode;
  className?: string;
}

export default function GradientCard({ children, className = '' }: GradientCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/30 p-6 ${className}`}
      style={{
        boxShadow: '0 0 20px rgba(147, 51, 234, 0.2), inset 0 0 20px rgba(147, 51, 234, 0.05)'
      }}
    >
      {/* Neon border glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-purple-500/0 transition-all duration-300"
        whileHover={{
          borderColor: 'rgba(147, 51, 234, 0.6)',
          boxShadow: '0 0 30px rgba(147, 51, 234, 0.6), inset 0 0 20px rgba(147, 51, 234, 0.2)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-pink-600/5 to-blue-600/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
