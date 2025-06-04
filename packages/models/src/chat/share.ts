import { Type, type Static } from "@sinclair/typebox";
import { messageIdSchema, messageRoleSchema } from "./message";
import { profileSchema } from "../user";
import { modelIdSchema } from "../model";

export const sharedMessageSchema = Type.Object({
    id: messageIdSchema,
    role: messageRoleSchema,
    content: Type.String(),
    modelId: modelIdSchema,
})
export type SharedMessage = Static<typeof sharedMessageSchema>;

export const sharedMessagesSchema = Type.Array(sharedMessageSchema);
export type SharedMessages = Static<typeof sharedMessagesSchema>;

export const sharedChatSchema = Type.Object({
    /** Chat title */
    title: Type.Optional(Type.String()),
    /** Chat message */
    messages: sharedMessagesSchema,
    /** Chat creator */
    creator: profileSchema,
    /** Expiry */
    expiresAt: Type.Optional(Type.Date()),
});
export type SharedChat = Static<typeof sharedChatSchema>;
