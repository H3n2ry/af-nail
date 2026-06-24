import React from 'react';

type Props = {
  checked: boolean;
  onChange: () => void;
  className?: string;
};

/**
 * Toggle liga/desliga robusto: posiciona o knob via flex (justify),
 * sem depender de transform/translate. O knob branco fica sempre visível.
 */
export function Toggle({ checked, onChange, className = '' }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`flex items-center h-6 w-11 rounded-full p-0.5 transition-colors duration-200 ${
        checked ? 'bg-primary justify-end' : 'bg-neutral-200 justify-start'
      } ${className}`}
    >
      <span className="block h-5 w-5 rounded-full bg-white shadow border border-black/5" />
    </button>
  );
}
