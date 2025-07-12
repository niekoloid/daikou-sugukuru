'use client';

import { ReactNode } from 'react';

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
  withSafeArea?: boolean;
}

export default function MobileContainer({ 
  children, 
  className = '', 
  withSafeArea = true 
}: MobileContainerProps) {
  return (
    <div 
      className={`
        mx-auto max-w-mobile w-full min-h-screen
        ${withSafeArea ? 'pt-safe-top pb-safe-bottom' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}