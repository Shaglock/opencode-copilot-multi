/**
 * Custom error classes for the plugin
 */

export class PluginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PluginError';
  }
}

export class AccountNotFoundError extends PluginError {
  constructor(public readonly username: string) {
    super(`Account not found: ${username}`);
    this.name = 'AccountNotFoundError';
  }
}

export class TokenRefreshError extends PluginError {
  constructor(
    public readonly username: string,
    public readonly cause?: Error
  ) {
    super(`Failed to refresh token for account: ${username}`);
    this.name = 'TokenRefreshError';
  }
}

export class InvalidModelIdError extends PluginError {
  constructor(public readonly modelId: string) {
    super(`Invalid model ID format: ${modelId}. Expected format: username:model`);
    this.name = 'InvalidModelIdError';
  }
}

export class GitHubAPIError extends PluginError {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}

export class PoolCorruptedError extends PluginError {
  constructor(public readonly path: string) {
    super(`Account pool file is corrupted: ${path}`);
    this.name = 'PoolCorruptedError';
  }
}
