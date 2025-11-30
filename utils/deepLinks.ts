/**
 * Deep linking utilities for generating shareable URLs
 * Used for QR codes and external links
 */

/**
 * Get the base URL of the application
 * In production, this should be your deployed domain
 * In development, this will be your local server
 */
export const getBaseUrl = (): string => {
  // Use production domain in production, local in development
  if (typeof window !== 'undefined') {
    // Check if we're in production (not localhost)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return 'https://mygearbase.com';
    }
    // Development: use local server
    return window.location.origin;
  }
  return '';
};

/**
 * Generate a deep link URL for a specific inventory item
 * @param itemId - The ID of the inventory item
 * @returns A full URL that will navigate directly to the item detail page
 */
export const getItemDeepLink = (itemId: number): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/?item=${itemId}`;
};

/**
 * Generate a deep link URL for a specific job
 * @param jobId - The ID of the job
 * @returns A full URL that will navigate directly to the job detail page
 */
export const getJobDeepLink = (jobId: number): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/?job=${jobId}`;
};

/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copy is complete
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-HTTPS contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
};
