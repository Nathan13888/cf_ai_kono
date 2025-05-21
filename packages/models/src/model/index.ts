import { type Static, Type } from "@sinclair/typebox";
import { pricingSchema } from "./pricing";
import { ModelStatus, modelStatusSchema } from "./status";

export const modelIdSchema = Type.Union([
  Type.Literal("qwen3:1.7b"),
  Type.Literal("gemini-2.0-flash"),
  Type.Literal("gemini-2.5-flash-preview-05-20"),
  Type.Literal("gemini-2.5-pro-preview-05-06"),
]);
export type ModelId = Static<typeof modelIdSchema>;

export const modelProviderSchema = Type.Union([
  Type.Literal("ollama"),
  Type.Literal("google-generative-ai"),
]);
export type ModelProvider = Static<typeof modelProviderSchema>;

export const MODELS: Record<ModelId, Omit<Model, "id">> = Object.freeze({
  "qwen3:1.7b": {
    provider: "ollama",
    name: "Qwen 3 17B",
    description: "Qwen 3 17B",
    capabilities: ["thinking"],
    pricing: {
      input: 0.0,
      output: 0.0,
    },
    status: ModelStatus.Active,
  },
  "gemini-2.0-flash": {
    provider: "google-generative-ai",
    name: "Gemini 2.0 Flash",
    description: "Google's fast model",
    capabilities: ["multimodal"],
    pricing: {
      input: {
        text: 0.1,
        image: 0.1,
        audio: 0.7,
        video: 0.4,
      },
      output: 0.4,
    },
    status: ModelStatus.Active,
  },
  "gemini-2.5-flash-preview-05-20": {
    provider: "google-generative-ai",
    name: "Gemini 2.5 Flash",
    description: "Google's fast reasoning model",
    capabilities: ["thinking", "multimodal"],
    pricing: {
      input: {
        text: 0.15,
        image: 0.15,
        audio: 1.0,
        video: 0.15,
      },
      output: {
        nonThinking: 0.6,
        thinking: 3.5,
      },
    },
    status: ModelStatus.Active,
  },
  "gemini-2.5-pro-preview-05-06": {
    provider: "google-generative-ai",
    name: "Gemini 2.5 Pro",
    description: "Google's advanced reasoning model",
    capabilities: ["thinking", "multimodal"],
    pricing: {
      input: {
        cutoff: 200_000,
        lower: 1.25,
        upper: 2.5,
      },
      output: {
        cutoff: 200_000,
        lower: 10.0,
        upper: 15.0,
      },
    },
    status: ModelStatus.Active,
  },
});

// TODO: In the future, this pricing should have a cost multiplier
// TODO: Need to ensure recorded pricings are actually accurate and up-to-date. Could do end-to-end validation between code calculation and actual API call
export const modelPricingSchema = Type.Object({
  /** US$/1M tokens */
  input: pricingSchema,
  /** US$/1M tokens */
  output: pricingSchema,
});
export type ModelPricing = Static<typeof modelPricingSchema>;

export const capabilitySchema = Type.Union([
  Type.Literal("thinking"),
  Type.Literal("multimodal"),
  Type.Literal("search"),
  Type.Literal("instruction_following"),
  Type.Literal("coding"),
]);

export const capabilitiesSchema = Type.Array(capabilitySchema, { default: [] });
export type Capabilities = Static<typeof capabilitiesSchema>;

// TODO: Add other models in the future
export const modelSchema = Type.Object({
  id: Type.String({ examples: ["gemini-2.5-flash-preview-05-20"] }),
  provider: modelProviderSchema,
  name: Type.String({ examples: ["Gemini 2.5 Flash"] }),
  description: Type.String({ examples: ["Google's fast reasoning model"] }),
  capabilities: capabilitiesSchema,
  // contextWindow:
  pricing: modelPricingSchema,
  status: modelStatusSchema,
});
export type Model = Static<typeof modelSchema>;
export const DEFAULT_MODEL = "gemini-2.5-flash-preview-05-20" as ModelId;

export * from "./pricing";
export * from "./status";
