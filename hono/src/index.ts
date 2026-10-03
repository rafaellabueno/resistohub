import type { AnyRouter } from "@trpc/server";
import type { FetchHandlerRequestOptions } from "@trpc/server/adapters/fetch";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { MiddlewareHandler } from "hono";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/root";
import { createContext } from "./trpc/trpc";
import { validateEnv } from "./env";

validateEnv();
const app = new Hono();

type tRPCOptions = Omit<FetchHandlerRequestOptions<AnyRouter>, "req" | "endpoint"> &
  Partial<Pick<FetchHandlerRequestOptions<AnyRouter>, "endpoint">>;

export const trpcServer = ({
  endpoint = "/trpc",
  ...rest
}: tRPCOptions): MiddlewareHandler => {
  return async (c) => {
    const res = fetchRequestHandler({
      ...rest,
      endpoint,
      req: c.req.raw,
    });
    return res;
  };
};

const corsLinks = ["https://resistohub.com", "https://www.resistohub.com"];
if (process.env.NODE_ENV !== "production") {
  corsLinks.push("http://localhost:4321");
  corsLinks.push("http://localhost:3000"); // Adicionando 3000 também por segurança
}

app.use(
  "/*",
  cors({
    origin: corsLinks,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
    ],
    credentials: true,
  }),
);
app.get("/", (c) => c.redirect("", 308));
app.get("/static/*", serveStatic({ root: "./src" }));
app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: createContext,
  }),
);

export default {
  fetch: app.fetch,
  port: 3334,
};