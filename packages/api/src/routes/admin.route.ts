import { Elysia, t } from "elysia";
import { clerkPlugin } from "elysia-clerk";

export const adminRouter = new Elysia({ prefix: "/v1/admin" })
  .use(clerkPlugin())

  // ---- Admin Home ----
  .get("/", async ({ auth }) => {}, {
    detail: { tags: ["Admin"] },
  })

  // ---- Users ----
  .get("/users", async ({ auth }) => {}, {
    detail: { tags: ["Admin - Users"] },
  })

  .get("/users/:id", async ({ auth, params }) => {}, {
    detail: { tags: ["Admin - Users"] },
  })

  .post("/users", async ({ auth, body }) => {}, {
    body: t.Object({
      fullName: t.String(),
      email: t.String(),
      role: t.String(),
      departmentId: t.Optional(t.String()),
      classId: t.Optional(t.String()),
      educationYear: t.Optional(t.String()),
    }),
    detail: { tags: ["Admin - Users"] },
  })

  .patch("/users/:id", async ({ auth, params, body }) => {}, {
    body: t.Object({
      fullName: t.Optional(t.String()),
      role: t.Optional(t.String()),
      departmentId: t.Optional(t.String()),
      classId: t.Optional(t.String()),
    }),
    detail: { tags: ["Admin - Users"] },
  })

  .delete("/users/:id", async ({ auth, params }) => {}, {
    detail: { tags: ["Admin - Users"] },
  })

  // ---- Departments ----
  .get("/departments", async ({ auth }) => {}, {
    detail: { tags: ["Admin - Department"] },
  })

  .post("/departments", async ({ auth, body }) => {}, {
    body: t.Object({ name: t.String() }),
    detail: { tags: ["Admin - Department"] },
  })

  .patch("/departments/:id", async ({ auth, params, body }) => {}, {
    body: t.Object({ name: t.Optional(t.String()) }),
    detail: { tags: ["Admin - Department"] },
  })

  .delete("/departments/:id", async ({ auth, params }) => {}, {
    detail: { tags: ["Admin - Department"] },
  })

  // ---- Courses ----
  .get("/courses", async ({ auth }) => {}, {
    detail: { tags: ["Admin - Courses"] },
  })

  .post("/courses", async ({ auth, body }) => {}, {
    body: t.Object({
      courseCode: t.String(),
      courseName: t.String(),
      semester: t.Number(),
      departmentId: t.String(),
    }),
    detail: { tags: ["Admin - Courses"] },
  })

  .patch("/courses/:id", async ({ auth, params, body }) => {}, {
    body: t.Object({
      courseName: t.Optional(t.String()),
      teacherId: t.Optional(t.String()),
      semester: t.Optional(t.Number()),
    }),
    detail: { tags: ["Admin - Courses"] },
  })

  .delete("/courses/:id", async ({ auth }) => {}, {
    detail: { tags: ["Admin - Courses"] },
  })

  // ---- Class ----
  .get("/classes", async ({ auth }) => {}, {
    detail: { tags: ["Admin - Class"] },
  })

  .post("/classes", async ({ auth, body }) => {}, {
    body: t.Object({
      className: t.String(),
      departmentId: t.String(),
    }),
    detail: { tags: ["Admin - Class"] },
  })

  .patch("/classes/:id", async ({ auth, body }) => {}, {
    body: t.Object({
      className: t.Optional(t.String()),
      departmentId: t.Optional(t.String()),
    }),
    detail: { tags: ["Admin - Class"] },
  })

  .delete("/classes/:id", async ({ auth }) => {}, {
    detail: { tags: ["Admin - Class"] },
  });
