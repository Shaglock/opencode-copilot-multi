import { logger } from '../utils/logger.js';
import type { ModelConfig } from '../types.js';

/**
 * models.dev schema (trimmed to the fields we need)
 */
interface ModelsDevModel {
  name?: string;
  limit?: {
    context?: number;
    output?: number;
  };
  modalities?: {
    input?: string[];
    output?: string[];
  };
  status?: 'alpha' | 'beta' | 'deprecated';
}

type ModelsDevResponse = Record<
  string,
  | {
      models?: Record<string, ModelsDevModel>;
    }
  | undefined
>;

const MODELS_DEV_URL = 'https://models.dev/api.json';
const MODELS_DEV_PROVIDER = 'github-copilot';

// Cached models fetched from models.dev
let cachedModels: Record<string, ModelsDevModel> | null = null;
let loadPromise: Promise<void> | null = null;

async function loadModelsFromRegistry(): Promise<void> {
  if (cachedModels || loadPromise) {
    await loadPromise;
    return;
  }

  loadPromise = (async () => {
    try {
      logger.info('Fetching models from models.dev...');
      const response = await fetch(MODELS_DEV_URL);
      if (!response.ok) {
        throw new Error(`models.dev responded with ${response.status}`);
      }

      const data = (await response.json()) as ModelsDevResponse;
      const provider = data[MODELS_DEV_PROVIDER];
      const models = provider?.models;

      if (models && Object.keys(models).length > 0) {
        // Drop deprecated models to match opencode behavior
        cachedModels = Object.fromEntries(
          Object.entries(models).filter(([, model]) => model?.status !== 'deprecated')
        );
        logger.info(`Loaded ${Object.keys(cachedModels).length} models from models.dev`);
      } else {
        logger.warn('No github-copilot models found in models.dev response');
      }
    } catch (error) {
      logger.warn('Failed to fetch models from models.dev, using fallbacks', {
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      loadPromise = null;
    }
  })();

  await loadPromise;
}

function getCachedModel(modelId: string): ModelsDevModel | undefined {
  return cachedModels?.[modelId];
}

/**
 * Default models available through GitHub Copilot
 */
export const DEFAULT_COPILOT_MODELS = [
  'gpt-5.1-codex-max',
  'gpt-5.2-codex',
  'grok-code-fast-1',
  'gpt-5.1',
  'gemini-3-flash-preview',
  'claude-haiku-4.5',
  'gpt-5.1-codex-mini',
  'gpt-5.2',
  'gpt-4.1',
  'claude-opus-4.5',
  'gpt-5',
  'gpt-5.1-codex',
  'claude-sonnet-4',
  'gemini-3-pro-preview',
  'claude-sonnet-4.5',
  'gpt-5-mini',
  'claude-opus-4.6',
  'claude-opus-41',
  'gemini-2.5-pro',
  'gpt-4o',
];

/**
 * Model display names
 */
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  'gpt-5.1-codex-max': 'GPT-5.1-Codex-max',
  'gpt-5.2-codex': 'GPT-5.2-Codex',
  'grok-code-fast-1': 'Grok Code Fast 1',
  'gpt-5.1': 'GPT-5.1',
  'gemini-3-flash-preview': 'Gemini 3 Flash',
  'claude-haiku-4.5': 'Claude Haiku 4.5',
  'gpt-5.1-codex-mini': 'GPT-5.1-Codex-mini',
  'gpt-5.2': 'GPT-5.2',
  'gpt-4.1': 'GPT-4.1',
  'claude-opus-4.5': 'Claude Opus 4.5',
  'gpt-5': 'GPT-5',
  'gpt-5.1-codex': 'GPT-5.1-Codex',
  'claude-sonnet-4': 'Claude Sonnet 4',
  'gemini-3-pro-preview': 'Gemini 3 Pro Preview',
  'claude-sonnet-4.5': 'Claude Sonnet 4.5',
  'gpt-5-mini': 'GPT-5-mini',
  'claude-opus-4.6': 'Claude Opus 4.6',
  'claude-opus-41': 'Claude Opus 4.1',
  'gemini-2.5-pro': 'Gemini 2.5 Pro',
  'gpt-4o': 'GPT-4o',
};

/**
 * Model limits configuration
 */
const MODEL_LIMITS: Record<string, { context: number; output: number }> = {
  'gpt-5.1-codex-max': { context: 128000, output: 128000 },
  'gpt-5.2-codex': { context: 272000, output: 128000 },
  'grok-code-fast-1': { context: 128000, output: 64000 },
  'gpt-5.1': { context: 128000, output: 64000 },
  'gemini-3-flash-preview': { context: 128000, output: 64000 },
  'claude-haiku-4.5': { context: 128000, output: 32000 },
  'gpt-5.1-codex-mini': { context: 128000, output: 128000 },
  'gpt-5.2': { context: 128000, output: 64000 },
  'gpt-4.1': { context: 64000, output: 16384 },
  'claude-opus-4.5': { context: 128000, output: 32000 },
  'gpt-5': { context: 128000, output: 128000 },
  'gpt-5.1-codex': { context: 128000, output: 128000 },
  'claude-sonnet-4': { context: 128000, output: 16000 },
  'gemini-3-pro-preview': { context: 128000, output: 64000 },
  'claude-sonnet-4.5': { context: 128000, output: 32000 },
  'gpt-5-mini': { context: 128000, output: 64000 },
  'claude-opus-4.6': { context: 128000, output: 64000 },
  'claude-opus-41': { context: 80000, output: 16000 },
  'gemini-2.5-pro': { context: 128000, output: 64000 },
  'gpt-4o': { context: 64000, output: 16384 },
};

/**
 * Model modalities
 */
const MODEL_MODALITIES: Record<string, { input: string[]; output: string[] }> = {
  'gpt-5.1-codex-max': { input: ['text', 'image'], output: ['text'] },
  'gpt-5.2-codex': { input: ['text', 'image'], output: ['text'] },
  'grok-code-fast-1': { input: ['text'], output: ['text'] },
  'gpt-5.1': { input: ['text', 'image'], output: ['text'] },
  'gemini-3-flash-preview': { input: ['text', 'image', 'audio', 'video'], output: ['text'] },
  'claude-haiku-4.5': { input: ['text', 'image'], output: ['text'] },
  'gpt-5.1-codex-mini': { input: ['text', 'image'], output: ['text'] },
  'gpt-5.2': { input: ['text', 'image'], output: ['text'] },
  'gpt-4.1': { input: ['text', 'image'], output: ['text'] },
  'claude-opus-4.5': { input: ['text', 'image'], output: ['text'] },
  'gpt-5': { input: ['text', 'image'], output: ['text'] },
  'gpt-5.1-codex': { input: ['text', 'image'], output: ['text'] },
  'claude-sonnet-4': { input: ['text', 'image'], output: ['text'] },
  'gemini-3-pro-preview': { input: ['text', 'image', 'audio', 'video'], output: ['text'] },
  'claude-sonnet-4.5': { input: ['text', 'image'], output: ['text'] },
  'gpt-5-mini': { input: ['text', 'image'], output: ['text'] },
  'claude-opus-4.6': { input: ['text', 'image'], output: ['text'] },
  'claude-opus-41': { input: ['text', 'image'], output: ['text'] },
  'gemini-2.5-pro': { input: ['text', 'image', 'audio', 'video'], output: ['text'] },
  'gpt-4o': { input: ['text', 'image'], output: ['text'] },
};

/**
 * Default values for unknown models
 */
const DEFAULT_LIMITS = { context: 128000, output: 16000 };
const DEFAULT_MODALITIES = { input: ['text'], output: ['text'] };

/**
 * Ensure models.dev data is loaded (no-op if already cached)
 */
export async function ensureCopilotModelsLoaded(): Promise<void> {
  await loadModelsFromRegistry();
}

/**
 * Get available GitHub Copilot models (models.dev when available, otherwise fallback list)
 */
export async function getCopilotModels(): Promise<string[]> {
  await loadModelsFromRegistry();
  if (cachedModels) {
    return Object.keys(cachedModels);
  }
  return [...DEFAULT_COPILOT_MODELS];
}

function resolveDisplayName(modelId: string): string {
  const fromRegistry = getCachedModel(modelId)?.name;
  return fromRegistry || MODEL_DISPLAY_NAMES[modelId] || modelId;
}

function resolveLimits(modelId: string): { context: number; output: number } {
  const registryLimits = getCachedModel(modelId)?.limit;
  if (registryLimits) {
    return {
      context: registryLimits.context ?? DEFAULT_LIMITS.context,
      output: registryLimits.output ?? DEFAULT_LIMITS.output,
    };
  }
  return MODEL_LIMITS[modelId] || DEFAULT_LIMITS;
}

function resolveModalities(modelId: string): { input: string[]; output: string[] } {
  const registryModalities = getCachedModel(modelId)?.modalities;
  if (registryModalities) {
    return {
      input: registryModalities.input ?? DEFAULT_MODALITIES.input,
      output: registryModalities.output ?? DEFAULT_MODALITIES.output,
    };
  }
  return MODEL_MODALITIES[modelId] || DEFAULT_MODALITIES;
}

/**
 * Get display name for a model
 */
export function getModelDisplayName(modelId: string): string {
  return resolveDisplayName(modelId);
}

/**
 * Get limits for a model
 */
export function getModelLimits(modelId: string): { context: number; output: number } {
  return resolveLimits(modelId);
}

/**
 * Get modalities for a model
 */
export function getModelModalities(modelId: string): { input: string[]; output: string[] } {
  return resolveModalities(modelId);
}

/**
 * Build full model config for opencode.json
 */
export function buildModelConfig(modelId: string, displayPrefix: string): ModelConfig {
  return {
    name: `${displayPrefix}: ${resolveDisplayName(modelId)}`,
    limit: resolveLimits(modelId),
    modalities: resolveModalities(modelId),
  };
}
