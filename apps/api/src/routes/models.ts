import { MODELS, type Model, modelSchema } from '@kono/models';
import { Type } from '@sinclair/typebox';
import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver } from 'hono-openapi/typebox';

const modelResponseSchema = modelSchema;
const modelsResponseSchema = Type.Array(modelSchema);

const app = new Hono().get(
    '/',
    describeRoute({
        summary: 'Get all models',
        description: 'Get all models',
        responses: {
            200: {
                description: 'List of models',
                content: {
                    'application/json': {
                        schema: resolver(modelsResponseSchema),
                    },
                },
            },
        },
        validateResponse: true,
    }),
    (c) => {
        const models: Model[] = Object.entries(MODELS).map(([id, model]) => ({
            id,
            ...model,
        }));

        return c.json(models);
    },
);
//   .get( // TODO
//     "/:id",
//     describeRoute({
//         summary: "Get a model",
//         description: "Get a model",
//         responses: {
//             200: {
//                 description: "Model",
//                 content: {
//                     "application/json": {
//                         schema: resolver(modelResponseSchema),
//                     },
//                 }
//             },
//             404: {
//                 description: "Model not found",
//             }
//         },
//         validateResponse: true,
//     }),
//     (c) => {
//         const { id } = c.req.param();

//         if (id in MODELS) {
//             return c.json(MODELS[id]); // TODO
//         }

//         return c.notFound();
//     }
//   )

export default app;
