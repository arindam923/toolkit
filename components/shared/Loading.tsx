'use client';

import { motion } from 'motion/react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Loading({ message = 'Loading', size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <motion.div
        className={`${sizeClasses[size]} rounded-full border-foreground/20 border-t-brand-accent`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">
        {message}
      </p>
    </div>
  );
}
