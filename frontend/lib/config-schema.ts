/**
 * Environment configuration schema and validation for SplitRent.
 * 
 * Uses Zod for runtime validation of environment variables.
 * This ensures the app fails fast with clear error messages if configuration is invalid.
 */

import { z } from "zod";

// Define the schema for environment variables
const envSchema = z.object({
  // Stellar network configuration
  NEXT_PUBLIC_HORIZON_URL: z.string().url().optional().default("https://horizon-testnet.stellar.org"),
  NEXT_PUBLIC_STELLAR_NETWORK: z.enum(["testnet", "mainnet"]).optional().default("testnet"),
  NEXT_PUBLIC_EXPLORER_BASE_URL: z.string().url().optional().default("https://stellar.expert/explorer/testnet/tx"),
  NEXT_PUBLIC_FRIENDBOT_URL: z.string().url().optional().default("https://laboratory.stellar.org/#account-creator?network=test"),
  
  // Application configuration
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().optional().default("SplitRent"),
  
  // Feature flags
  NEXT_PUBLIC_ENABLE_MAINNET: z.enum(["true", "false"]).optional().default("false"),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.enum(["true", "false"]).optional().default("false"),
  
  // Optional service URLs (for future features)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
});

// Type derived from schema
export type EnvConfig = z.infer<typeof envSchema>;

// Validation result
let validatedConfig: EnvConfig | null = null;
let validationError: string | null = null;

/**
 * Validate environment variables
 * Call this once at app startup
 */
export function validateEnv(): { valid: boolean; error?: string; config?: EnvConfig } {
  if (validatedConfig) {
    return { valid: true, config: validatedConfig };
  }

  if (typeof process === "undefined") {
    // Client-side: use NEXT_PUBLIC_ variables from window
    // They should be injected by Next.js at build time
    return { valid: true };
  }

  try {
    validatedConfig = envSchema.parse(process.env);
    return { valid: true, config: validatedConfig };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => {
        return `${issue.path.join(".")}: ${issue.message}`;
      });
      
      validationError = "Environment validation failed:\n" + issues.join("\n");
      console.error(validationError);
      
      return { 
        valid: false, 
        error: validationError 
      };
    }
    
    validationError = "Unknown environment validation error";
    console.error(validationError);
    return { valid: false, error: validationError };
  }
}

/**
 * Get validated config value
 * Throws if validation hasn't been run or failed
 */
export function getConfig<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
  if (!validatedConfig) {
    // Auto-validate if not already done
    const result = validateEnv();
    if (!result.valid) {
      throw new Error(result.error || "Environment validation failed");
    }
  }
  
  return validatedConfig![key];
}

/**
 * Check if config is valid without throwing
 */
export function isConfigValid(): boolean {
  if (validatedConfig) {
    return true;
  }
  
  const result = validateEnv();
  return result.valid;
}

/**
 * Get validation error if any
 */
export function getValidationError(): string | null {
  if (!validatedConfig) {
    validateEnv();
  }
  return validationError;
}

// Export validated config
export const config = validatedConfig;
