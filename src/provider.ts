/**
 * Provider implementation with custom fetch for multi-account routing
 */

import { logger } from './utils/logger.js';
import { 
  AccountNotFoundError, 
  InvalidModelIdError, 
  TokenRefreshError 
} from './utils/errors.js';
import { getAccountPool, updateAccountInPool } from './storage/pool.js';
import { COPILOT_HEADERS, PLUGIN_CONSTANTS } from './types.js';
import type { Account } from './types.js';

// Token refresh mutex to prevent concurrent refreshes
const refreshLocks = new Map<string, Promise<void>>();

/**
 * Parse model ID to extract username and real model
 * Format: "username:model-id" -> { username: "username", model: "model-id" }
 */
function parseModelId(modelId: string): { username: string; model: string } {
  const colonIndex = modelId.indexOf(':');
  
  if (colonIndex === -1) {
    throw new InvalidModelIdError(modelId);
  }
  
  const username = modelId.slice(0, colonIndex);
  const model = modelId.slice(colonIndex + 1);
  
  if (!username || !model) {
    throw new InvalidModelIdError(modelId);
  }
  
  return { username, model };
}

/**
 * Refresh token for an account if needed
 */
async function refreshTokenIfNeeded(account: Account): Promise<void> {
  const now = Date.now();
  const expiresAt = account.auth.expires;
  const bufferMs = PLUGIN_CONSTANTS.TOKEN_REFRESH_BUFFER_MS;
  
  // expires: 0 means the token never expires (gho_* tokens)
  if (expiresAt === 0) {
    logger.debug(`Token never expires for ${account.username} (gho_* token)`);
    return;
  }
  
  // Check if token is still valid
  if (expiresAt > now + bufferMs) {
    logger.debug(`Token valid for ${account.username}`, {
      expiresIn: Math.round((expiresAt - now) / 1000 / 60) + ' minutes'
    });
    return;
  }
  
  logger.info(`Token expired or expiring soon for ${account.username}, refreshing...`);
  
  // Check for existing refresh in progress
  const existingLock = refreshLocks.get(account.id);
  if (existingLock) {
    logger.debug(`Waiting for existing refresh for ${account.username}`);
    await existingLock;
    return;
  }
  
  // Create refresh lock
  const refreshPromise = (async () => {
    try {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: 'Iv1.b507a08c87ecfe98', // VS Code client ID
          grant_type: 'refresh_token',
          refresh_token: account.auth.refresh,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }
      
      const data = await response.json() as {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
        error?: string;
      };
      
      if (data.error || !data.access_token) {
        throw new Error(data.error || 'No access token in response');
      }
      
      // Update account with new tokens
      account.auth.access = data.access_token;
      if (data.refresh_token) {
        account.auth.refresh = data.refresh_token;
      }
      account.auth.expires = Date.now() + (data.expires_in || 28800) * 1000;
      
      // Persist updated account
      await updateAccountInPool(account);
      
      logger.info(`Token refreshed for ${account.username}`, {
        expiresIn: Math.round((account.auth.expires - Date.now()) / 1000 / 60) + ' minutes'
      });
      
    } catch (error) {
      logger.error(`Token refresh failed for ${account.username}`, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new TokenRefreshError(
        account.username, 
        error instanceof Error ? error : undefined
      );
    } finally {
      refreshLocks.delete(account.id);
    }
  })();
  
  refreshLocks.set(account.id, refreshPromise);
  await refreshPromise;
}

/**
 * Create the provider loader with custom fetch
 * This is what OpenCode calls when using copilot-multi provider
 */
export function createProviderLoader() {
  logger.info('createProviderLoader called - returning config with baseURL:', { baseURL: PLUGIN_CONSTANTS.BASE_URL });
  return {
    baseURL: PLUGIN_CONSTANTS.BASE_URL,
    apiKey: '', // Not used - we inject auth in fetch
    
    /**
     * Custom fetch that routes requests to the correct account
     */
    async fetch(input: Request | string | URL, init?: RequestInit): Promise<Response> {
      logger.info('Custom fetch called', { input: String(input) });
      const startTime = Date.now();
      
      try {
        // Parse request body to get model
        let body: Record<string, unknown> = {};
        if (init?.body && typeof init.body === 'string') {
          body = JSON.parse(init.body);
        }
        
        const modelId = body.model as string;
        if (!modelId) {
          throw new Error('No model specified in request');
        }
        
        logger.debug(`Request for model: ${modelId}`);
        
        // Parse model ID to get username and real model
        const { username, model } = parseModelId(modelId);
        logger.debug(`Routing to account: ${username}, model: ${model}`);
        
        // Load account pool and find account
        const pool = await getAccountPool();
        const account = pool.accounts.find(a => a.username === username);
        
        if (!account) {
          throw new AccountNotFoundError(username);
        }
        
        // Refresh token if needed
        await refreshTokenIfNeeded(account);
        
        // Replace model in body with the real model name
        body.model = model;
        
        // Build headers
        const headers = new Headers(init?.headers);
        headers.set('Authorization', `Bearer ${account.auth.access}`);
        
        // Add Copilot headers
        for (const [key, value] of Object.entries(COPILOT_HEADERS)) {
          headers.set(key, value);
        }
        
        // Update last used timestamp
        account.lastUsed = Date.now();
        
        // Make the actual request
        const response = await fetch(input, {
          ...init,
          body: JSON.stringify(body),
          headers,
        });
        
        const duration = Date.now() - startTime;
        logger.info(`Request completed`, {
          account: username,
          model,
          status: response.status,
          duration: `${duration}ms`
        });
        
        return response;
        
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`Request failed`, {
          error: error instanceof Error ? error.message : String(error),
          duration: `${duration}ms`
        });
        throw error;
      }
    }
  };
}
