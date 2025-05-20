import { pinoLogger } from "hono-pino";

export function createLogger() {
  return pinoLogger({
    pino: {
      level: "debug",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      }, // TODO: Use JSON logging for prod
    },
  });
}
