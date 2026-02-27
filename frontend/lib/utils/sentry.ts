/**
 * Sentry error tracking integration for SplitRent
 * 
 * To enable:
 * 1. Install: pnpm add @sentry/nextjs
 * 2. Create .env.local with NEXT_PUBLIC_SENTRY_DSN
 * 3. Wrap app with Sentry.init in layout.tsx
 */

import * as Sentry from "@sentry/nextjs";

interface SentryConfig {
  dsn?: string;
  environment?: string;
  sampleRate?: number;
  tracesSampleRate?: number;
}

let isInitialized = false;

/**
 * Initialize Sentry error tracking
 * Call once at app startup
 */
export function initSentry(config?: SentryConfig): void {
  if (isInitialized) {
    return;
  }

  const dsn = config?.dsn || process.env.NEXT_PUBLIC_SENTRY_DSN;
  
  if (!dsn) {
    console.warn("Sentry DSN not provided. Error tracking disabled.");
    return;
  }

  Sentry.init({
    dsn,
    environment: config?.environment || process.env.NODE_ENV,
    
    // Error sample rate (1.0 = 100%)
    sampleRate: config?.sampleRate ?? 1.0,
    
    // Performance monitoring sample rate
    tracesSampleRate: config?.tracesSampleRate ?? 0.1,
    
    // Don't log errors in development by default
    enabled: process.env.NODE_ENV === "production",
    
    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Before send hook to filter sensitive data
    beforeSend(event, hint) {
      // Don't log errors in development
      if (process.env.NODE_ENV === "development") {
        console.log("[Sentry] Event:", event);
        return null;
      }
      
      // Remove sensitive data from events
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      
      return event;
    },
    
    // Configure breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      // Filter out sensitive breadcrumbs
      if (breadcrumb.category === "console") {
        // Keep only warnings and errors
        if (breadcrumb.level !== "warning" && breadcrumb.level !== "error") {
          return null;
        }
      }
      return breadcrumb;
    },
  });

  isInitialized = true;
  console.log("Sentry initialized");
}

/**
 * Capture an exception manually
 */
export function captureException(error: Error, context?: {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}): string | undefined {
  if (!isInitialized) {
    console.error("Sentry not initialized");
    return undefined;
  }

  return Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
  });
}

/**
 * Capture a message (info, warning, error)
 */
export function captureMessage(message: string, level?: "info" | "warning" | "error"): string | undefined {
  if (!isInitialized) {
    return undefined;
  }

  return Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
  id?: string;
  username?: string;
  email?: string;
  walletAddress?: string;
}): void {
  if (!isInitialized) {
    return;
  }

  // Hash wallet address for privacy
  const hashedUser = { ...user };
  if (user.walletAddress) {
    // Only keep last 4 characters for privacy
    hashedUser.walletAddress = `***${user.walletAddress.slice(-4)}`;
  }

  Sentry.setUser(hashedUser);
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext(): void {
  if (!isInitialized) {
    return;
  }

  Sentry.setUser(null);
}

/**
 * Add a breadcrumb (user action log)
 */
export function addBreadcrumb(message: string, category?: string, level?: Sentry.SeverityLevel): void {
  if (!isInitialized) {
    return;
  }

  Sentry.addBreadcrumb({
    message,
    category: category || "default",
    level: level || "info",
    timestamp: Date.now() / 1000,
  });
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op?: string): Sentry.Span | undefined {
  if (!isInitialized) {
    return undefined;
  }

  return Sentry.startSpan({ name, op: op || "default" });
}

/**
 * Check if Sentry is enabled
 */
export function isSentryEnabled(): boolean {
  return isInitialized && !!process.env.NEXT_PUBLIC_SENTRY_DSN;
}

export default {
  initSentry,
  captureException,
  captureMessage,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  startTransaction,
  isSentryEnabled,
};
