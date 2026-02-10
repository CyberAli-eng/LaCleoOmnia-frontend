/**
 * Application configuration
 * Centralizes environment-based settings
 */

function getAppUrl(): string {
  // Respect explicit environment variable configuration
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  }

  // Fallback for development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // Default fallback
  return 'http://localhost:3000';
}

function getShopifyCallbackUrl(): string {
  const appUrl = getAppUrl();
  return `${appUrl}/auth/shopify/callback`;
}

// Validate app URL in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    console.warn(
      '⚠️ NEXT_PUBLIC_APP_URL is not set! ' +
      'Please set it in Vercel environment variables. ' +
      'Current app URL: http://localhost:3000'
    );
  }
}

export const appConfig = {
  appUrl: getAppUrl(),
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  environment: process.env.NEXT_PUBLIC_ENV || 'development',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'LaCleoOmnia',
  shopifyCallbackUrl: getShopifyCallbackUrl(),
};

export const getCallbackUrls = () => ({
  shopify: getShopifyCallbackUrl(),
});
