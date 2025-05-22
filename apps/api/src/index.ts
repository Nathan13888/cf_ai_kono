import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { createLogger } from '@/logger';
import { app as route_app } from '@/route';
import { getOpenapi } from '@/routes/openapi';
import { Scalar } from '@scalar/hono-api-reference';

const app = route_app;
// TODO: Integrate test code to anywhere vv
// const app = route_app
//   .use(createLogger())
//   .get("/", (c) => {
//     const { logger } = c.var;

//     const token = c.req.header("Authorization") ?? "";
//     logger.debug({ token });

//     // const user = getAuthorizedUser(token);
//     // logger.assign({ user });

//     // const posts = getPosts();
//     // logger.assign({ posts });

//     logger.setResMessage("Get posts success"); // optional

//     return c.text("Hello Hono!");
//   }); // TODO: Remove

const isDevelopment = true; // TODO: Fetch from cloudflare
if (isDevelopment) {
    app.get('/openapi', getOpenapi(app));
    app.get('/scalar', Scalar({ url: '/openapi' }));
    app.use(logger());
}

export default app;
