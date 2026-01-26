#!/usr/bin/env node

/**
 * Post-install script
 * Automatically registers the plugin in OpenCode configuration
 * 
 * Runs after: npm install -g opencode-copilot-multi
 */

import { ensurePluginInstalled } from '../dist/config/writer.js';
import { registerProviderInAuthJson } from '../dist/storage/auth.js';
import { logger } from '../dist/utils/logger.js';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const c = colors;

async function postinstall() {
  try {
    // Check if we're in development mode (npm install in project directory)
    // Skip auto-install in dev mode to avoid interference
    if (process.env.npm_config_global !== 'true' && process.cwd().includes('opencode-copilot-multi')) {
      // We're in the project directory doing dev install
      console.log(`${c.dim}Skipping auto-install in development mode${c.reset}`);
      return;
    }

    console.log('');
    console.log(`${c.cyan}◆${c.reset} ${c.bold}Setting up OpenCode Copilot Multi-Account Plugin...${c.reset}`);
    console.log('');

    // Step 1: Register plugin in opencode.json(c)
    const wasInstalled = await ensurePluginInstalled();
    
    if (wasInstalled) {
      console.log(`  ${c.green}✓${c.reset} Registered in ${c.bold}opencode.json(c)${c.reset}`);
    } else {
      console.log(`  ${c.yellow}→${c.reset} Already registered in ${c.bold}opencode.json(c)${c.reset}`);
    }

    // Step 2: Register provider in auth.json
    const authRegistered = await registerProviderInAuthJson();
    
    if (authRegistered) {
      console.log(`  ${c.green}✓${c.reset} Registered in ${c.bold}auth.json${c.reset}`);
    } else {
      console.log(`  ${c.yellow}⚠${c.reset} Could not register in ${c.bold}auth.json${c.reset}`);
    }

    console.log('');
    console.log(`${c.green}✓${c.reset} ${c.bold}Setup complete!${c.reset}`);
    console.log('');
    console.log(`${c.dim}Next steps:${c.reset}`);
    console.log(`  ${c.dim}1.${c.reset} Run: ${c.cyan}opencode-copilot-multi add${c.reset}`);
    console.log(`  ${c.dim}2.${c.reset} Restart OpenCode`);
    console.log('');

  } catch (error) {
    // Don't fail the installation if setup fails
    // User can still run 'opencode-copilot-multi install' manually
    logger.error('Post-install setup failed (non-fatal)', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    console.log('');
    console.log(`${c.yellow}⚠${c.reset}  ${c.bold}Automatic setup encountered an issue${c.reset}`);
    console.log('');
    console.log(`${c.dim}Please run manually:${c.reset} ${c.cyan}opencode-copilot-multi install${c.reset}`);
    console.log('');
  }
}

// Run postinstall
postinstall().catch((error) => {
  // Silent fail - don't block npm install
  logger.error('Post-install script failed', {
    error: error instanceof Error ? error.message : String(error)
  });
});
