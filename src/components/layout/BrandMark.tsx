import { Star } from 'lucide-react';

export default function BrandMark() {
  return (
    <span className="inline-flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-butter-200 ring-1 ring-cocoa-200">
        <Star aria-hidden="true" className="h-5 w-5 fill-honey-500 text-cocoa-700" />
      </span>
      <span className="font-display text-2xl font-semibold text-cocoa-700">Honey Bee</span>
    </span>
  );
}
