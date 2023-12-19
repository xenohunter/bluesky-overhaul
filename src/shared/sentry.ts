import * as Sentry from '@sentry/browser';
import { BLUESKY_OVERHAUL_VERSION } from './version';

export const initializeSentry = (context: 'content' | 'popup'): void => {
  if (process.env.SENTRY_DSN === undefined) {
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: BLUESKY_OVERHAUL_VERSION,
    environment: `${context}__${process.env.ENVIRONMENT}`,
    integrations: [new Sentry.BrowserTracing()],
    tracesSampleRate: 1.0
  });
};
