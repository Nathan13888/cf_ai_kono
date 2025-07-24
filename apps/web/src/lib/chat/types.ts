import type { Chat } from "@kono/models";

// TODO: Doesn't seem to be used anywhere for real
// TODO: refactor to api
export type ActiveButton = "none" | "add" | "deepSearch" | "think";

export interface ActiveChat extends Chat {}
