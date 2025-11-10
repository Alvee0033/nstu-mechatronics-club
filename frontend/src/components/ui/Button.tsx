'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  onClick?: () => void;
  href?: string;
}

export default function Button({ 
  children, 
  variant = 'primary', 
  className = '',
  onClick,
  href
}: ButtonProps) {
  const baseStyles = "px-8 py-3 rounded-full font-semibold transition-all duration-300 relative overflow-hidden";
  
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/80 border border-purple-400/50",
    secondary: "bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-2xl hover:shadow-blue-500/80 border border-blue-400/50",
    outline: "border-2 border-purple-500/50 text-white hover:bg-purple-500/20 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/50"
  };

  const glowStyles = {
    primary: {
      boxShadow: '0 0 20px rgba(147, 51, 234, 0.5), 0 0 40px rgba(236, 72, 153, 0.3)',
    },
    secondary: {
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(6, 182, 212, 0.3)',
    },
    outline: {
      boxShadow: '0 0 10px rgba(147, 51, 234, 0.3)',
    }
  };

  const Component = motion.button;

  return (
    <Component
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(baseStyles, variants[variant], className)}
      style={glowStyles[variant]}
      onClick={onClick}
    >
      <span className="relative z-10">{children}</span>
      {/* Animated glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 blur-xl"
        whileHover={{ opacity: 0.3 }}
        transition={{ duration: 0.3 }}
      />
    </Component>
  );
}
