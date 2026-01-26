/**
 * Config writer - writes models to opencode.json
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { logger } from '../utils/logger.js';
import { buildModelConfig } from '../discovery/models.js';
import { parseJSONC } from '../utils/jsonc.js';
import { PLUGIN_CONSTANTS } from '../types.js';
import type { Account, OpencodeConfig } from '../types.js';

/**
 * Get path to global opencode.json(c)
 * Checks for both .jsonc and .json variants
 */
function getGlobalConfigPath(): string {
  const homeDir = os.homedir();
  const configDir = path.join(homeDir, '.config', 'opencode');
  
  // Prefer .jsonc if it exists
  const jsoncPath = path.join(configDir, 'opencode.jsonc');
  if (fs.existsSync(jsoncPath)) {
    return jsoncPath;
  }
  
  // Fall back to .json
  return path.join(configDir, 'opencode.json');
}

/**
 * Read current opencode.json(c) config
 */
async function readConfig(): Promise<OpencodeConfig> {
  const configPath = getGlobalConfigPath();
  
  try {
    if (!fs.existsSync(configPath)) {
      logger.debug('Config file not found, will create new one');
      return {};
    }
    
    const content = fs.readFileSync(configPath, 'utf-8');
    
    // Use JSONC parser if file is .jsonc
    if (configPath.endsWith('.jsonc')) {
      return parseJSONC(content);
    }
    
    return JSON.parse(content);
    
  } catch (error) {
    logger.error('Failed to read config', {
      error: error instanceof Error ? error.message : String(error)
    });
    return {};
  }
}

/**
 * Write config to opencode.json
 */
async function writeConfig(config: OpencodeConfig): Promise<void> {
  const configPath = getGlobalConfigPath();
  const configDir = path.dirname(configPath);
  
  // Ensure directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  // Write with pretty formatting
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  logger.info('Config written', { path: configPath });
}

/**
 * Write models for all accounts to opencode.json
 * 
 * Format: provider "copilot-multi" with models like "username:model-id"
 */
export async function writeModelsToConfig(accounts: Account[]): Promise<void> {
  logger.info(`Writing models for ${accounts.length} accounts to config...`);
  
  const config = await readConfig();
  
  // Initialize provider section
  config.provider = config.provider || {};
  
  // Create/update copilot-multi provider
  config.provider[PLUGIN_CONSTANTS.PROVIDER_NAME] = {
    models: {}
  };
  
  const providerConfig = config.provider[PLUGIN_CONSTANTS.PROVIDER_NAME];
  
  // Add models for each account
  for (const account of accounts) {
    for (const modelId of account.models) {
      // Model ID format: "username:model"
      const fullModelId = `${account.username}:${modelId}`;
      
      providerConfig.models[fullModelId] = buildModelConfig(
        modelId,
        account.displayName
      );
    }
  }
  
  await writeConfig(config);
  
  const totalModels = Object.keys(providerConfig.models).length;
  logger.info(`Wrote ${totalModels} models to config`);
}

/**
 * Remove copilot-multi provider from config
 * (for cleanup/uninstall)
 */
export async function removeProviderFromConfig(): Promise<void> {
  const config = await readConfig();
  
  if (config.provider && config.provider[PLUGIN_CONSTANTS.PROVIDER_NAME]) {
    delete config.provider[PLUGIN_CONSTANTS.PROVIDER_NAME];
    await writeConfig(config);
    logger.info('Provider removed from config');
  }
}

/**
 * Ensure plugin is registered in opencode.json(c)
 * 
 * @returns true if plugin was newly added, false if already present
 */
export async function ensurePluginInstalled(): Promise<boolean> {
  const configPath = getGlobalConfigPath();
  
  try {
    // Read config
    let config: OpencodeConfig = {};
    
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8');
      config = configPath.endsWith('.jsonc') ? parseJSONC(content) : JSON.parse(content);
    } else {
      logger.debug('Config file not found, will create new one');
    }
    
    // Initialize plugin array if needed
    if (!config.plugin) {
      config.plugin = [];
    }
    
    // Check if already installed
    if (config.plugin.includes(PLUGIN_CONSTANTS.PACKAGE_NAME)) {
      logger.debug('Plugin already in config');
      return false;
    }
    
    // Add plugin
    config.plugin.push(PLUGIN_CONSTANTS.PACKAGE_NAME);
    
    // Write back
    await writeConfig(config);
    
    logger.info('Plugin added to config');
    return true;
    
  } catch (error) {
    logger.error('Failed to ensure plugin installed', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}
