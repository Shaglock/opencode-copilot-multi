/**
 * Logger utility for the plugin
 * Writes to file to avoid interfering with OpenCode TUI
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

const LOG_FILE = 'copilot-multi.log';

function getLogPath(): string {
  const homeDir = os.homedir();
  const logDir = process.env.XDG_DATA_HOME
    ? path.join(process.env.XDG_DATA_HOME, 'opencode', 'log')
    : path.join(homeDir, '.local', 'share', 'opencode', 'log');
  
  return path.join(logDir, LOG_FILE);
}

function ensureLogDir(): void {
  const logPath = getLogPath();
  const logDir = path.dirname(logPath);
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

function formatMessage(level: string, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const dataStr = data !== undefined ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level}] ${message}${dataStr}\n`;
}

function writeLog(level: string, message: string, data?: unknown): void {
  try {
    ensureLogDir();
    const logPath = getLogPath();
    const formatted = formatMessage(level, message, data);
    fs.appendFileSync(logPath, formatted);
  } catch {
    // Silently fail - logging should never break the plugin
  }
}

export const logger = {
  debug(message: string, data?: unknown): void {
    writeLog('DEBUG', message, data);
  },
  
  info(message: string, data?: unknown): void {
    writeLog('INFO', message, data);
  },
  
  warn(message: string, data?: unknown): void {
    writeLog('WARN', message, data);
  },
  
  error(message: string, data?: unknown): void {
    writeLog('ERROR', message, data);
  },
};
