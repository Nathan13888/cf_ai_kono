import { Type, type Static } from "@sinclair/typebox";

export const chatIdSchema = Type.String({ format: "uuid" });
export type ChatId = Static<typeof chatIdSchema>;
