import { Elysia, t } from "elysia";
import { clerkPlugin } from "elysia-clerk";

export const notificationRouter = new Elysia({ prefix: "/v1/notifications" })
  .use(clerkPlugin())

  .get("/", async ({ auth }) => {}, { detail: { tags: ["Notification"] } })

  .post("/", async ({ auth, body }) => {}, {
    body: t.Object({
      title: t.String(),
      message: t.String(),
      audienceType: t.String(),
      departmentId: t.Optional(t.String()),
      classId: t.Optional(t.String()),
    }),
    detail: { tags: ["Notification"] },
  });
