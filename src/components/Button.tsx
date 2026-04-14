import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine-900 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
        {
          'bg-wine-900 text-white hover:bg-wine-800 bg-tech-pattern btn-tech-glow shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_4px_10px_rgba(0,0,0,0.3)] border border-white/5': variant === 'primary',
          'bg-white text-dark-bg hover:bg-gray-100 shadow-md': variant === 'secondary',
          'border border-wine-800 bg-transparent hover:bg-wine-900/20 text-white': variant === 'outline',
          'hover:bg-wine-900/10 text-white': variant === 'ghost',
          'h-9 px-4 text-sm': size === 'sm',
          'h-11 px-8 text-base': size === 'md',
          'h-14 px-8 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
};
