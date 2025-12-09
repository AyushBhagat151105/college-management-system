import { Elysia, t } from "elysia";
import { clerkPlugin } from "elysia-clerk";

export const hodRouter = new Elysia({ prefix: "/v1/hod" })
  .use(clerkPlugin())

  .get("/", async ({ auth }) => {}, { detail: { tags: ["HOD"] } })

  .get("/teachers", async ({ auth }) => {}, { detail: { tags: ["HOD"] } })

  .get("/students", async ({ auth }) => {}, { detail: { tags: ["HOD"] } })

  .post("/assign-teacher", async ({ auth, body }) => {}, {
    body: t.Object({
      teacherId: t.String(),
      courseId: t.String(),
    }),
    detail: { tags: ["HOD"] },
  })

  .patch("/timetable/:id/approve", async ({ auth, params }) => {}, {
    detail: { tags: ["HOD"] },
  });
