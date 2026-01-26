#!/usr/bin/env node

/**
 * CLI for managing OpenCode Copilot Multi-Account plugin
 * 
 * Usage:
 *   opencode-copilot-multi list
 *   opencode-copilot-multi add   # runs opencode auth login (select GitHub Copilot)
 *   opencode-copilot-multi remove <username>
 *   opencode-copilot-multi clear [--force]
 */

import { executeMultiCopilotCommand } from '../dist/commands/multi-copilot.js';

async function main() {
  const args = process.argv.slice(2);
  const command = args.join(' ').trim() || 'help';

  try {
    const result = await executeMultiCopilotCommand(command);
    console.log(result.output);
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
