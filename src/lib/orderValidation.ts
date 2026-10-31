import { ORDER_STATUSES, type OrderItemView, type OrderStatus, type OrderView, type PlacedOrder } from '@/types/orders';

export const CUSTOMER_NAME_MIN_LENGTH = 2;
export const CUSTOMER_NAME_MAX_LENGTH = 60;
export const PHONE_DIGITS = 10;
export const ORDER_NOTES_MAX_LENGTH = 300;
export const CANCEL_REASON_MAX_LENGTH = 200;

const TRACKING_TOKEN_PATTERN = /^[0-9a-f]{64}$/;

export interface CheckoutFields {
  name: string;
  phone: string;
  notes: string;
}

export type CheckoutErrors = Partial<Record<keyof CheckoutFields, string>>;

export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function validateCheckout(fields: CheckoutFields): CheckoutErrors {
  const errors: CheckoutErrors = {};
  const name = fields.name.trim();
  const phone = normalizePhone(fields.phone);

  if (name.length < CUSTOMER_NAME_MIN_LENGTH || name.length > CUSTOMER_NAME_MAX_LENGTH) {
    errors.name = `Escribe tu nombre (entre ${CUSTOMER_NAME_MIN_LENGTH} y ${CUSTOMER_NAME_MAX_LENGTH} caracteres).`;
  }
  if (phone.length !== PHONE_DIGITS) {
    errors.phone = `Escribe un teléfono de ${PHONE_DIGITS} dígitos.`;
  }
  if (fields.notes.trim().length > ORDER_NOTES_MAX_LENGTH) {
    errors.notes = `Las notas no pueden superar ${ORDER_NOTES_MAX_LENGTH} caracteres.`;
  }
  return errors;
}

export function isTrackingToken(value: string): boolean {
  return TRACKING_TOKEN_PATTERN.test(value);
}

const ORDER_ERROR_MESSAGES: Record<string, string> = {
  not_configured: 'La conexión con la base de datos no está configurada. No es posible enviar pedidos todavía.',
  intake_closed: 'Por ahora no estamos recibiendo pedidos.',
  invalid_name: 'Revisa tu nombre. Debe tener entre 2 y 60 caracteres.',
  invalid_phone: 'Revisa tu teléfono. Debe tener 10 dígitos.',
  invalid_notes: 'Las notas son demasiado largas. Acórtalas e intenta de nuevo.',
  invalid_fulfillment: 'Solo puedes recoger tu pedido en tienda.',
  invalid_items: 'Tu carrito está vacío o tiene demasiados productos.',
  invalid_item: 'Uno de los productos de tu carrito ya no está disponible. Revísalo e intenta de nuevo.',
  invalid_quantity: 'Revisa las cantidades de tu carrito. Cada producto debe tener entre 1 y 99 unidades.',
  cold_only_32: 'Las bebidas calientes solo están disponibles en 16 oz.',
  rate_limited: 'Recibimos varios intentos desde tu teléfono. Espera unos minutos e intenta de nuevo.',
};

const GENERIC_ORDER_ERROR = 'No pudimos enviar tu pedido. Tu carrito sigue guardado; intenta de nuevo.';

const INTAKE_ERROR_MESSAGES: Record<string, string> = {
  not_configured: 'Falta la configuración de la conexión con la base de datos en esta versión del sitio.',
  intake_status_failed: 'La base de datos no respondió a la consulta. Revisa tu conexión o intenta más tarde.',
  invalid_response: 'La base de datos respondió con un dato inesperado.',
};

export function getIntakeErrorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  return INTAKE_ERROR_MESSAGES[code] ?? 'Ocurrió un error inesperado al consultar la recepción.';
}

export function getOrderErrorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  return ORDER_ERROR_MESSAGES[code] ?? GENERIC_ORDER_ERROR;
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && (ORDER_STATUSES as readonly string[]).includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseItem(raw: unknown): OrderItemView | null {
  if (!isRecord(raw)) return null;
  const { productName, temperature, size, quantity, unitPrice, notes } = raw;
  if (typeof productName !== 'string' || typeof quantity !== 'number' || typeof unitPrice !== 'number') return null;
  if (typeof notes !== 'string') return null;
  return {
    productName,
    temperature: temperature === 'frio' || temperature === 'caliente' ? temperature : null,
    size: size === 16 || size === 32 ? size : null,
    quantity,
    unitPrice,
    notes,
  };
}

export function parseOrderView(raw: unknown): OrderView | null {
  if (!isRecord(raw)) return null;
  const { folio, status, statusReason, customerName, fulfillment, total, notes, createdAt, updatedAt, items } = raw;
  if (typeof folio !== 'string' || !isOrderStatus(status)) return null;
  if (typeof customerName !== 'string' || fulfillment !== 'recoger' || typeof total !== 'number') return null;
  if (typeof notes !== 'string' || typeof createdAt !== 'string' || typeof updatedAt !== 'string') return null;
  if (statusReason !== null && typeof statusReason !== 'string') return null;
  if (!Array.isArray(items)) return null;

  const parsedItems = items.map(parseItem);
  if (parsedItems.some((item) => item === null)) return null;

  return {
    folio,
    status,
    statusReason,
    customerName,
    fulfillment,
    total,
    notes,
    createdAt,
    updatedAt,
    items: parsedItems as OrderItemView[],
  };
}

export function parsePlacedOrder(raw: unknown): PlacedOrder | null {
  const view = parseOrderView(raw);
  if (!view || !isRecord(raw)) return null;
  const { trackingToken } = raw;
  if (typeof trackingToken !== 'string' || !isTrackingToken(trackingToken)) return null;
  return { ...view, trackingToken };
}
