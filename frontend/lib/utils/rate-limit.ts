/**
 * Rate limiting and debouncing utilities for SplitRent
 */

/**
 * Debounce function - delays execution until after wait milliseconds
 * Useful for: search inputs, balance refresh, auto-save
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let rejectPrev: (() => void) | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      // Reject previous pending call if exists
      if (rejectPrev) {
        rejectPrev();
      }

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      rejectPrev = null;

      timeoutId = setTimeout(() => {
        rejectPrev = null;
        timeoutId = null;
        resolve(fn(...args));
      }, wait);

      // Store reject for canceling
      rejectPrev = reject;
    });
  };
}

/**
 * Throttle function - limits execution to once per interval
 * Useful for: scroll handlers, resize, rapid button clicks
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> {
  let inThrottle = false;
  let lastResult: ReturnType<T> | null = null;

  return (...args: Parameters<T>): ReturnType<T> => {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = fn(...args);
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    
    return lastResult!;
  };
}

/**
 * Cooldown function - prevents execution until cooldown period expires
 * Useful for: wallet connection, payment submission, API calls
 */
export function createCooldown<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  cooldownMs: number,
  options?: {
    message?: string;
    onCooldown?: (remainingMs: number) => void;
  }
): (...args: Parameters<T>) => ReturnType<T> {
  let cooldownEnd = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): ReturnType<T> => {
    const now = Date.now();
    
    if (now < cooldownEnd) {
      const remaining = cooldownEnd - now;
      
      if (options?.onCooldown) {
        options.onCooldown(remaining);
      }
      
      throw new Error(options?.message || `Action on cooldown. Please wait ${Math.ceil(remaining / 1000)}s.`);
    }

    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Execute function
    const result = fn(...args);
    
    // Set cooldown
    cooldownEnd = Date.now() + cooldownMs;
    
    // Auto-clear cooldown
    timeoutId = setTimeout(() => {
      cooldownEnd = 0;
      timeoutId = null;
    }, cooldownMs);

    return result;
  };
}

/**
 * Async version of cooldown for Promise-based functions
 */
export function createAsyncCooldown<T extends (...args: Parameters<T>) => Promise<ReturnType<T>>>(
  fn: T,
  cooldownMs: number,
  options?: {
    message?: string;
  }
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let cooldownEnd = 0;
  let inProgress = false;

  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const now = Date.now();
    
    // Check if still on cooldown
    if (now < cooldownEnd && !inProgress) {
      const remaining = cooldownEnd - now;
      throw new Error(options?.message || `Action on cooldown. Please wait ${Math.ceil(remaining / 1000)}s.`);
    }

    // Check if already in progress
    if (inProgress) {
      throw new Error(options?.message || "Action already in progress.");
    }

    try {
      inProgress = true;
      const result = await fn(...args);
      cooldownEnd = Date.now() + cooldownMs;
      return result;
    } finally {
      inProgress = false;
    }
  };
}

/**
 * Rate limiter with token bucket algorithm
 * Useful for: API rate limiting, preventing spam
 */
export class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number; // tokens per millisecond
  private lastRefill: number;

  constructor(maxTokens: number, refillIntervalMs: number) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = 1 / refillIntervalMs;
    this.lastRefill = Date.now();
  }

  private refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const newTokens = elapsed * this.refillRate;
    this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
    this.lastRefill = now;
  }

  async acquire(tokens: number = 1): Promise<void> {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return;
    }

    // Calculate wait time
    const needed = tokens - this.tokens;
    const waitMs = needed / this.refillRate;

    await new Promise((resolve) => setTimeout(resolve, waitMs));
    
    this.refill();
    this.tokens -= tokens;
  }

  tryAcquire(tokens: number = 1): boolean {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    return false;
  }

  getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }
}

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
  // Balance refresh: max 1 every 5 seconds
  balanceRefresh: new RateLimiter(1, 5000),
  
  // Payment submission: max 1 every 10 seconds
  paymentSubmit: new RateLimiter(1, 10000),
  
  // Wallet connection: max 3 every 60 seconds
  walletConnect: new RateLimiter(3, 60000),
  
  // API calls: max 10 per second
  apiCall: new RateLimiter(10, 1000),
};
