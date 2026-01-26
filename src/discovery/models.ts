/**
 * Model definitions for GitHub Copilot
 * Based on observed models available via GitHub Copilot
 */

import type { ModelConfig } from '../types.js';

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
 * Get display name for a model
 */
export function getModelDisplayName(modelId: string): string {
  return MODEL_DISPLAY_NAMES[modelId] || modelId;
}

/**
 * Get limits for a model
 */
export function getModelLimits(modelId: string): { context: number; output: number } {
  return MODEL_LIMITS[modelId] || DEFAULT_LIMITS;
}

/**
 * Get modalities for a model
 */
export function getModelModalities(modelId: string): { input: string[]; output: string[] } {
  return MODEL_MODALITIES[modelId] || DEFAULT_MODALITIES;
}

/**
 * Build full model config for opencode.json
 */
export function buildModelConfig(modelId: string, displayPrefix: string): ModelConfig {
  return {
    name: `${displayPrefix}: ${getModelDisplayName(modelId)}`,
    limit: getModelLimits(modelId),
    modalities: getModelModalities(modelId),
  };
}
