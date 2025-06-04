import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { MODELS, type Model, type ModelId } from "@kono/models";
import type { LanguageModel } from 'ai';
import { ollama } from "ollama-ai-provider";

/**
 * Convert a model ID to a LanguageModel instance.
 * @param modelId - The model ID to convert
 * @returns [LanguageModel] if model ID is valid, otherwise undefined
 */
export function modelIdToLM(modelId: ModelId): LanguageModel | undefined {
    // Get model entry
    const model: Omit<Model, "id"> | undefined = Object.entries(MODELS).find(
        ([id]) => id === modelId,
    )?.[1];
    if (!model) {
        return undefined;
    }

    switch (model.provider) {
        case "ollama":
            return ollama(modelId); // TODO: Make the API key to a URL by env variable to support remote servers
        case "google-generative-ai":
            return google(modelId);
        case "openai":
            return openai(modelId);
        case "anthropic":
            return anthropic(modelId);
        default:
            // TODO: How to do exhaustive check?
            return undefined;
    }
}
