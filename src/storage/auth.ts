/**
 * Storage for reading OpenCode's auth.json
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { logger } from '../utils/logger.js';
import type { OAuthData } from '../types.js';

/**
 * Get path to OpenCode's auth.json
 */
function getAuthPath(): string {
  const homeDir = os.homedir();
  const xdgDataHome = process.env.XDG_DATA_HOME;
  
  if (xdgDataHome) {
    return path.join(xdgDataHome, 'opencode', 'auth.json');
  }
  
  if (process.platform !== 'win32') {
    return path.join(homeDir, '.local', 'share', 'opencode', 'auth.json');
  }
  
  return path.join(homeDir, '.opencode', 'auth.json');
}

/**
 * Read GitHub Copilot auth from OpenCode's auth.json
 * Returns null if not found or invalid
 */
export async function getGitHubCopilotAuth(): Promise<OAuthData | null> {
  const authPath = getAuthPath();
  
  try {
    if (!fs.existsSync(authPath)) {
      logger.debug('Auth file not found', { path: authPath });
      return null;
    }
    
    const content = fs.readFileSync(authPath, 'utf-8');
    const authData = JSON.parse(content);
    
    const copilotAuth = authData['github-copilot'];
    
    if (!copilotAuth) {
      logger.debug('No github-copilot entry in auth.json');
      return null;
    }
    
    if (copilotAuth.type !== 'oauth') {
      logger.debug('github-copilot auth is not oauth type', { type: copilotAuth.type });
      return null;
    }
    
    // Validate required fields
    // Note: expires can be 0 for non-expiring tokens (gho_* tokens)
    if (!copilotAuth.refresh || !copilotAuth.access || copilotAuth.expires === undefined) {
      logger.warn('github-copilot auth missing required fields');
      return null;
    }
    
    return {
      type: 'oauth',
      refresh: copilotAuth.refresh,
      access: copilotAuth.access,
      expires: copilotAuth.expires,
    };
    
  } catch (error) {
    logger.error('Failed to read auth.json', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return null;
  }
}

/**
 * Generate a stable ID from refresh token (hash first 16 chars)
 */
export function generateAccountId(refreshToken: string): string {
  // Simple hash for ID - just use first 16 chars encoded
  const prefix = refreshToken.slice(0, 16);
  return Buffer.from(prefix).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
}

/**
 * Register copilot-multi provider in OpenCode's auth.json
 * This is required so OpenCode knows to call our auth loader
 * 
 * @returns true if registration was successful, false otherwise
 */
export async function registerProviderInAuthJson(): Promise<boolean> {
  const authPath = getAuthPath();
  
  try {
    // Read existing auth.json or create empty object
    let authData: Record<string, unknown> = {};
    
    if (fs.existsSync(authPath)) {
      const content = fs.readFileSync(authPath, 'utf-8');
      authData = JSON.parse(content);
      logger.debug('Read existing auth.json', { path: authPath });
    } else {
      logger.debug('auth.json not found, will create new one', { path: authPath });
    }
    
    // Check if copilot-multi is already registered
    if (authData['copilot-multi']) {
      logger.debug('copilot-multi already registered in auth.json');
      return true;
    }
    
    // Add copilot-multi provider entry
    // Empty credentials since we manage auth internally via our loader
    authData['copilot-multi'] = {
      type: 'oauth',
      refresh: '',
      access: '',
      expires: 0
    };
    
    // Ensure directory exists
    const authDir = path.dirname(authPath);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }
    
    // Write updated auth.json
    fs.writeFileSync(authPath, JSON.stringify(authData, null, 2), { mode: 0o600 });
    
    logger.info('Registered copilot-multi in auth.json', { path: authPath });
    return true;
    
  } catch (error) {
    logger.error('Failed to register provider in auth.json', {
      error: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
}
