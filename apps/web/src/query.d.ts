import "@tanstack/react-query";

type QueryKey = ["chat" | "message" | "history", ...ReadonlyArray<unknown>];

declare module "@tanstack/react-query" {
    interface Register {
        queryKey: QueryKey;
        mutationKey: QueryKey;
    }
}
