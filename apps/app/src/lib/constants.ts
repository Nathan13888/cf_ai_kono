import { ModelId } from "@kono/api";

export const DEFAULT_MODEL_ID = "gemini-2.5-flash-preview-05-20" as ModelId;

export type ModelName = string;
export type Feature = string;
export interface ModelCard {
  id: ModelId;
  features: Feature[];
  contextLength: number;
  cost_input?: number;
  cost_output?: number;
}

export const AVAILABLE_MODELS: Record<ModelName, ModelCard> = {
  "Gemini 2.0 Flash": {
    id: "gemini-2.0-flash",
    features: [],
    contextLength: 4096,
  },
  "Gemini 2.5 Flash": {
    id: "gemini-2.5-flash-preview-05-20",
    features: [],
    contextLength: 4096,
  },
  "Gemini 2.5 Pro": {
    id: "gemini-2.5-pro-preview-05-06",
    features: [],
    contextLength: 4096,
  },
  "Claude 3.7 Sonnet": {
    id: "qwen3:1.7b",
    // id: "claude-sonnet-3.7",
    features: [],
    contextLength: 4096,
  },
  // TODO: other models
};
