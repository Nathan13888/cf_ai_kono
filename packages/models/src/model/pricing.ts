import { type Static, Type } from "@sinclair/typebox";

/** US$/1M tokens */
export const flatPricingSchema = Type.Number({ examples: [0.15] });
export type FlatPricing = Static<typeof flatPricingSchema>;

export const contentPricingSchema = Type.Object({
    /** US$/1M tokens */
    text: Type.Number({ examples: [0.15] }),
    /** US$/1M tokens */
    image: Type.Number({ examples: [0.15] }),
    /** US$/1M tokens */
    audio: Type.Number({ examples: [1.0] }),
    /** US$/1M tokens */
    video: Type.Number({ examples: [0.15] }),
});
export type ContentPricing = Static<typeof contentPricingSchema>;

export const thinkingPricingSchema = Type.Object({
    /** US$/1M tokens */
    nonThinking: Type.Number({ examples: [0.6] }),
    /** US$/1M tokens */
    thinking: Type.Number({ examples: [3.5] }),
});
export type ThinkingPricing = Static<typeof thinkingPricingSchema>;

export const cutoffPricingSchema = Type.Object({
    /** # of tokens */
    cutoff: Type.Number({ examples: [200_000] }),
    /** US$/1M tokens */
    lower: Type.Number({ examples: [0.15] }),
    /** US$/1M tokens */
    upper: Type.Number({ examples: [0.3] }),
});
export type CutoffPricing = Static<typeof cutoffPricingSchema>;

export const pricingSchema = Type.Union([
    flatPricingSchema,
    contentPricingSchema,
    thinkingPricingSchema,
    cutoffPricingSchema,
]);
export type Pricing = Static<typeof pricingSchema>;
