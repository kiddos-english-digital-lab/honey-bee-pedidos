import { useRef, useState } from 'react';
import CartPanel from '@/components/cart/CartPanel';
import Hero from '@/components/hero/Hero';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';
import MenuSection from '@/components/menu/MenuSection';
import ProductModal from '@/components/product/ProductModal';
import OrderReviewModal from '@/components/review/OrderReviewModal';
import OrderConfirmation from '@/components/order/OrderConfirmation';
import Modal from '@/components/ui/Modal';
import { useCart } from '@/context/CartContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { navigateTo } from '@/hooks/usePathname';
import { summarizeCart } from '@/lib/cart';
import { buildTrackingPath } from '@/lib/routes';
import type { PlacedOrder } from '@/types/orders';
import type { Product } from '@/types/menu';

function scrollToMenu() {
  document.getElementById('menu')?.scrollIntoView({ block: 'start' });
}

export default function Storefront() {
  const { lines } = useCart();
  const { itemCount } = summarizeCart(lines);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const cartRef = useRef<HTMLElement>(null);

  function handleOpenCart() {
    if (isDesktop) {
      cartRef.current?.scrollIntoView({ block: 'start' });
      return;
    }
    setIsCartOpen(true);
  }

  function handleReview() {
    setIsCartOpen(false);
    setIsReviewOpen(true);
  }

  function handleCloseReview() {
    setIsReviewOpen(false);
    if (!isDesktop) setIsCartOpen(true);
  }

  function handleOrderPlaced(order: PlacedOrder) {
    setIsReviewOpen(false);
    setIsCartOpen(false);
    setPlacedOrder(order);
  }

  function handleBrowseMenuFromDrawer() {
    setIsCartOpen(false);
    scrollToMenu();
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader itemCount={itemCount} onOpenCart={handleOpenCart} />

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <Hero />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-10">
          <MenuSection onSelectProduct={setSelectedProduct} />

          <aside ref={cartRef} aria-label="Carrito de pedido" className="hidden lg:sticky lg:top-24 lg:block">
            <div className="flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-rose-200">
              <CartPanel onReview={handleReview} onBrowseMenu={scrollToMenu} />
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />

      {selectedProduct && (
        <ProductModal key={selectedProduct.id} product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      {isCartOpen && !isDesktop && (
        <Modal label="Tu carrito" placement="end" flush onClose={() => setIsCartOpen(false)}>
          <div className="h-full">
            <CartPanel onReview={handleReview} onBrowseMenu={handleBrowseMenuFromDrawer} />
          </div>
        </Modal>
      )}

      {isReviewOpen && <OrderReviewModal onClose={handleCloseReview} onPlaced={handleOrderPlaced} />}

      {placedOrder && (
        <OrderConfirmation
          order={placedOrder}
          onClose={() => setPlacedOrder(null)}
          onTrack={() => navigateTo(buildTrackingPath(placedOrder.trackingToken))}
        />
      )}
    </div>
  );
}
