import { uploadImagesSchema } from "@kono/models";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/typebox";
import type { Bindings } from "hono/types";
import type { AuthType } from "../auth";
import type { DbBindings } from "../db";

const app = new Hono<{
    Bindings: Bindings;
    Variables: DbBindings & AuthType;
}>().put(
    "/",
    describeRoute({
        summary: "Upload something",
        description: "Supports any binary file format",
        responses: {
            200: {
                description: "List of models",
                content: {
                    "application/json": {
                        schema: resolver(uploadImagesSchema),
                    },
                },
            },
            401: {
                description: "Unauthorized",
            },
            500: {
                description: "Internal Server Error",
            },
        },
        // validateResponse: true,
    }),
    async (c) => {
        // Check if user is authenticated
        // TODO: refactor auth to middleware for all routes
        const user = c.get("user");
        if (!user) {
            return c.json(
                {
                    error: "Unauthorized",
                },
                401,
            );
        }

        const db = c.get("db");

        // TODO: upload to s3 and return a

        return c.json(
            {
                error: "not implemented",
            },
            500,
        );
    },
);

export default app;
