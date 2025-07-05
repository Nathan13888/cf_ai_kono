import "@tanstack/react-query";

type QueryKey = ["chat" | "message", ...ReadonlyArray<unknown>];

declare module "@tanstack/react-query" {
    interface Register {
        queryKey: QueryKey;
        mutationKey: QueryKey;
    }
}
