import type { InputHTMLAttributes, ReactNode } from 'react';

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
};

export function FormField({ className = '', icon, label, id, ...props }: FormFieldProps) {
  const inputId = id ?? props.name ?? label;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-2 block text-sm font-extrabold text-moss">{label}</span>
      <span className="relative block">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 text-[#738075]">
            {icon}
          </span>
        ) : null}
        <input
          id={inputId}
          className={[
            'min-h-12 w-full rounded-lg border border-line bg-cream px-3 text-base font-semibold text-ink outline-none transition',
            'placeholder:text-[#7d877f] focus:border-forest focus:ring-2 focus:ring-forest/15',
            icon ? 'pl-10' : '',
            className
          ].join(' ')}
          {...props}
        />
      </span>
    </label>
  );
}
