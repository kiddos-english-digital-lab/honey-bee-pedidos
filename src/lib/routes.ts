export const TRACKING_PATH_PREFIX = '/seguimiento/';
export const ADMIN_PATH = '/admin';

export function buildTrackingPath(token: string): string {
  return `${TRACKING_PATH_PREFIX}${token}`;
}

export function getTrackingTokenFromPath(pathname: string): string | null {
  if (!pathname.startsWith(TRACKING_PATH_PREFIX)) return null;
  const token = pathname.slice(TRACKING_PATH_PREFIX.length);
  return token.length > 0 ? token : null;
}
