import type { ChatDurableObject } from "@/objects/chat";

export interface Bindings extends Omit<CloudflareBindings, "CHAT_DURABLE_OBJECT"> {
    CHAT_DURABLE_OBJECT: DurableObjectNamespace<ChatDurableObject>;
}
