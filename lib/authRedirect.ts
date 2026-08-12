import { Capacitor } from '@capacitor/core';

/**
 * Where Supabase should send a user back to after they tap a link in an auth
 * email (signup confirmation, password reset).
 *
 * These links are opened from a mail client in Safari, entirely outside the
 * app, so the target has to be a real https URL. Inside the Capacitor WebView
 * `window.location.origin` is the app's own custom scheme — `GearBase://localhost`
 * per capacitor.config.ts — which Safari cannot navigate to and which is not in
 * Supabase's Redirect URLs allowlist. Supabase would silently fall back to the
 * project Site URL.
 *
 * Native builds therefore hand off to the web app, matching how QR codes
 * already link to mygearbase.com (InventoryScreen.tsx). The user resets or
 * confirms in the browser, then returns to the app and signs in.
 *
 * This deliberately does NOT cover OAuth redirects: those bounce back into the
 * running app rather than through an email client, so the Capacitor scheme is
 * the correct target there.
 */
const WEB_ORIGIN = 'https://mygearbase.com';

export const authRedirectOrigin = (): string =>
  Capacitor.isNativePlatform() ? WEB_ORIGIN : window.location.origin;

/** `path` must start with a slash, e.g. '/reset-password'. */
export const authRedirectUrl = (path: string = ''): string =>
  `${authRedirectOrigin()}${path}`;
