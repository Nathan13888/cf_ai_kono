import type { AuthType } from "@/auth";
import type { Bindings } from "@/bindings";
import type { DbBindings } from "@/db";
import { MODELS, type Model, type Models, modelSchema, modelsSchema } from "@kono/models";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/typebox";

const app = new Hono<{ Bindings: Bindings, Variables: DbBindings & AuthType }>()
    .get(
        "/",
        describeRoute({
            summary: "Get all models",
            description: "Get all models",
            responses: {
                200: {
                    description: "List of models",
                    content: {
                        "application/json": {
                            schema: resolver(modelsSchema),
                        },
                    },
                },
                401: {
                    description: "Unauthorized",
                },
            },
            // validateResponse: true,
        }),
        (c) => {
            const user = c.get("user");
            if (!user) {
                return c.json(
                    {
                        error: "Unauthorized",
                    },
                    401,
                );
            }

            const models: Models = Object.entries(MODELS).map(([id, model]) => ({
                id,
                ...model,
            }));

            return c.json(models);
        },
    )
    .get(
        "/:id",
        describeRoute({
            summary: "Get a model",
            description: "Get a model",
            responses: {
                200: {
                    description: "Model",
                    content: {
                        "application/json": {
                            schema: resolver(modelSchema),
                        },
                    }
                },
                404: {
                    description: "Model not found",
                }
            },
            validateResponse: true,
        }),
        (c) => {
            const { id } = c.req.param();

            const model = Object.entries(MODELS).find(([modelId]) => modelId === id);

            if (model) {
                return c.json({
                    id: model[0],
                    ...model[1],
                } satisfies Model
                ); // TODO
            }

            return c.notFound();
        }
    );

export default app;
