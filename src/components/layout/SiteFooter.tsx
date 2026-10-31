import BrandMark from '@/components/layout/BrandMark';

export default function SiteFooter() {
  return (
    <footer className="border-t border-rose-200 bg-white/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center sm:px-6">
        <BrandMark />
        <p className="font-display text-lg italic text-cocoa-600">Hecho con cariño, preparado para ti.</p>
        <div aria-hidden="true" className="stripes-rose h-2 w-full max-w-xs rounded-full" />
      </div>
    </footer>
  );
}
