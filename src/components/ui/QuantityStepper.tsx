import { Minus, Plus } from 'lucide-react';
import { MAX_LINE_QUANTITY, MIN_LINE_QUANTITY } from '@/lib/cart';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  itemName: string;
}

export default function QuantityStepper({ value, onChange, itemName }: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-white p-1 ring-1 ring-cocoa-200">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= MIN_LINE_QUANTITY}
        aria-label={`Disminuir cantidad de ${itemName}`}
        className="icon-btn h-9 w-9"
      >
        <Minus aria-hidden="true" className="h-4 w-4" />
      </button>
      <span aria-live="polite" className="min-w-[2rem] text-center font-bold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_LINE_QUANTITY}
        aria-label={`Aumentar cantidad de ${itemName}`}
        className="icon-btn h-9 w-9"
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}
