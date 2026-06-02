import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: ReactNode;
  tone?: 'dark' | 'light' | 'danger';
};

const toneClasses = {
  dark: 'bg-ink text-white hover:bg-[#26362d]',
  light: 'border border-line bg-white text-moss hover:bg-cream',
  danger: 'border border-[#ffc9c0] bg-[#ffe9e5] text-danger hover:bg-[#ffded8]'
};

export function IconButton({ className = '', icon, label, tone = 'light', ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={[
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-black transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
        'disabled:opacity-40',
        toneClasses[tone],
        className
      ].join(' ')}
      {...props}
    >
      {icon}
    </button>
  );
}
