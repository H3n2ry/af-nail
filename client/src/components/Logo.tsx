import React from 'react';

type Props = { className?: string; size?: 'sm' | 'md' | 'lg' };

export function Logo({ className = '', size = 'md' }: Props) {
  const sizes = { sm: 'text-xl', md: 'text-2xl', lg: 'text-4xl' };
  const iconSizes = { sm: 16, md: 20, lg: 32 };
  const s = iconSizes[size];

  const dotSize = { sm: 'w-1.5 h-1.5', md: 'w-2 h-2', lg: 'w-2.5 h-2.5' }[size];

  return (
    <span className={`font-display italic font-semibold text-neutral-900 flex items-center ${sizes[size]} ${className}`}>
      af
      <span className={`${dotSize} rounded-full bg-primary inline-block mx-1 mb-0.5`} aria-hidden="true" />
      salon
    </span>
  );
}
