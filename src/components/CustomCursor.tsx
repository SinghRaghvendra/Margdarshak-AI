
'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      if (target.closest('a, button')) {
        setIsPointer(true);
      } else {
        setIsPointer(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      className={cn(
        'hidden md:block fixed w-8 h-8 rounded-full bg-primary/80 pointer-events-none z-[100] transition-transform duration-200 ease-in-out',
        'mix-blend-difference', // This creates the color inversion effect
        isPointer ? 'scale-150' : 'scale-100'
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%) ${isPointer ? 'scale(1.5)' : 'scale(1)'}`,
      }}
    />
  );
}
