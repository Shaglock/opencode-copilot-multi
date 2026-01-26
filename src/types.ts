/**
 * Type definitions for opencode-copilot-multi plugin
 */

import type { Plugin } from '@opencode-ai/plugin';

export type { Plugin };

/**
 * OAuth authentication data structure
 */
export interface OAuthData {
  type: 'oauth';
  refresh: string;
  access: string;
  expires: number;
}

/**
 * Account in the multi-account pool
 */
export interface Account {
  /** Unique identifier (based on refresh token hash) */
  id: string;
  /** GitHub username */
  username: string;
  /** Display name for UI */
  displayName: string;
  /** OAuth credentials */
  auth: OAuthData;
  /** Available models for this account */
  models: string[];
  /** When the account was added */
  addedAt: number;
  /** Last successful API call */
  lastUsed?: number;
}

/**
 * Account pool storage schema
 */
export interface AccountPool {
  version: number;
  accounts: Account[];
  lastUpdated: number;
}

/**
 * Model configuration for opencode.json
 */
export interface ModelConfig {
  name: string;
  limit: {
    context: number;
    output: number;
  };
  modalities: {
    input: string[];
    output: string[];
  };
}

/**
 * Provider configuration for opencode.json
 */
export interface ProviderConfig {
  options?: {
    baseURL?: string;
    apiKey?: string;
  };
  models: Record<string, ModelConfig>;
}

/**
 * OpenCode config structure (partial)
 */
export interface OpencodeConfig {
  plugin?: string[];
  provider?: Record<string, ProviderConfig>;
  command?: Record<string, {
    template: string;
    description?: string;
    agent?: string;
    model?: string;
  }>;
  [key: string]: unknown;
}

/**
 * GitHub Copilot API headers
 */
export const COPILOT_HEADERS = {
  'Editor-Version': 'vscode/1.95.0',
  'Editor-Plugin-Version': 'copilot/1.250.0',
  'Copilot-Integration-Id': 'vscode-chat',
  'Openai-Intent': 'conversation-panel',
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;

/**
 * Plugin constants
 */
export const PLUGIN_CONSTANTS = {
  /** Package name (for npm and plugin registration) */
  PACKAGE_NAME: 'opencode-copilot-multi',
  /** Provider name registered with OpenCode */
  PROVIDER_NAME: 'copilot-multi',
  /** Base URL for GitHub Copilot API */
  BASE_URL: 'https://api.githubcopilot.com',
  /** Pool file name */
  POOL_FILE: 'copilot-multi-accounts.json',
  /** Current pool schema version */
  POOL_VERSION: 1,
  /** Token refresh buffer (5 minutes before expiry) */
  TOKEN_REFRESH_BUFFER_MS: 5 * 60 * 1000,
} as const;
