import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyTheme, getSavedTheme } from '../lib/theme';

/** Public pages follow the visitor's saved theme; the admin area is always dark. */
export default function ThemeGuard() {
  const { pathname } = useLocation();
  useEffect(() => {
    applyTheme(pathname.startsWith('/greatness') ? 'dark' : getSavedTheme());
  }, [pathname]);
  return null;
}
