import { type Static, Type } from "@sinclair/typebox";
import { pricingSchema } from "./pricing";
import { ModelStatus, modelStatusSchema } from "./status";

export const modelIdSchema = Type.Union([
    Type.Literal("qwen3:1.7b"),
    Type.Literal("gemini-2.0-flash"),
    Type.Literal("gemini-2.5-flash-preview-05-20"),
    Type.Literal("gemini-2.5-pro-preview-05-06"),
    Type.Literal("gpt-4o"),
    Type.Literal("gpt-4.1"),
    Type.Literal("gpt-4.1-mini"),
    Type.Literal("gpt-4.1-nano"),
    Type.Literal("o4-mini"),
    Type.Literal("o3"),
    Type.Literal("claude-3-7-sonnet-20250219"),
]);
export type ModelId = Static<typeof modelIdSchema>;

export const modelProviderSchema = Type.Union([
    Type.Literal("ollama"),
    Type.Literal("google-generative-ai"),
    Type.Literal("openai"),
    Type.Literal("anthropic"),
]);
export type ModelProvider = Static<typeof modelProviderSchema>;

export const modelCreatorSchema = Type.Union([
    Type.Literal("google"),
    Type.Literal("anthropic"),
    Type.Literal("openai"),
    Type.Literal("meta"),
    Type.Literal("deepseek"),
    Type.Literal("alibaba"),
]);
export type ModelCreator = Static<typeof modelCreatorSchema>;

// TODO: Add links
export const MODELS: Readonly<Record<ModelId, Omit<Model, "id">>> =
    Object.freeze({
        "qwen3:1.7b": {
            provider: "ollama",
            creator: "alibaba",
            name: "Qwen 3 1.7B",
            description: "Qwen 3 1.7B",
            capabilities: ["thinking"],
            pricing: {
                input: 0.0,
                output: 0.0,
            },
            status: ModelStatus.Beta,
        },
        "gemini-2.0-flash": {
            provider: "google-generative-ai",
            creator: "google",
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
            status: ModelStatus.Beta,
        },
        "gemini-2.5-flash-preview-05-20": {
            provider: "google-generative-ai",
            creator: "google",
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
            status: ModelStatus.Beta,
        },
        "gemini-2.5-pro-preview-05-06": {
            provider: "google-generative-ai",
            creator: "google",
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
            status: ModelStatus.Beta,
        },
        "claude-3-7-sonnet-20250219": {
            provider: "anthropic",
            creator: "anthropic",
            name: "Claude 3.7 Sonnet",
            description: "Claude's flagship model for complex tasks",
            capabilities: ["multimodal"],
            pricing: {
                input: 2.5,
                output: 10.0,
            },
            status: ModelStatus.Beta,
        }, // TODO: How to do thinking?
        "gpt-4o": {
            provider: "openai",
            creator: "openai",
            name: "GPT-4o",
            description: "OpenAI's fast, intelligent, flexible GPT model",
            capabilities: ["multimodal"],
            pricing: {
                input: 2.5,
                output: 10.0,
            },
            status: ModelStatus.Deprecated,
        },
        "gpt-4.1": {
            provider: "openai",
            creator: "openai",
            name: "GPT-4.1",
            description: "OpenAI's flagship GPT model for complex tasks",
            capabilities: ["multimodal"],
            pricing: {
                input: 2.0,
                output: 8.0,
            },
            link: "https://platform.openai.com/docs/models/gpt-4.1",
            status: ModelStatus.Beta,
        },
        "gpt-4.1-mini": {
            provider: "openai",
            creator: "openai",
            name: "GPT-4.1 mini",
            description:
                "OpenAI's GPT-4.1 but balanced for intelligence, speed, and cost",
            capabilities: ["multimodal"],
            pricing: {
                input: 0.4,
                output: 1.6,
            },
            link: "https://platform.openai.com/docs/models/gpt-4.1-mini",
            status: ModelStatus.Beta,
        },
        "gpt-4.1-nano": {
            provider: "openai",
            creator: "openai",
            name: "GPT-4.1 nano",
            description: "OpenAI's fastest, most cost-effective GPT-4.1 model",
            capabilities: ["multimodal"],
            pricing: {
                input: 0.4,
                output: 1.6,
            },
            link: "https://platform.openai.com/docs/models/gpt-4.1-nano",
            status: ModelStatus.Beta,
        },
        "o4-mini": {
            provider: "openai",
            creator: "openai",
            name: "o4 mini",
            description: "OpenAI's faster, more affordable reasoning model",
            capabilities: ["thinking", "multimodal"],
            pricing: {
                input: 1.1,
                output: 4.4,
            },
            link: "https://platform.openai.com/docs/models/o4-mini",
            status: ModelStatus.Beta,
        },
        o3: {
            provider: "openai",
            creator: "openai",
            name: "o3",
            description: "OpenAI's flagship GPT model for complex tasks",
            capabilities: ["thinking", "multimodal"],
            pricing: {
                input: 10.0,
                output: 40.0,
            },
            status: ModelStatus.Beta,
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
    creator: modelCreatorSchema,
    provider: modelProviderSchema,
    name: Type.String({ examples: ["Gemini 2.5 Flash"] }),
    description: Type.String({ examples: ["Google's fast reasoning model"] }),
    capabilities: capabilitiesSchema,
    // contextWindow:
    // maxOutputTokens:
    // knowledgeCutoff: 2025-05-01
    pricing: modelPricingSchema,
    link: Type.Optional(Type.String({ format: "uri" })),
    status: modelStatusSchema,
});
export type Model = Static<typeof modelSchema>;
export const DEFAULT_MODEL = "gemini-2.5-flash-preview-05-20" as ModelId;

export * from "./pricing";
export * from "./status";
