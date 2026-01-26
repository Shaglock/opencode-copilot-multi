/**
 * Account discovery and management
 * Non-blocking - called lazily, not at init
 */

import { logger } from '../utils/logger.js';
import { getGitHubCopilotAuth, generateAccountId } from '../storage/auth.js';
import { getAccountPool, addAccountToPool, saveAccountPool } from '../storage/pool.js';
import { fetchGitHubUsername } from './username.js';
import { DEFAULT_COPILOT_MODELS } from './models.js';
import { writeModelsToConfig } from '../config/writer.js';
import type { Account, OAuthData } from '../types.js';

/**
 * Create a new account object
 */
function createAccount(username: string, auth: OAuthData): Account {
  return {
    id: generateAccountId(auth.refresh),
    username,
    displayName: username, // Can be customized later
    auth,
    models: [...DEFAULT_COPILOT_MODELS],
    addedAt: Date.now(),
  };
}

/**
 * Check if account already exists in pool (by refresh token)
 */
async function accountExistsInPool(auth: OAuthData): Promise<boolean> {
  const pool = await getAccountPool();
  const id = generateAccountId(auth.refresh);
  return pool.accounts.some(a => a.id === id);
}

/**
 * Detect and add new account from OpenCode's github-copilot auth
 * This is called lazily (on first request or explicit sync)
 * 
 * @returns The new account if added, null if already exists or no auth
 */
export async function detectAndAddNewAccount(): Promise<Account | null> {
  logger.info('Checking for new GitHub Copilot account...');
  
  // Get current auth from OpenCode
  const currentAuth = await getGitHubCopilotAuth();
  
  if (!currentAuth) {
    logger.info('No GitHub Copilot auth found in OpenCode');
    return null;
  }
  
  // Check if already in pool
  const exists = await accountExistsInPool(currentAuth);
  
  if (exists) {
    logger.debug('Account already in pool');
    return null;
  }
  
  // New account! Fetch username
  logger.info('New account detected, fetching username...');
  
  try {
    const username = await fetchGitHubUsername(currentAuth.access);
    
    // Create and add account
    const newAccount = createAccount(username, currentAuth);
    await addAccountToPool(newAccount);
    
    // Update config with new models
    const pool = await getAccountPool();
    await writeModelsToConfig(pool.accounts);
    
    logger.info(`New account added: ${username}`);
    return newAccount;
    
  } catch (error) {
    logger.error('Failed to add new account', {
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

/**
 * Sync all accounts - update auth if changed, clean if removed
 * Called periodically or on demand
 * 
 * This function:
 * 1. Checks if github-copilot auth still exists
 * 2. If no auth, clears all accounts (user logged out)
 * 3. If auth exists but token changed, adds new account
 * 4. Updates config with current accounts
 */
export async function syncAccounts(): Promise<void> {
  logger.info('Syncing accounts...');
  
  // Check if github-copilot auth still exists
  const currentAuth = await getGitHubCopilotAuth();
  const pool = await getAccountPool();
  
  if (!currentAuth) {
    // No github-copilot auth found - user logged out from GitHub Copilot
    if (pool.accounts.length > 0) {
      logger.info('GitHub Copilot auth removed, clearing all accounts from pool');
      pool.accounts = [];
      pool.lastUpdated = Date.now();
      await saveAccountPool(pool);
      await writeModelsToConfig([]);
      logger.info('All accounts cleared due to logout');
    } else {
      logger.debug('No auth and no accounts - nothing to sync');
    }
    return;
  }
  
  // Auth exists - check if it matches any account in pool
  const currentId = generateAccountId(currentAuth.refresh);
  const accountExists = pool.accounts.some(a => a.id === currentId);
  
  if (!accountExists) {
    // New account detected (token changed)
    logger.info('Token changed or new account, detecting...');
    await detectAndAddNewAccount();
  } else {
    // Same account - update auth if needed
    const account = pool.accounts.find(a => a.id === currentId);
    if (account) {
      // Update tokens in case they changed (e.g., refresh)
      if (account.auth.access !== currentAuth.access || 
          account.auth.refresh !== currentAuth.refresh) {
        logger.debug('Updating tokens for existing account');
        account.auth = currentAuth;
        await saveAccountPool(pool);
      }
    }
  }
  
  // Update config with current accounts
  const updatedPool = await getAccountPool();
  await writeModelsToConfig(updatedPool.accounts);
  
  logger.info(`Sync complete. ${updatedPool.accounts.length} accounts in pool.`);
}
