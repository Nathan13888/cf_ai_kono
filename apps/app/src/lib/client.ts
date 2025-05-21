import type { AppType } from "@kono/api";
import { hc } from "hono/client";

// TODO: fix types
export const client = hc<AppType>("http://localhost:8787/"); // TODO: Change in prod
