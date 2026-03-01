import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logPageView, logEvent } from '../../firebase';

/**
 * Logs page views to Google Analytics (Firebase/GA4) when the route changes.
 * Place once inside your Router.
 */
export default function PageViewTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    logPageView(pathname, document?.title || pathname);

    if (pathname === '/') {
      logEvent('landing_page_viewed', {
        page_path: '/',
        page_title: document?.title || 'Home',
      });
    }
  }, [pathname]);

  return null;
}
