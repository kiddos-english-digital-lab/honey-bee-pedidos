import { ArrowRight, Star } from 'lucide-react';
import honeyBeeCupPhoto from '@/assets/images/products/vaso-honey-bee.webp';

export default function Hero() {
  return (
    <section id="inicio" className="pt-6 sm:pt-10">
      <div className="relative overflow-hidden rounded-[2rem] bg-butter-200 ring-1 ring-butter-300">
        <div className="grid items-center gap-8 p-6 sm:p-10 md:grid-cols-[1.1fr_1fr] md:gap-10 md:p-14">
          <div className="space-y-6">
            <p className="eyebrow">Café &amp; bagels</p>
            <h1 className="font-display text-5xl leading-[1.1] text-cocoa-700 sm:text-6xl">
              Tu antojo,
              <br />
              recién preparado
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-cocoa-600">
              Café, matcha y bagels para alegrar tu día.
            </p>
            <a href="#menu" className="btn-primary">
              Ver menú
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-cream shadow-xl ring-8 ring-cream/60">
              <img
                src={honeyBeeCupPhoto}
                alt="Bebida helada Honey Bee servida en vaso con etiqueta rosa"
                width={750}
                height={1000}
                className="h-full w-full object-cover"
              />
            </div>
            <Star
              aria-hidden="true"
              className="absolute -left-3 -top-3 h-8 w-8 fill-honey-300 text-honey-500 motion-safe:animate-fade-in"
            />
            <Star aria-hidden="true" className="absolute -bottom-2 right-6 h-5 w-5 fill-rose-300 text-rose-500" />
          </div>
        </div>
        <div aria-hidden="true" className="stripes-rose h-3 w-full" />
      </div>
    </section>
  );
}
