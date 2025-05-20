import { type Static, Type } from "@sinclair/typebox";

export const modelIdSchema = Type.Union([
  Type.Literal("qwen3:1.7b"),
  Type.Literal("gemini-2.5-flash-preview-05-20"),
]);
export type ModelId = Static<typeof modelIdSchema>;

export const modelProviderSchema = Type.Union([Type.Literal("ollama"), Type.Literal("google-generative-ai")]);
export type ModelProvider = Static<typeof modelProviderSchema>;

export const MODELS: Record<ModelId, Omit<Model, "id">> = {
  "qwen3:1.7b": {
    provider: "ollama",
    name: "Qwen 3 17B",
    description: "Qwen 3 17B",
  },
  "gemini-2.5-flash-preview-05-20": {
    provider: "google-generative-ai",
    name: "Gemini 2.5 Flash",
    description: "Google's fast reasoning model",
  },
};

// TODO: Add other models in the future
export const modelSchema = Type.Object({
  id: Type.String({ examples: ["gemini-2.5-flash-preview-05-20"] }),
  provider: modelProviderSchema,
  name: Type.String({ examples: ["Gemini 2.5 Flash"] }),
  description: Type.String({ examples: ["Google's fast reasoning model"] }),
});
export type Model = Static<typeof modelSchema>;
