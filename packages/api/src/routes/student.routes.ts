import { Elysia } from "elysia";
import { clerkPlugin } from "elysia-clerk";

export const studentRouter = new Elysia({ prefix: "/v1/student" })
  .use(clerkPlugin())

  .get("/", async ({ auth }) => {}, { detail: { tags: ["Student"] } })

  .get("/profile", async ({ auth }) => {}, { detail: { tags: ["Student"] } })

  .get("/timetable", async ({ auth }) => {}, { detail: { tags: ["Student"] } })

  .get("/attendance", async ({ auth }) => {}, {
    detail: { tags: ["Student - Attendance"] },
  })

  .get("/results", async ({ auth }) => {}, {
    detail: { tags: ["Student - Result"] },
  })

  .get("/materials", async ({ auth }) => {}, {
    detail: { tags: ["Student - Material"] },
  })

  .post("/assignments/:id/submit", async ({ auth }) => {}, {
    detail: { tags: ["Student - Assignment"] },
  });
