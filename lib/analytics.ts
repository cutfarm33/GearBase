// Analytics and Conversion Tracking Utilities

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    dataLayer: any[];
    getUtmData: () => Record<string, string>;
  }
}

// Get stored UTM parameters
export const getUtmData = (): Record<string, string> => {
  if (typeof window !== 'undefined' && window.getUtmData) {
    return window.getUtmData();
  }
  return {};
};

// Track page views (called on navigation)
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

// Track signup start (when user lands on signup page)
export const trackSignupStart = () => {
  const utmData = getUtmData();

  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_sign_up', {
      method: 'email',
      ...utmData,
    });
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_name: 'Signup Started',
      ...utmData,
    });
  }
};

// Track successful signup (CONVERSION EVENT)
export const trackSignupComplete = (userId?: string, plan?: string) => {
  const utmData = getUtmData();

  // Google Analytics - Primary conversion event
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', {
      method: 'email',
      user_id: userId,
      plan: plan || 'free',
      ...utmData,
    });

    // Also fire as a conversion for Google Ads
    window.gtag('event', 'conversion', {
      send_to: 'AW-XXXXXXXXXX/XXXXXXXXXXX', // Replace with your Google Ads conversion ID
      value: plan === 'pro' ? 29.0 : 0,
      currency: 'USD',
    });
  }

  // Facebook Pixel - Primary conversion event
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration', {
      content_name: plan || 'free',
      value: plan === 'pro' ? 29.0 : 0,
      currency: 'USD',
      ...utmData,
    });
  }

  // Clear UTM data after conversion
  if (typeof window !== 'undefined') {
    localStorage.removeItem('gearbase_utm');
  }
};

// Track login
export const trackLogin = (method: string = 'email') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'login', { method });
  }
};

// Track feature usage (for engagement analysis)
export const trackFeatureUse = (featureName: string, details?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'feature_use', {
      feature_name: featureName,
      ...details,
    });
  }
};

// Track CTA clicks
export const trackCtaClick = (ctaName: string, location: string) => {
  const utmData = getUtmData();

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'cta_click', {
      cta_name: ctaName,
      location: location,
      ...utmData,
    });
  }

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', 'CTAClick', {
      cta_name: ctaName,
      location: location,
    });
  }
};

// Track pricing page view
export const trackPricingView = () => {
  const utmData = getUtmData();

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item_list', {
      item_list_name: 'Pricing Plans',
      ...utmData,
    });
  }

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_type: 'pricing',
      content_name: 'Pricing Page',
    });
  }
};

// Track founder purchase (conversion event)
export const trackFounderPurchase = (founderNumber?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: `founder_${founderNumber || 'unknown'}`,
      value: 29.00,
      currency: 'USD',
      items: [{ item_name: "Founder's Deal - Lifetime Pro", price: 29.00 }],
    });
  }

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: 29.00,
      currency: 'USD',
      content_name: "Founder's Deal",
    });
  }
};

// Track plan selection
export const trackPlanSelect = (planName: string, price: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'select_item', {
      item_list_name: 'Pricing Plans',
      items: [{
        item_name: planName,
        price: price,
      }],
    });
  }

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: planName,
      value: price,
      currency: 'USD',
    });
  }
};
