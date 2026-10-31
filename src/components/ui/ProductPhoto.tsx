import { Star } from 'lucide-react';

interface ProductPhotoProps {
  src: string | null;
  name: string;
  alt?: string;
  className?: string;
}

export default function ProductPhoto({ src, name, alt, className = '' }: ProductPhotoProps) {
  if (src) {
    return <img src={src} alt={alt ?? name} loading="lazy" decoding="async" className={`object-cover ${className}`} />;
  }

  return (
    <div
      aria-hidden="true"
      className={`stripes-rose flex flex-col items-center justify-center gap-2 bg-butter-200 text-cocoa-700 ${className}`}
    >
      <span className="grid h-12 w-12 place-items-center rounded-full bg-cream/90 shadow-sm">
        <Star className="h-5 w-5 fill-honey-300 text-cocoa-700" />
      </span>
      <span className="rounded-full bg-cream/95 px-3 py-1 text-xs font-bold">Foto pendiente</span>
    </div>
  );
}
