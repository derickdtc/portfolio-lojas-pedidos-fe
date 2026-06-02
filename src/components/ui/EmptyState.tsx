import { LoaderCircle } from 'lucide-react';

type EmptyStateProps = {
  isLoading?: boolean;
  message: string;
};

export function EmptyState({ isLoading, message }: EmptyStateProps) {
  return (
    <div className="flex min-h-36 items-center justify-center rounded-lg border border-dashed border-line bg-white/50 p-6 text-center">
      {isLoading ? (
        <LoaderCircle aria-label="Carregando" className="animate-spin text-forest" size={28} />
      ) : (
        <p className="text-sm font-bold text-[#5f6b63]">{message}</p>
      )}
    </div>
  );
}
