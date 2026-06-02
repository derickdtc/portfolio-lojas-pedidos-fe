import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
  isLoading?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-forest text-white hover:bg-[#124c2f] focus-visible:ring-forest',
  secondary:
    'border border-line bg-white text-moss hover:border-[#c9bead] hover:bg-cream focus-visible:ring-clay',
  danger:
    'border border-[#ffc9c0] bg-[#ffe9e5] text-danger hover:bg-[#ffded8] focus-visible:ring-danger',
  ghost: 'text-moss hover:bg-white focus-visible:ring-moss'
};

export function Button({
  children,
  className = '',
  icon,
  isLoading,
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={[
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-black transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
        'disabled:opacity-55',
        variantClasses[variant],
        className
      ].join(' ')}
      disabled={props.disabled || isLoading}
    >
      {isLoading ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
