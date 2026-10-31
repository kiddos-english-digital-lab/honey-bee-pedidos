import { Check } from 'lucide-react';

interface OptionItem<T extends string | number> {
  value: T;
  label: string;
  description?: string;
}

interface OptionGroupProps<T extends string | number> {
  legend: string;
  name: string;
  value: T;
  options: OptionItem<T>[];
  onChange: (value: T) => void;
}

export default function OptionGroup<T extends string | number>({
  legend,
  name,
  value,
  options,
  onChange,
}: OptionGroupProps<T>) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-bold text-cocoa-700">{legend}</legend>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <label key={String(option.value)} className="group cursor-pointer">
            <input
              type="radio"
              name={name}
              value={String(option.value)}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span className="flex min-w-[8rem] items-start justify-between gap-3 rounded-2xl border-2 border-cocoa-200 bg-white px-4 py-3 transition hover:border-rose-500 peer-checked:border-cocoa-700 peer-checked:bg-butter-200 peer-focus-visible:ring-2 peer-focus-visible:ring-cocoa-700 peer-focus-visible:ring-offset-2">
              <span className="flex flex-col">
                <span className="font-bold">{option.label}</span>
                {option.description && <span className="text-sm text-cocoa-600">{option.description}</span>}
              </span>
              <Check aria-hidden="true" className="mt-0.5 hidden h-4 w-4 shrink-0 group-has-[:checked]:block" />
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
