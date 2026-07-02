import React from 'react';

type Props = { className?: string; size?: 'sm' | 'md' | 'lg' };

export function Logo({ className = '', size = 'md' }: Props) {
  const sizes = { sm: 'text-xl', md: 'text-2xl', lg: 'text-4xl' };
  const iconSizes = { sm: 16, md: 20, lg: 32 };
  const s = iconSizes[size];

  return (
    <span className={`font-display italic font-semibold text-primary flex items-center gap-1 ${sizes[size]} ${className}`}>
      af
      <svg width={s} height={s} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="10" cy="10" r="9" fill="#C9A84C" />
        <circle cx="10" cy="10" r="9" fill="#C9A84C" />
        <path d="M6 10.5C6 10.5 7.5 13 10 13C12.5 13 14 10.5 14 10.5" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="7.5" cy="8" r="1" fill="#1A1A1A" />
        <circle cx="12.5" cy="8" r="1" fill="#1A1A1A" />
      </svg>
      salon
    </span>
  );
}
