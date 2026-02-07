/**
 * Application version configuration.
 * Update this when deploying new releases.
 */
export const APP_VERSION = '1.0.0';

/**
 * Build timestamp - auto-generated at build time.
 * In development, shows current date.
 */
export const BUILD_DATE = import.meta.env.PROD 
  ? new Date().toISOString().split('T')[0]
  : 'dev';

/**
 * Full version string for display.
 */
export const getVersionString = (): string => {
  return `v${APP_VERSION}`;
};

/**
 * Detailed version info for debugging.
 */
export const getVersionInfo = () => ({
  version: APP_VERSION,
  build: BUILD_DATE,
  environment: import.meta.env.MODE,
});
