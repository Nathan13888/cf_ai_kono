import { Type, type Static } from "@sinclair/typebox";
import { modelIdSchema } from "../model";
import { chatIdSchema } from "./id";

export const messageIdSchema = Type.String({ format: "uuid" });
export type MessageId = Static<typeof messageIdSchema>;

export const messageStatusSchema = Type.Union([
    Type.Literal("ungenerated"),
    Type.Literal("in_progress"),
    Type.Literal("completed"),
    Type.Literal("aborted"),
    Type.Literal("error"),
])
export type MessageStatus = Static<typeof messageStatusSchema>;

export const messageRoleSchema = Type.Union([
    Type.Literal("user"),
    Type.Literal("assistant"),
    Type.Literal("system"),
]);
export type MessageRole = Static<typeof messageRoleSchema>;

export const newUserMessageSchema = Type.Object({
    /** Message content */
    content: Type.String(), // TODO: Modify to support documents, etc. later
    /** Model ID */
    modelId: modelIdSchema,
    // TODO: Add other optional parameters like thinking
});
export type NewUserMessage = Static<typeof newUserMessageSchema>;

export const messageSchema = Type.Object({
    id: messageIdSchema,
    status: messageStatusSchema,
    /** Time for generation in milliseconds. Null means it was unknown for some reason. Undefined means it is still being generated. */
    generationTime: Type.Optional(
        Type.Union([
            Type.Integer({ minimum: 0 }),
            Type.Null(),
        ])
    ),
    /** Message role */
    role: messageRoleSchema,
    /** Message content */
    content: Type.String(),
    /** Message timestamp */
    timestamp: Type.Date(),
    /** Model ID */
    modelId: modelIdSchema,
    /** Parent message ID */
    // Useful for traversing up its parent
    parentId: Type.Optional(messageIdSchema),
    /** Chat ID */
    chatId: chatIdSchema,
    // TODO: May add more metadata like generation time, tokens used
}); // TODO: Make this a bigger subset to match AI SDK capabilities
export type Message = Static<typeof messageSchema>;

export const messagesSchema = Type.Array(messageSchema);
export type Messages = Static<typeof messagesSchema>;

export const messageBatchSchema = Type.Object({
    messages: messagesSchema,
    /** Record of number of each message */
    childCounts: Type.Record(messageIdSchema, Type.Integer({ minimum: 0 })),
    /** Record of whether each message has more children */
    hasMore: Type.Record(messageIdSchema, Type.Boolean()),
});
export type MessageBatch = Static<typeof messageBatchSchema>;
