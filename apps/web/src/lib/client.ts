import { API_HOST } from "@/constant";
import { type Client, hcWithType } from "@kono/api";

export const client: Client = hcWithType(API_HOST, {
    fetch: ((input, init) => {
        return fetch(input, {
            ...init,
            credentials: "include", // Required for sending cookies cross-origin
        });
    }) satisfies typeof fetch,
});
