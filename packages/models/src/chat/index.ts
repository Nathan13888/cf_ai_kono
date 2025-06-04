import { Type, type Static } from "@sinclair/typebox";
import { messagesSchema } from "./message";
import { userIdSchema } from "../user";
import { chatIdSchema } from "./id";

export const chatMetadataSchema = Type.Object({
    /** Chat ID */
    id: chatIdSchema,
    /** Chat title */
    title: Type.Optional(Type.String()),
    /** Chat creator ID */
    creatorId: userIdSchema,
    /** Creation date */
    createdAt: Type.Date(),
    /** Last updated date */
    lastUpdatedAt: Type.Date(),
})
export type ChatMetadata = Static<typeof chatMetadataSchema>;

export const chatSchema = Type.Composite([
    chatMetadataSchema,
    Type.Object({
        /** The chat message */
        messages: messagesSchema,
    })
]);
export type Chat = Static<typeof chatSchema>;

export * from "./id";
export * from "./message";
export * from "./share";
export * from "./tree";
// TODO: make sure everything is exported
