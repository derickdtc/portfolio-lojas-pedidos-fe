import type { ReactNode } from 'react';

type AlertProps = {
  tone?: 'success' | 'danger' | 'warning';
  children: ReactNode;
};

const toneClasses = {
  success: 'border-[#badcc8] bg-[#e2f2e8] text-forest',
  danger: 'border-[#ffc9c0] bg-[#ffe9e5] text-danger',
  warning: 'border-[#ead28b] bg-[#fff0c7] text-[#7a4d0b]'
};

export function Alert({ children, tone = 'success' }: AlertProps) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm font-extrabold leading-5 [overflow-wrap:anywhere] ${toneClasses[tone]}`}
    >
      {children}
    </div>
  );
}
