import type { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import type { BlankEnv, BlankSchema, Env, Schema } from "hono/types";

export function getOpenapi<
    E extends Env = BlankEnv,
    P extends string = string,
    S extends Schema = BlankSchema,
>(app: Hono<E, S, P>) {
    return openAPISpecs(app, {
        documentation: {
            info: {
                title: "Kono Chat API",
                version: "1.0.0", // TODO: keep in sync with package.json?
                description: "API for Kono Chat",
            },
            servers: [
                { url: "http://localhost:8787", description: "Local Server" },
            ],
            // components: {
            //   securitySchemes: {
            //     bearerAuth: {
            //       type: "http",
            //       scheme: "bearer",
            //       bearerFormat: "JWT",
            //     },
            //   },
            // },
            // security: [{ bearerAuth: [] }],
        },
    });
}
