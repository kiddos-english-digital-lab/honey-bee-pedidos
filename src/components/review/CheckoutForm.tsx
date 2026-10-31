import { CUSTOMER_NAME_MAX_LENGTH, ORDER_NOTES_MAX_LENGTH, type CheckoutErrors, type CheckoutFields } from '@/lib/orderValidation';
import { Store } from 'lucide-react';

interface CheckoutFormProps {
  fields: CheckoutFields;
  errors: CheckoutErrors;
  disabled: boolean;
  onChange: (field: keyof CheckoutFields, value: string) => void;
  onSubmit: () => void;
}

const INPUT_CLASS =
  'w-full rounded-2xl border-2 bg-white px-4 py-3 text-cocoa-700 placeholder:text-cocoa-500 focus:outline-none disabled:opacity-60';

function inputClass(hasError: boolean) {
  return `${INPUT_CLASS} ${hasError ? 'border-brick-500 focus:border-brick-500' : 'border-cocoa-200 focus:border-cocoa-700'}`;
}

export default function CheckoutForm({ fields, errors, disabled, onChange, onSubmit }: CheckoutFormProps) {
  return (
    <form
      id="checkout-form"
      noValidate
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="checkout-name" className="block text-sm font-bold text-cocoa-700">
            Nombre
          </label>
          <input
            id="checkout-name"
            type="text"
            autoComplete="name"
            maxLength={CUSTOMER_NAME_MAX_LENGTH}
            value={fields.name}
            disabled={disabled}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'checkout-name-error' : undefined}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Como te llamamos"
            className={inputClass(Boolean(errors.name))}
          />
          {errors.name && (
            <p id="checkout-name-error" className="text-sm font-bold text-brick-700">
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="checkout-phone" className="block text-sm font-bold text-cocoa-700">
            Teléfono
          </label>
          <input
            id="checkout-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={18}
            value={fields.phone}
            disabled={disabled}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'checkout-phone-error' : 'checkout-phone-hint'}
            onChange={(event) => onChange('phone', event.target.value)}
            placeholder="10 dígitos"
            className={inputClass(Boolean(errors.phone))}
          />
          {errors.phone ? (
            <p id="checkout-phone-error" className="text-sm font-bold text-brick-700">
              {errors.phone}
            </p>
          ) : (
            <p id="checkout-phone-hint" className="text-sm text-cocoa-600">
              Lo usamos solo para identificar tu pedido en tienda.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-bold text-cocoa-700">Entrega</span>
        <div className="flex items-start gap-3 rounded-2xl border-2 border-cocoa-700 bg-butter-200 px-4 py-3">
          <Store aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-cocoa-700" />
          <div>
            <p className="font-bold text-cocoa-700">Recoger en tienda</p>
            <p className="text-sm text-cocoa-600">Por ahora solo ofrecemos pedidos para recoger.</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="checkout-notes" className="block text-sm font-bold text-cocoa-700">
          Notas generales (opcional)
        </label>
        <textarea
          id="checkout-notes"
          rows={2}
          maxLength={ORDER_NOTES_MAX_LENGTH}
          value={fields.notes}
          disabled={disabled}
          aria-invalid={Boolean(errors.notes)}
          onChange={(event) => onChange('notes', event.target.value)}
          placeholder="Ej. Sin cebolla en el bagel"
          className={`${inputClass(Boolean(errors.notes))} resize-none`}
        />
        <div className="flex items-start justify-between gap-4">
          {errors.notes ? (
            <p className="text-sm font-bold text-brick-700">{errors.notes}</p>
          ) : (
            <span />
          )}
          <span className="shrink-0 text-xs text-cocoa-600">
            {fields.notes.length}/{ORDER_NOTES_MAX_LENGTH}
          </span>
        </div>
      </div>
    </form>
  );
}
