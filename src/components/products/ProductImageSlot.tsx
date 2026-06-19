import { Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

type ProductImageSlotProps = {
  alt: string;
  src?: string | null;
  className?: string;
};

export function ProductImageSlot({ alt, className = '', src }: ProductImageSlotProps) {
  const normalizedSrc = src?.trim();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [normalizedSrc]);

  if (normalizedSrc && !hasError) {
    return (
      <img
        alt={alt}
        className={[
          'block rounded-lg border border-line bg-cream object-cover',
          className
        ].join(' ')}
        loading="lazy"
        onError={() => setHasError(true)}
        src={normalizedSrc}
      />
    );
  }

  return (
    <div
      aria-label="Produto sem imagem"
      className={[
        'flex items-center justify-center rounded-lg border border-dashed border-line bg-cream text-[#9a8f7f]',
        className
      ].join(' ')}
      role="img"
    >
      <ImageIcon size={22} strokeWidth={2.3} />
    </div>
  );
}
