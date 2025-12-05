/**
 * Analytics tracking utilities
 */

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: any) => void;
  }
}

export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }

  // Console log in development
  if (import.meta.env.DEV) {
    console.log('📊 Analytics Event:', eventName, params);
  }
};

export const trackResourceView = (resourceId: string, resourceName: string, resourceType: string) => {
  trackEvent('view_resource', {
    resource_id: resourceId,
    resource_name: resourceName,
    resource_type: resourceType
  });
};

export const trackResourceContact = (
  resourceId: string,
  resourceName: string,
  method: 'phone' | 'email' | 'website'
) => {
  trackEvent('contact_resource', {
    resource_id: resourceId,
    resource_name: resourceName,
    contact_method: method
  });
};

export const trackResourceShare = (resourceId: string, resourceName: string) => {
  trackEvent('share_resource', {
    resource_id: resourceId,
    resource_name: resourceName
  });
};

export const trackResourceExport = (resourceId: string, resourceName: string) => {
  trackEvent('export_resource', {
    resource_id: resourceId,
    resource_name: resourceName
  });
};

export const trackFavoriteToggle = (resourceId: string, action: 'add' | 'remove') => {
  trackEvent('favorite_toggle', {
    resource_id: resourceId,
    action
  });
};

export const trackSearch = (query: string, resultsCount: number) => {
  trackEvent('search', {
    search_query: query,
    results_count: resultsCount
  });
};

export const trackFilterChange = (filterType: string, filterValue: string) => {
  trackEvent('filter_change', {
    filter_type: filterType,
    filter_value: filterValue
  });
};