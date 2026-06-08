// Typed logger wrapper. No Sentry, no Bugsnag, no Crashlytics, no third-party SDK,
// by design. It logs in development and no-ops in release, so nothing about the user
// or their finances ever leaves the device. This is part of the privacy guarantee.

type Extra = Record<string, unknown>;

const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

export const errorReporter = {
  captureError(error: unknown, context?: Extra): void {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn('[solvent:error]', error, context ?? {});
    }
  },
  captureMessage(message: string, context?: Extra): void {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log('[solvent:log]', message, context ?? {});
    }
  },
};
