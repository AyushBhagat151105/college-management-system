import { Elysia } from "elysia";
import { clerkPlugin } from "elysia-clerk";
import { openapi } from "@elysiajs/openapi";
import cors from "@elysiajs/cors";
import { adminRouter } from "./routes/admin.route";
import { hodRouter } from "./routes/hod.routes";
import { teacherRouter } from "./routes/teacher.routes";
import { studentRouter } from "./routes/student.routes";
import { notificationRouter } from "./routes/notification.routes";

const app = new Elysia()
  .use(
    cors({
      origin: Bun.env.FRONTEND_URL,
      credentials: true,
      preflight: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )

  .use(clerkPlugin())

  .use(
    openapi({
      documentation: {
        info: {
          title: "College Management System API",
          version: "1.0.0",
        },
      },
    })
  )

  /* -------- REGISTER ROUTES -------- */
  .use(adminRouter)
  .use(hodRouter)
  .use(teacherRouter)
  .use(studentRouter)
  .use(notificationRouter)

  /* -------- SERVER START -------- */
  .listen(Bun.env.PORT || 3000);

console.log(`🦊 Server running at http://localhost:${app.server?.port}`);

export type App = typeof app;
