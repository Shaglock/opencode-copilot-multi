/**
 * Account discovery - fetch GitHub username from API
 */

import { logger } from '../utils/logger.js';
import { GitHubAPIError } from '../utils/errors.js';

const GITHUB_API_TIMEOUT = 5000; // 5 seconds
const GITHUB_API_URL = 'https://api.github.com/user';

/**
 * Fetch GitHub username using the access token
 */
export async function fetchGitHubUsername(accessToken: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GITHUB_API_TIMEOUT);

  try {
    logger.debug('Fetching GitHub username from API...');
    
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'User-Agent': 'opencode-copilot-multi',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new GitHubAPIError(
        `API returned status ${response.status}`,
        response.status
      );
    }

    const data = await response.json() as { login?: string; name?: string };
    
    if (!data.login) {
      throw new GitHubAPIError('API response missing login field');
    }

    logger.debug(`Fetched username: ${data.login}`);
    return data.login;
    
  } catch (error) {
    if (error instanceof GitHubAPIError) {
      throw error;
    }
    
    // Timeout or network error
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to fetch GitHub username', { error: message });
    throw new GitHubAPIError(message);
    
  } finally {
    clearTimeout(timeout);
  }
}
