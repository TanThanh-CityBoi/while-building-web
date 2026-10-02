import type { AiModelOptions } from '@while-building/types';
import { useState } from 'react';

/** A provider and one of its models, as offered by the server. */
export interface ModelSelection {
  provider: string;
  model: string;
  /** For display, e.g. `GPT-5.5`. */
  label: string;
}

interface Choice {
  provider: string;
  model: string;
}

/**
 * The selection to use: the user's choice while the server still offers it,
 * otherwise the server's defaults. Never invents a provider or model.
 */
export function resolveSelection(
  options: AiModelOptions | undefined,
  choice: Choice | null,
): ModelSelection | undefined {
  if (!options) return undefined;
  const provider =
    options.providers.find((p) => p.id === choice?.provider) ??
    options.providers.find((p) => p.id === options.defaultProvider) ??
    options.providers[0];
  if (!provider) return undefined;
  const chosenModel =
    choice?.provider === provider.id
      ? provider.models.find((m) => m.id === choice.model)
      : undefined;
  const model =
    chosenModel ??
    provider.models.find((m) => m.id === provider.defaultModel) ??
    provider.models[0];
  return model ? { provider: provider.id, model: model.id, label: model.label } : undefined;
}

/**
 * Provider → model choice for the assistant. Only the selected provider's models are offered,
 * and changing the provider resets the model to that provider's default.
 */
export function useModelSelection(options: AiModelOptions | undefined) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const selection = resolveSelection(options, choice);
  const providers = options?.providers ?? [];
  const current = providers.find((p) => p.id === selection?.provider);

  return {
    selection,
    providers,
    models: current?.models ?? [],

    selectProvider(id: string) {
      const provider = providers.find((p) => p.id === id);
      if (provider) setChoice({ provider: provider.id, model: provider.defaultModel });
    },

    selectModel(id: string) {
      if (current?.models.some((m) => m.id === id)) setChoice({ provider: current.id, model: id });
    },
  };
}
