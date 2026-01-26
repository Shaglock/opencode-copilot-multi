/**
 * Account pool storage with lazy loading singleton
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { logger } from '../utils/logger.js';
import { PoolCorruptedError } from '../utils/errors.js';
import { PLUGIN_CONSTANTS } from '../types.js';
import type { AccountPool, Account } from '../types.js';

/**
 * Get path to the account pool file
 */
function getPoolPath(): string {
  const homeDir = os.homedir();
  const dataDir = process.env.XDG_DATA_HOME
    ? path.join(process.env.XDG_DATA_HOME, 'opencode')
    : path.join(homeDir, '.local', 'share', 'opencode');
  
  return path.join(dataDir, PLUGIN_CONSTANTS.POOL_FILE);
}

/**
 * Create an empty pool
 */
function createEmptyPool(): AccountPool {
  return {
    version: PLUGIN_CONSTANTS.POOL_VERSION,
    accounts: [],
    lastUpdated: Date.now(),
  };
}

/**
 * Validate pool structure
 */
function isValidPool(data: unknown): data is AccountPool {
  if (!data || typeof data !== 'object') return false;
  const pool = data as AccountPool;
  
  return (
    typeof pool.version === 'number' &&
    Array.isArray(pool.accounts) &&
    typeof pool.lastUpdated === 'number'
  );
}

// Singleton cache
let poolInstance: AccountPool | null = null;
let loadPromise: Promise<AccountPool> | null = null;

/**
 * Load account pool from disk
 */
async function loadPoolFromDisk(): Promise<AccountPool> {
  const poolPath = getPoolPath();
  
  try {
    if (!fs.existsSync(poolPath)) {
      logger.info('Pool file not found, creating empty pool');
      return createEmptyPool();
    }
    
    const content = fs.readFileSync(poolPath, 'utf-8');
    const data = JSON.parse(content);
    
    if (!isValidPool(data)) {
      logger.warn('Pool file has invalid structure, creating new pool');
      // Backup corrupted file
      const backupPath = `${poolPath}.backup.${Date.now()}`;
      fs.renameSync(poolPath, backupPath);
      return createEmptyPool();
    }
    
    logger.info(`Loaded pool with ${data.accounts.length} accounts`);
    return data;
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      logger.error('Pool file is corrupted (invalid JSON)');
      throw new PoolCorruptedError(poolPath);
    }
    throw error;
  }
}

/**
 * Get account pool (lazy loaded, cached)
 */
export async function getAccountPool(): Promise<AccountPool> {
  if (poolInstance) {
    return poolInstance;
  }
  
  if (!loadPromise) {
    loadPromise = loadPoolFromDisk().then(pool => {
      poolInstance = pool;
      return pool;
    });
  }
  
  return loadPromise;
}

/**
 * Save account pool to disk
 */
export async function saveAccountPool(pool: AccountPool): Promise<void> {
  const poolPath = getPoolPath();
  const poolDir = path.dirname(poolPath);
  
  // Ensure directory exists
  if (!fs.existsSync(poolDir)) {
    fs.mkdirSync(poolDir, { recursive: true });
  }
  
  // Update timestamp
  pool.lastUpdated = Date.now();
  
  // Write with pretty formatting
  fs.writeFileSync(poolPath, JSON.stringify(pool, null, 2));
  fs.chmodSync(poolPath, 0o600); // Secure permissions
  
  // Update cache
  poolInstance = pool;
  
  logger.info('Pool saved', { accounts: pool.accounts.length });
}

/**
 * Add account to pool (if not exists)
 */
export async function addAccountToPool(account: Account): Promise<boolean> {
  const pool = await getAccountPool();
  
  // Check if already exists (by ID or username)
  const exists = pool.accounts.some(
    a => a.id === account.id || a.username === account.username
  );
  
  if (exists) {
    logger.debug('Account already in pool', { username: account.username });
    return false;
  }
  
  pool.accounts.push(account);
  await saveAccountPool(pool);
  
  logger.info('Account added to pool', { username: account.username });
  return true;
}

/**
 * Update account in pool
 */
export async function updateAccountInPool(account: Account): Promise<void> {
  const pool = await getAccountPool();
  
  const index = pool.accounts.findIndex(a => a.id === account.id);
  if (index === -1) {
    logger.warn('Account not found for update', { id: account.id });
    return;
  }
  
  pool.accounts[index] = account;
  await saveAccountPool(pool);
}

/**
 * Find account by username
 */
export async function findAccountByUsername(username: string): Promise<Account | undefined> {
  const pool = await getAccountPool();
  return pool.accounts.find(a => a.username === username);
}

/**
 * Invalidate pool cache (for testing or forced reload)
 */
export function invalidatePoolCache(): void {
  poolInstance = null;
  loadPromise = null;
  logger.debug('Pool cache invalidated');
}
