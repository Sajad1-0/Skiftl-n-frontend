/** Central brand assets – use everywhere (in-app logo + favicon). */
/** Icon mark only (transparent bg) — for nav / in-app Logo. */
export const BRAND_MARK_PATH = '/brand/logo.png' as const;
/** Full lockup with black bg — Open Graph / social. */
export const BRAND_LOGO_PATH = '/brand/logo-full.png' as const;
/** Browser tab / PWA icon. */
export const BRAND_FAVICON_PATH = '/brand/shiftkit-favicon.png' as const;
export const BRAND_NAME = 'Shiftkit' as const;
export const BRAND_DOMAIN = 'shiftkit.app' as const;

/** @deprecated Use BRAND_MARK_PATH */
export const BRAND_ICON_PATH = BRAND_MARK_PATH;
