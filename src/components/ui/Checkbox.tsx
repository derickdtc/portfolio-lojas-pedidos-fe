import { Check } from 'lucide-react';

type CheckboxProps = {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

export function Checkbox({ checked, disabled, label, onChange }: CheckboxProps) {
  return (
    <button
      aria-checked={checked}
      className="flex min-h-11 w-full items-center gap-3 rounded-lg text-left disabled:opacity-55"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      type="button"
    >
      <span
        className={[
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2',
          checked ? 'border-forest bg-forest text-white' : 'border-[#8a9a90] bg-white text-transparent'
        ].join(' ')}
      >
        <Check size={16} strokeWidth={3} />
      </span>
      <span className="text-sm font-bold text-moss">{label}</span>
    </button>
  );
}
