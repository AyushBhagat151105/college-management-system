import { Elysia, t } from "elysia";
import { clerkPlugin } from "elysia-clerk";

export const teacherRouter = new Elysia({ prefix: "/v1/teacher" })
  .use(clerkPlugin())

  .get("/", async ({ auth }) => {}, { detail: { tags: ["Teacher"] } })

  // Attendance
  .get("/attendance/:courseId", async ({ auth }) => {}, {
    detail: { tags: ["Teacher - Attendance"] },
  })

  .post("/attendance", async ({ auth, body }) => {}, {
    body: t.Object({
      studentId: t.String(),
      courseId: t.String(),
      status: t.String(),
      date: t.Optional(t.String()),
    }),
    detail: { tags: ["Teacher - Attendance"] },
  })

  // Results
  .post("/results", async ({ auth, body }) => {}, {
    body: t.Object({
      studentId: t.String(),
      examId: t.String(),
      marks: t.Number(),
    }),
    detail: { tags: ["Teacher - Result"] },
  })

  // Assignments
  .post("/assignments", async ({ auth, body }) => {}, {
    body: t.Object({
      title: t.String(),
      courseId: t.String(),
      dueDate: t.String(),
    }),
    detail: { tags: ["Teacher - Assignment"] },
  })

  .get("/assignments/:id/submissions", async ({ auth }) => {}, {
    detail: { tags: ["Teacher - Assignment"] },
  })

  // Materials
  .post("/materials", async ({ auth, body }) => {}, {
    body: t.Object({
      title: t.String(),
      courseId: t.String(),
      fileUrl: t.String(),
      type: t.String(),
    }),
    detail: { tags: ["Teacher - Material"] },
  })

  .delete("/materials/:id", async ({ auth }) => {}, {
    detail: { tags: ["Teacher - Material"] },
  });
