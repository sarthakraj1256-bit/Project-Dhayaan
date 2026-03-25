/**
 * Application version configuration.
 * 
 * Version bumping:
 * - Automatically bumped via GitHub Actions on push to main
 * - Commit prefixes control bump type:
 *   - "breaking:" or "major:" → major version bump (1.0.0 → 2.0.0)
 *   - "feat:" or "feature:" or "minor:" → minor version bump (1.0.0 → 1.1.0)
 *   - Any other commit → patch version bump (1.0.0 → 1.0.1)
 */
export const APP_VERSION = '1.3.2';

/**
 * Build number - unique identifier for each production build.
 * Format: YYYYMMDD.HHMM (e.g., 20260207.1430)
 */
const generateBuildNumber = (): string => {
  if (!import.meta.env.PROD) return 'dev';
  const now = new Date();
  const date = now.toISOString().split('T')[0].replace(/-/g, '');
  const time = now.toTimeString().slice(0, 5).replace(':', '');
  return `${date}.${time}`;
};

export const BUILD_NUMBER = generateBuildNumber();

/**
 * Build timestamp - human-readable date.
 */
export const BUILD_DATE = import.meta.env.PROD 
  ? new Date().toISOString().split('T')[0]
  : 'dev';

/**
 * Full version string for display.
 * Shows build number in production for precise tracking.
 */
export const getVersionString = (): string => {
  if (!import.meta.env.PROD) {
    return `v${APP_VERSION}-dev`;
  }
  return `v${APP_VERSION}`;
};

/**
 * Extended version string with build number.
 */
export const getFullVersionString = (): string => {
  if (!import.meta.env.PROD) {
    return `v${APP_VERSION}-dev`;
  }
  return `v${APP_VERSION} (${BUILD_NUMBER})`;
};

/**
 * Detailed version info for debugging.
 */
export const getVersionInfo = () => ({
  version: APP_VERSION,
  build: BUILD_NUMBER,
  date: BUILD_DATE,
  environment: import.meta.env.MODE,
  full: getFullVersionString(),
});