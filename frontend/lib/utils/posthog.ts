/**
 * PostHog analytics integration for SplitRent
 * 
 * To enable:
 * 1. Install: pnpm add posthog-js
 * 2. Create .env.local with NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST
 * 3. Initialize in layout.tsx
 */

import posthog, { PostHog } from "posthog-js";

interface PostHogConfig {
  apiKey?: string;
  host?: string;
  autocapture?: boolean;
  capturePageview?: boolean;
}

let isInitialized = false;
let posthogInstance: PostHog | null = null;

/**
 * Initialize PostHog analytics
 * Call once at app startup
 */
export function initPostHog(config?: PostHogConfig): PostHog | null {
  if (isInitialized) {
    return posthogInstance;
  }

  const apiKey = config?.apiKey || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = config?.host || process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

  if (!apiKey) {
    console.warn("PostHog API key not provided. Analytics disabled.");
    return null;
  }

  try {
    posthog.init(apiKey, {
      api_host: host,
      
      // Enable autocapture
      autocapture: config?.autocapture ?? false,
      
      // Capture pageviews
      capture_pageview: config?.capturePageview ?? true,
      
      // Session recording
      session_recording: {
        recordCrossOriginIframes: false,
        maskAllInputs: true,
        maskInputOptions: {
          password: true,
          creditCard: true,
        },
      },
      
      // Privacy settings
      disable_session_recording: process.env.NODE_ENV === "development",
      
      // Bootstrap for faster loading
      bootstrap: {
        distinctID: undefined,
        isIdentifiedID: false,
      },
      
      // Opt out by default in development
      opt_out_capturing_by_default: process.env.NODE_ENV === "development",
      
      // Session ID rotation
      session_idle_timeout_seconds: 30 * 60, // 30 minutes
      session_max_length_seconds: 24 * 60 * 60, // 24 hours
    });

    posthogInstance = posthog;
    isInitialized = true;
    console.log("PostHog initialized");
    
    return posthogInstance;
  } catch (error) {
    console.error("Failed to initialize PostHog:", error);
    return null;
  }
}

/**
 * Identify a user
 */
export function identifyUser(
  distinctId: string,
  properties?: {
    walletAddress?: string;
    joinedAt?: string;
    plan?: string;
  }
): void {
  if (!posthogInstance || !isInitialized) {
    return;
  }

  // Hash sensitive data
  const safeProperties = { ...properties };
  if (properties?.walletAddress) {
    safeProperties.walletAddress = `***${properties.walletAddress.slice(-4)}`;
    safeProperties.walletAddressFull = undefined; // Never send full address
  }

  posthog.identify(distinctId, safeProperties);
}

/**
 * Reset user state (on logout)
 */
export function resetUser(): void {
  if (!posthogInstance || !isInitialized) {
    return;
  }

  posthog.reset();
}

/**
 * Capture a custom event
 */
export function captureEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (!posthogInstance || !isInitialized) {
    return;
  }

  // Sanitize properties - remove sensitive data
  const safeProperties = { ...properties };
  if (safeProperties.walletAddress) {
    safeProperties.walletAddress = `***${String(safeProperties.walletAddress).slice(-4)}`;
  }
  if (safeProperties.transactionHash) {
    safeProperties.transactionHash = `${String(safeProperties.transactionHash).slice(0, 8)}...`;
  }

  posthog.capture(eventName, safeProperties);
}

/**
 * Set person properties
 */
export function setPersonProperties(properties: Record<string, unknown>): void {
  if (!posthogInstance || !isInitialized) {
    return;
  }

  posthog.setPersonProperties(properties);
}

/**
 * Feature flags
 */
export function isFeatureEnabled(flag: string): boolean {
  if (!posthogInstance || !isInitialized) {
    return false;
  }

  return posthog.isFeatureEnabled(flag) ?? false;
}

export function getFeatureFlag(flag: string): string | boolean | undefined {
  if (!posthogInstance || !isInitialized) {
    return undefined;
  }

  return posthog.getFeatureFlag(flag);
}

/**
 * Opt in/out of analytics
 */
export function optIn(): void {
  if (!posthogInstance || !isInitialized) {
    return;
  }

  posthog.opt_in_capturing();
}

export function optOut(): void {
  if (!posthogInstance || !isInitialized) {
    return;
  }

  posthog.opt_out_capturing();
}

export function hasOptedIn(): boolean {
  if (!posthogInstance || !isInitialized) {
    return false;
  }

  return posthog.has_opted_in_capturing();
}

/**
 * Check if PostHog is enabled
 */
export function isPostHogEnabled(): boolean {
  return isInitialized && !!posthogInstance && !!process.env.NEXT_PUBLIC_POSTHOG_KEY;
}

export default {
  initPostHog,
  identifyUser,
  resetUser,
  captureEvent,
  setPersonProperties,
  isFeatureEnabled,
  getFeatureFlag,
  optIn,
  optOut,
  hasOptedIn,
  isPostHogEnabled,
};
