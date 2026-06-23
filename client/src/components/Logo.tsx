import React from 'react';

type Props = { className?: string; size?: 'sm' | 'md' | 'lg' };

export function Logo({ className = '', size = 'md' }: Props) {
  const sizes = { sm: 'text-xl', md: 'text-2xl', lg: 'text-4xl' };
  const iconSizes = { sm: 16, md: 20, lg: 32 };
  const s = iconSizes[size];

  return (
    <span className={`font-display italic font-semibold text-primary flex items-center gap-1 ${sizes[size]} ${className}`}>
      Af
      {/* Stylized nail icon replacing the dot */}
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse cx="10" cy="6" rx="5.5" ry="5" fill="#C9607A" />
        <rect x="7" y="10" width="6" height="8" rx="2" fill="#C9607A" />
        <ellipse cx="10" cy="5.5" rx="3.5" ry="3" fill="#F2A7BB" opacity="0.5" />
      </svg>
      nail
    </span>
  );
}
