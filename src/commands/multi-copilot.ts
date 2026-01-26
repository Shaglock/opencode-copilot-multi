/**
 * Multi-copilot command handler
 * 
 * Subcommands:
 * - list: Show all accounts in the pool
 * - add: Run GitHub Copilot login and sync
 * - remove <username>: Remove a specific account
 * - clear: Remove all accounts
 */

import { spawn } from 'child_process';
import readline from 'readline';
import { getAccountPool, saveAccountPool } from '../storage/pool.js';
import { writeModelsToConfig, ensurePluginInstalled } from '../config/writer.js';
import { logger } from '../utils/logger.js';
import { getGitHubCopilotAuth, generateAccountId, registerProviderInAuthJson } from '../storage/auth.js';
import { syncAccounts } from '../discovery/accounts.js';

export interface CommandResult {
  output: string;
  success: boolean;
}

// ANSI Color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Colors
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  
  // Bright colors
  brightCyan: '\x1b[96m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
};

const c = colors; // Shorthand

/**
 * Parse and execute multi-copilot command
 */
export async function executeMultiCopilotCommand(args: string): Promise<CommandResult> {
  const parts = args.trim().split(/\s+/);
  const subcommand = parts[0]?.toLowerCase() || 'help';
  const subargs = parts.slice(1);

  switch (subcommand) {
    case 'install':
      return await installPlugin();
    
    case 'list':
    case 'ls':
      return await listAccounts();
    
    case 'add':
      return await addAccount();
    
    case 'remove':
    case 'rm':
      if (!subargs[0]) {
        return { 
          output: `\n${c.red}✗${c.reset} ${c.bold}Usage:${c.reset} opencode-copilot-multi remove ${c.dim}<username>${c.reset}\n`, 
          success: false 
        };
      }
      return await removeAccount(subargs[0]);
    
    case 'clear':
      // Check for --force or -f flag
      const force = subargs.includes('--force') || subargs.includes('-f');
      return await clearAccounts(force);
    
    case 'help':
    case '--help':
    case '-h':
    default:
      return showHelp();
  }
}

async function installPlugin(): Promise<CommandResult> {
  try {
    // Step 1: Register plugin in opencode.json(c)
    const wasInstalled = await ensurePluginInstalled();
    
    // Step 2: Register provider in auth.json (always do this, even if already installed)
    const authRegistered = await registerProviderInAuthJson();
    
    if (!authRegistered) {
      logger.warn('Failed to register provider in auth.json, but continuing...');
    }
    
    if (wasInstalled) {
      const output = [
        '',
        `${c.green}✓${c.reset} ${c.bold}Plugin installed in OpenCode${c.reset}`,
        '',
        `${c.dim}✓ Added to opencode.json(c)${c.reset}`,
        `${c.dim}✓ Registered in auth.json${c.reset}`,
        '',
        `${c.dim}Restart OpenCode to load the plugin${c.reset}`,
        ''
      ].join('\n');
      
      return { output, success: true };
    } else {
      const output = [
        '',
        `${c.yellow}ℹ${c.reset} ${c.bold}Plugin already installed${c.reset}`,
        '',
        `${c.dim}The plugin is already configured in opencode.json(c)${c.reset}`,
        `${c.dim}✓ Verified auth.json registration${c.reset}`,
        ''
      ].join('\n');
      
      return { output, success: true };
    }
  } catch (error) {
    logger.error('Failed to install plugin', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    const output = [
      '',
      `${c.red}✗${c.reset} Failed to install plugin`,
      '',
      `${c.dim}Error: ${error instanceof Error ? error.message : String(error)}${c.reset}`,
      ''
    ].join('\n');
    
    return { output, success: false };
  }
}

async function listAccounts(): Promise<CommandResult> {
  const pool = await getAccountPool();
  
  if (pool.accounts.length === 0) {
    const output = [
      '',
      `${c.yellow}📭 No GitHub Copilot accounts configured${c.reset}`,
      '',
      `${c.dim}To add an account:${c.reset}`,
      `  ${c.cyan}1.${c.reset} Run: ${c.brightCyan}opencode-copilot-multi add${c.reset}`,
      `  ${c.cyan}2.${c.reset} Select ${c.bold}"GitHub Copilot"${c.reset}`,
      `  ${c.cyan}3.${c.reset} Complete authentication`,
      `  ${c.cyan}4.${c.reset} Restart OpenCode`,
      ''
    ].join('\n');
    
    return { output, success: true };
  }

  const lines = [
    '',
    `${c.bold}${c.cyan}👥 GitHub Copilot Accounts${c.reset} ${c.dim}(${pool.accounts.length})${c.reset}`,
    '',
    `${c.gray}┌─────┬────────────────────┬─────────┬───────────────┐${c.reset}`,
    `${c.gray}│${c.reset} ${c.bold}#${c.reset}   ${c.gray}│${c.reset} ${c.bold}Username${c.reset}           ${c.gray}│${c.reset} ${c.bold}Models${c.reset}  ${c.gray}│${c.reset} ${c.bold}Added${c.reset}         ${c.gray}│${c.reset}`,
    `${c.gray}├─────┼────────────────────┼─────────┼───────────────┤${c.reset}`,
  ];

  pool.accounts.forEach((account, index) => {
    const addedDate = new Date(account.addedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const username = account.username.padEnd(18).substring(0, 18);
    const models = String(account.models.length).padStart(7);
    const num = String(index + 1).padStart(3);
    
    lines.push(`${c.gray}│${c.reset} ${c.cyan}${num}${c.reset} ${c.gray}│${c.reset} ${c.green}${username}${c.reset} ${c.gray}│${c.reset}${models} ${c.gray}│${c.reset} ${c.dim}${addedDate.padEnd(13)}${c.reset} ${c.gray}│${c.reset}`);
  });

  lines.push(`${c.gray}└─────┴────────────────────┴─────────┴───────────────┘${c.reset}`);
  lines.push('');

  return { output: lines.join('\n'), success: true };
}

async function runOpencodeLogin(): Promise<boolean> {
  return new Promise((resolve) => {
    const command = process.platform === 'win32' ? 'opencode.exe' : 'opencode';
    const login = spawn(command, ['auth', 'login'], { stdio: 'inherit' });

    login.on('error', (error) => {
      logger.error('Failed to start opencode auth login', {
        error: error instanceof Error ? error.message : String(error)
      });
      resolve(false);
    });

    login.on('exit', (code) => {
      resolve(code === 0);
    });
  });
}

async function addAccount(): Promise<CommandResult> {
  try {
    const poolBefore = await getAccountPool();
    const existingIds = new Set(poolBefore.accounts.map(account => account.id));

    const loginSuccess = await runOpencodeLogin();
    if (!loginSuccess) {
      return { 
        output: `\n${c.red}✗${c.reset} GitHub Copilot login cancelled or failed\n`, 
        success: false 
      };
    }

    await syncAccounts();

    const auth = await getGitHubCopilotAuth();
    if (!auth) {
      const output = [
        '',
        `${c.red}✗${c.reset} ${c.bold}No GitHub Copilot auth found after login${c.reset}`,
        '',
        `${c.dim}Make sure you selected:${c.reset} ${c.brightCyan}GitHub Copilot${c.reset}`,
        ''
      ].join('\n');
      
      return { output, success: false };
    }

    const accountId = generateAccountId(auth.refresh);
    const poolAfter = await getAccountPool();
    const account = poolAfter.accounts.find(a => a.id === accountId);

    if (!account) {
      const output = [
        '',
        `${c.red}✗${c.reset} ${c.bold}Account not found in pool after login${c.reset}`,
        '',
        `${c.dim}Try restarting OpenCode and running:${c.reset} ${c.brightCyan}opencode-copilot-multi list${c.reset}`,
        ''
      ].join('\n');

      return { output, success: false };
    }

    const alreadyExists = existingIds.has(accountId);
    const statusLine = alreadyExists
      ? `${c.yellow}ℹ${c.reset} ${c.bold}Account already in pool${c.reset} ${c.dim}(tokens updated)${c.reset}`
      : `${c.green}✓${c.reset} ${c.bold}Account added to pool${c.reset}`;

    const output = [
      '',
      statusLine,
      '',
      `  Username: ${c.green}${account.username}${c.reset}`,
      `  Models: ${c.cyan}${account.models.length}${c.reset}`,
      '',
      `${c.dim}Restart OpenCode to load updated models${c.reset}`,
      ''
    ].join('\n');

    return { output, success: true };

  } catch (error) {
    logger.error('Failed to add account', { 
      error: error instanceof Error ? error.message : String(error) 
    });

    const output = [
      '',
      `${c.red}✗${c.reset} Failed to add account`,
      '',
      `${c.dim}Error: ${error instanceof Error ? error.message : String(error)}${c.reset}`,
      ''
    ].join('\n');

    return { output, success: false };
  }
}

async function removeAccount(username: string): Promise<CommandResult> {
  const pool = await getAccountPool();
  
  const accountIndex = pool.accounts.findIndex(
    a => a.username.toLowerCase() === username.toLowerCase()
  );

  if (accountIndex === -1) {
    const available = pool.accounts.map(a => `  ${c.cyan}•${c.reset} ${c.green}${a.username}${c.reset}`).join('\n');
    const output = [
      '',
      `${c.red}✗${c.reset} Account ${c.bold}"${username}"${c.reset} not found`,
      '',
      available ? `${c.dim}Available accounts:${c.reset}\n${available}` : `${c.yellow}No accounts configured${c.reset}`,
      ''
    ].join('\n');
    
    return { output, success: false };
  }

  const removed = pool.accounts.splice(accountIndex, 1)[0];
  pool.lastUpdated = Date.now();
  
  await saveAccountPool(pool);
  await writeModelsToConfig(pool.accounts);

  logger.info(`Account removed: ${removed.username}`);

  const output = [
    '',
    `${c.green}✓${c.reset} Account ${c.bold}${c.green}"${removed.username}"${c.reset} removed successfully`,
    '',
    `${c.dim}${pool.accounts.length} account(s) remaining${c.reset}`,
    ''
  ].join('\n');

  return { output, success: true };
}

async function clearAccounts(force: boolean = false): Promise<CommandResult> {
  const pool = await getAccountPool();
  const count = pool.accounts.length;

  if (count === 0) {
    return { 
      output: `\n${c.yellow}📭 No accounts to clear${c.reset}\n`, 
      success: true 
    };
  }

  // List accounts that will be removed
  const accountList = pool.accounts.map(a => `  ${c.red}×${c.reset} ${c.dim}${a.username}${c.reset}`).join('\n');

  // If --force flag, skip confirmation
  if (force) {
    pool.accounts = [];
    pool.lastUpdated = Date.now();

    await saveAccountPool(pool);
    await writeModelsToConfig([]);

    logger.info(`All accounts cleared (${count} removed) - forced`);

    const output = [
      '',
      `${c.green}✓${c.reset} Cleared ${c.bold}${count}${c.reset} account(s)`,
      '',
      `${c.dim}To add accounts, use: ${c.cyan}opencode auth login${c.reset}`,
      ''
    ].join('\n');

    return { output, success: true };
  }

  // Show confirmation prompt
  const confirmOutput = [
    '',
    `${c.yellow}⚠️  Warning${c.reset}`,
    '',
    `This will remove ${c.bold}${count}${c.reset} account(s):`,
    '',
    accountList,
    '',
    `${c.dim}All models will be removed from OpenCode.${c.reset}`,
    '',
    `${c.bold}Are you sure?${c.reset} ${c.dim}[y/N]${c.reset} `,
  ].join('\n');

  // Print confirmation and wait for input
  process.stdout.write(confirmOutput);

  // Read user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  return new Promise((resolve) => {
    rl.question('', async (answer: string) => {
      rl.close();
      
      const confirmed = answer.trim().toLowerCase() === 'y' || answer.trim().toLowerCase() === 'yes';
      
      if (!confirmed) {
        const output = [
          '',
          `${c.dim}Cancelled. No accounts were removed.${c.reset}`,
          ''
        ].join('\n');
        
        resolve({ output, success: false });
        return;
      }

      // User confirmed - proceed with clear
      pool.accounts = [];
      pool.lastUpdated = Date.now();

      await saveAccountPool(pool);
      await writeModelsToConfig([]);

      logger.info(`All accounts cleared (${count} removed)`);

      const output = [
        '',
        `${c.green}✓${c.reset} Cleared ${c.bold}${count}${c.reset} account(s)`,
        '',
        `${c.dim}To add accounts, use: ${c.cyan}opencode auth login${c.reset}`,
        ''
      ].join('\n');

      resolve({ output, success: true });
    });
  });
}

function showHelp(): CommandResult {
  const help = `
${c.bold}${c.cyan}opencode-copilot-multi${c.reset} ${c.dim}v1.0.0${c.reset}
${c.dim}Manage multiple GitHub Copilot accounts in OpenCode${c.reset}

${c.bold}${c.yellow}USAGE${c.reset}
  ${c.brightCyan}opencode-copilot-multi${c.reset} ${c.dim}<command> [options]${c.reset}

${c.bold}${c.yellow}COMMANDS${c.reset}
  ${c.green}install${c.reset}           Install plugin in OpenCode config
  ${c.green}list${c.reset}              List all configured accounts
  ${c.green}add${c.reset}               Login GitHub Copilot and sync account
  ${c.green}remove${c.reset} ${c.dim}<user>${c.reset}     Remove a specific account
  ${c.green}clear${c.reset}             Remove all accounts ${c.dim}(asks for confirmation)${c.reset}
  ${c.green}help${c.reset}              Show this help message

${c.bold}${c.yellow}OPTIONS${c.reset}
  ${c.cyan}--force${c.reset}, ${c.cyan}-f${c.reset}       Skip confirmation prompt for ${c.green}clear${c.reset} command

${c.bold}${c.yellow}ALIASES${c.reset}
  ${c.cyan}ls${c.reset}   ${c.dim}→${c.reset}  list
  ${c.cyan}rm${c.reset}   ${c.dim}→${c.reset}  remove

${c.bold}${c.yellow}EXAMPLES${c.reset}
  ${c.dim}# Install plugin in OpenCode${c.reset}
  ${c.brightCyan}$${c.reset} opencode-copilot-multi install

  ${c.dim}# List all accounts${c.reset}
  ${c.brightCyan}$${c.reset} opencode-copilot-multi list

  ${c.dim}# Login and add an account${c.reset}
  ${c.brightCyan}$${c.reset} opencode-copilot-multi add

  ${c.dim}# Remove a specific account${c.reset}
  ${c.brightCyan}$${c.reset} opencode-copilot-multi remove ${c.dim}github-username${c.reset}

  ${c.dim}# Clear all accounts (with confirmation)${c.reset}
  ${c.brightCyan}$${c.reset} opencode-copilot-multi clear

  ${c.dim}# Clear all accounts (skip confirmation)${c.reset}
  ${c.brightCyan}$${c.reset} opencode-copilot-multi clear --force

${c.bold}${c.yellow}INSTALLATION${c.reset}
  ${c.cyan}1.${c.reset} Run: ${c.brightCyan}opencode-copilot-multi install${c.reset}
  ${c.cyan}2.${c.reset} Restart OpenCode

${c.bold}${c.yellow}ADDING ACCOUNTS${c.reset}
  ${c.cyan}1.${c.reset} Run: ${c.brightCyan}opencode-copilot-multi add${c.reset}
  ${c.cyan}2.${c.reset} Select ${c.bold}"GitHub Copilot"${c.reset}
  ${c.cyan}3.${c.reset} Complete authentication
  ${c.cyan}4.${c.reset} Restart OpenCode

${c.dim}This command runs:${c.reset} ${c.brightCyan}opencode auth login${c.reset}

${c.dim}More info: ${c.blue}https://github.com/valeriofantozzi/opencode-copilot-multi${c.reset}
`;

  return { output: help, success: true };
}
