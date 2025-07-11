import { type Static, Type } from "@sinclair/typebox";
import { modelIdSchema } from "../model";
import { userIdSchema } from "../user";
import { chatIdSchema } from "./id";
import { messageSchema, messagesSchema, newUserMessageSchema } from "./message";

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
});
export type ChatMetadata = Static<typeof chatMetadataSchema>;

export const chatSchema = Type.Composite([
    chatMetadataSchema,
    Type.Object({
        /** The chat message */
        messages: messagesSchema,
    }),
]);
export type Chat = Static<typeof chatSchema>;

export const sendMessageByIdRequestSchema = newUserMessageSchema;
export const sendMessageByIdResponseSchema = Type.Object({
    new: messageSchema,
    reply: messageSchema,
});
export type SendMessageByIdResponse = Static<
    typeof sendMessageByIdResponseSchema
>;
export const requestMessageByIdResponseSchema = Type.Object({
    modelId: modelIdSchema,
});
export const regenerateMessageByIdResponseSchema = messageSchema;
export type RegenerateMessageByIdResponse = Static<
    typeof regenerateMessageByIdResponseSchema
>;

export * from "./chat";
export * from "./id";
export * from "./message";
export * from "./share";
export * from "./tree";
// TODO: make sure everything is exported
