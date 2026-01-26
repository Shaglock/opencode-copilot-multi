/**
 * OpenCode GitHub Copilot Multi-Account Plugin
 * 
 * Enables using multiple GitHub Copilot accounts simultaneously.
 * Each account's models appear in the model selector with format:
 *   copilot-multi/username:model-name
 * 
 * Architecture:
 * - Single auth hook for provider "copilot-multi"
 * - Custom fetch routes requests based on model ID
 * - Account pool stored separately from OpenCode auth
 * - Lazy loading - no blocking init
 * 
 * Management:
 * - Use CLI tool: opencode-copilot-multi list|remove|clear
 * 
 * @author Valerio Fantozzi
 * @license MIT
 */

import { logger } from './utils/logger.js';
import { createProviderLoader } from './provider.js';
import { getAccountPool } from './storage/pool.js';
import { detectAndAddNewAccount, syncAccounts } from './discovery/accounts.js';
import { PLUGIN_CONSTANTS } from './types.js';
import type { Plugin } from './types.js';

/**
 * Plugin entry point
 * 
 * IMPORTANT: This function must return quickly!
 * - No blocking HTTP calls
 * - No heavy I/O operations
 * - Defer everything to lazy loading
 */
export const plugin: Plugin = async ({ client }) => {
  logger.info('=== Copilot Multi-Account Plugin Starting ===');
  
  logger.info(`Registering provider: ${PLUGIN_CONSTANTS.PROVIDER_NAME}`);
  
  // Start background sync immediately (but don't await - let it run async)
  // This will detect new accounts and update config
  syncAccounts().catch((error) => {
    logger.error('Background sync failed', {
      error: error instanceof Error ? error.message : String(error)
    });
  });
  
  return {
    auth: {
      provider: PLUGIN_CONSTANTS.PROVIDER_NAME,
      methods: [], // No auth methods - we manage auth internally
      
      /**
       * Loader is called when OpenCode needs to use this provider
       * Returns custom fetch that handles multi-account routing
       */
      loader: async (_getAuth, _provider) => {
        logger.debug('Provider loader called');
        
        // Check if we have accounts
        const pool = await getAccountPool();
        
        if (pool.accounts.length === 0) {
          logger.warn('No accounts in pool. Use "opencode auth login" (GitHub Copilot) first.');
          // Try to detect from current auth
          await detectAndAddNewAccount();
        }
        
        return createProviderLoader();
      }
    },
    
    /**
     * Event hook for session events
     * Used to trigger account sync on new sessions and detect logout
     */
    event: async ({ event }) => {
      if (event.type === 'session.created') {
        logger.debug('New session created, syncing accounts...');
        // Non-blocking sync to detect changes (new accounts or logout)
        syncAccounts().catch(error => {
          logger.error('Account sync failed', {
            error: error instanceof Error ? error.message : String(error)
          });
        });
      }
    }
  };
};

// Default export for OpenCode plugin loader
export default plugin;
