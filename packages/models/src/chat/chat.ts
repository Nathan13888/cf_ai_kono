import { type Static, Type } from "@sinclair/typebox";
import { messageSchema, newUserMessageSchema } from "./message";

export const sendChatByIdRequestSchema = newUserMessageSchema;
export type SendChatByIdRequest = Static<typeof sendChatByIdRequestSchema>;

export const sendChatByIdResponseSchema = Type.Object({
    new: messageSchema,
    reply: messageSchema,
});
export type SendChatByIdResponse = Static<typeof sendChatByIdResponseSchema>;
