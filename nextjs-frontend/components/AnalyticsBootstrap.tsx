'use client'

import Script from 'next/script'
import { GA_MEASUREMENT_ID, GOOGLE_ADS_ID, initializeAnalytics } from '@/lib/tracking'

export default function AnalyticsBootstrap() {
  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Script
        id="ga-consent-bootstrap"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function(){dataLayer.push(arguments);};
            window.gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              wait_for_update: 500
            });
            window.gtag('js', new Date());
            window.gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
            window.gtag('config', '${GOOGLE_ADS_ID}');
            window.gaLoaded = true;
          `,
        }}
      />
      <Script
        id="ga-script"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
        onReady={() => {
          initializeAnalytics()
        }}
      />
    </>
  )
}
