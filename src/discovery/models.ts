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
  'claude-sonnet-4',
  'claude-sonnet-4.5',
  'claude-haiku-4.5',
  'claude-opus-4',
  'claude-opus-4.5',
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-5',
  'o1',
  'o1-mini',
  'o3-mini',
  'gemini-2.5-pro',
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
];

/**
 * Model display names
 */
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  'claude-sonnet-4': 'Claude Sonnet 4',
  'claude-sonnet-4.5': 'Claude Sonnet 4.5',
  'claude-haiku-4.5': 'Claude Haiku 4.5',
  'claude-opus-4': 'Claude Opus 4',
  'claude-opus-4.5': 'Claude Opus 4.5',
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o Mini',
  'gpt-4-turbo': 'GPT-4 Turbo',
  'gpt-5': 'GPT-5',
  'o1': 'OpenAI o1',
  'o1-mini': 'OpenAI o1-mini',
  'o3-mini': 'OpenAI o3-mini',
  'gemini-2.5-pro': 'Gemini 2.5 Pro',
  'gemini-3-flash-preview': 'Gemini 3 Flash',
  'gemini-3-pro-preview': 'Gemini 3 Pro',
};

/**
 * Model limits configuration
 */
const MODEL_LIMITS: Record<string, { context: number; output: number }> = {
  // Claude models
  'claude-sonnet-4': { context: 200000, output: 64000 },
  'claude-sonnet-4.5': { context: 200000, output: 64000 },
  'claude-haiku-4.5': { context: 200000, output: 64000 },
  'claude-opus-4': { context: 200000, output: 64000 },
  'claude-opus-4.5': { context: 200000, output: 64000 },
  // OpenAI models
  'gpt-4o': { context: 128000, output: 16000 },
  'gpt-4o-mini': { context: 128000, output: 16000 },
  'gpt-4-turbo': { context: 128000, output: 16000 },
  'gpt-5': { context: 128000, output: 32000 },
  'o1': { context: 200000, output: 100000 },
  'o1-mini': { context: 128000, output: 65536 },
  'o3-mini': { context: 200000, output: 100000 },
  // Gemini models
  'gemini-2.5-pro': { context: 1048576, output: 65536 },
  'gemini-3-flash-preview': { context: 1048576, output: 65536 },
  'gemini-3-pro-preview': { context: 1048576, output: 65536 },
};

/**
 * Model modalities
 */
const MODEL_MODALITIES: Record<string, { input: string[]; output: string[] }> = {
  // Claude - supports images
  'claude-sonnet-4': { input: ['text', 'image'], output: ['text'] },
  'claude-sonnet-4.5': { input: ['text', 'image'], output: ['text'] },
  'claude-haiku-4.5': { input: ['text', 'image'], output: ['text'] },
  'claude-opus-4': { input: ['text', 'image'], output: ['text'] },
  'claude-opus-4.5': { input: ['text', 'image'], output: ['text'] },
  // OpenAI - supports images
  'gpt-4o': { input: ['text', 'image'], output: ['text'] },
  'gpt-4o-mini': { input: ['text', 'image'], output: ['text'] },
  'gpt-4-turbo': { input: ['text', 'image'], output: ['text'] },
  'gpt-5': { input: ['text', 'image'], output: ['text'] },
  'o1': { input: ['text', 'image'], output: ['text'] },
  'o1-mini': { input: ['text'], output: ['text'] },
  'o3-mini': { input: ['text'], output: ['text'] },
  // Gemini - supports images and PDF
  'gemini-2.5-pro': { input: ['text', 'image', 'pdf'], output: ['text'] },
  'gemini-3-flash-preview': { input: ['text', 'image', 'pdf'], output: ['text'] },
  'gemini-3-pro-preview': { input: ['text', 'image', 'pdf'], output: ['text'] },
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
