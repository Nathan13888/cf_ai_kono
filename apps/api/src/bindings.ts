import type { ChatDurableObject } from "./objects/chat";

// export type Bindings = CloudflareBindings;
export interface Bindings
    extends Omit<CloudflareBindings, "CHAT_DURABLE_OBJECT"> {
    DB: D1Database;
    CHAT_DURABLE_OBJECT: DurableObjectNamespace<ChatDurableObject>;
}
