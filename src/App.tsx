import AdminPage from '@/components/admin/AdminPage';
import Storefront from '@/components/Storefront';
import TrackingPage from '@/components/tracking/TrackingPage';
import CartProvider from '@/context/CartProvider';
import { usePathname } from '@/hooks/usePathname';
import { ADMIN_PATH, getTrackingTokenFromPath } from '@/lib/routes';

function App() {
  const pathname = usePathname();
  const trackingToken = getTrackingTokenFromPath(pathname);

  if (pathname === ADMIN_PATH) return <AdminPage />;
  if (trackingToken !== null) return <TrackingPage token={trackingToken} />;

  return (
    <CartProvider>
      <Storefront />
    </CartProvider>
  );
}

export default App;
