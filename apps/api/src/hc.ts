import { hc } from "hono/client";
import type { app } from "./route";

// @src https://github.com/m-shaka/hono-rpc-perf-tips-example/blob/main/apps/server/src/hc.ts

// assign the client to a variable to calculate the type when compiling
const client = hc<typeof app>("");
export type Client = typeof client;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
    hc<typeof app>(...args);
