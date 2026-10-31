import { useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { CartContext, type CartContextValue } from '@/context/CartContext';
import {
  addLineToCart,
  readStoredCart,
  removeLineFromCart,
  setLineQuantity,
  writeStoredCart,
} from '@/lib/cart';
import type { CartLine } from '@/types/menu';

type CartAction =
  | { type: 'add'; line: CartLine }
  | { type: 'setQuantity'; key: string; quantity: number }
  | { type: 'remove'; key: string }
  | { type: 'clear' };

function cartReducer(lines: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case 'add':
      return addLineToCart(lines, action.line);
    case 'setQuantity':
      return setLineQuantity(lines, action.key, action.quantity);
    case 'remove':
      return removeLineFromCart(lines, action.key);
    case 'clear':
      return [];
  }
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, undefined, readStoredCart);

  useEffect(() => {
    writeStoredCart(lines);
  }, [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      addLine: (line) => dispatch({ type: 'add', line }),
      setQuantity: (key, quantity) => dispatch({ type: 'setQuantity', key, quantity }),
      removeLine: (key) => dispatch({ type: 'remove', key }),
      clearCart: () => dispatch({ type: 'clear' }),
    }),
    [lines],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
