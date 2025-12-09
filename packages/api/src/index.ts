import { Elysia } from "elysia";
import { clerkPlugin } from "elysia-clerk";
import { openapi } from "@elysiajs/openapi";
import cors from "@elysiajs/cors";
import { departmentRouter } from "./routes/department.route";

const app = new Elysia()
  .use(
    cors({
      origin: Bun.env.FROTNEND_URL,
      credentials: true,
      preflight: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .use(clerkPlugin())
  .use(
    openapi({
      documentation: {
        info: { title: "College Management System", version: "1.0.0" },
      },
    })
  )
  .use(departmentRouter)
  .listen(Bun.env.PORT as string);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
