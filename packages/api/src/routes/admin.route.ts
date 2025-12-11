import { Elysia, t } from "elysia";
import { clerkPlugin } from "elysia-clerk";
import { AdminController } from "../controller/admin.controller";

// Role Verification
async function verifyAdmin(auth: any, clerk: any) {
  const { userId } = auth();

  if (!userId) throw new Error("Please login or signup first");

  const currentUser = await clerk.users.getUser(userId);

  const role = currentUser?.publicMetadata?.role;

  if (!role) throw new Error("User role missing in Clerk publicMetadata");

  const allowedRoles = ["ADMIN", "HOD"];

  if (!allowedRoles.includes(role)) {
    throw new Error("Unauthorized access admin role required");
  }

  return { userId, role };
}

export const adminRouter = new Elysia({ prefix: "/v1/admin" })
  .use(clerkPlugin())

  // ---- Admin Home ----
  .get(
    "/",
    async ({ auth, clerk }) => {
      const user = await verifyAdmin(auth, clerk);
      return { message: "Admin Home", user };
    },
    { detail: { tags: ["Admin"] } }
  )

  // ---- Users ----
  .get(
    "/users",
    async ({ auth, clerk }) => {
      await verifyAdmin(auth, clerk);
      const users = await AdminController.getAllUsers();
      return { message: "All users fetched successfully", data: users };
    },
    { detail: { tags: ["Admin - Users"] } }
  )

  .get(
    "/users/:id",
    async ({ auth, clerk, params: { id } }) => {
      await verifyAdmin(auth, clerk);
      const user = await AdminController.getUserById(id);
      return { message: "User fetched by id", data: user };
    },
    { detail: { tags: ["Admin - Users"] } }
  )

  .post(
    "/users",
    async ({ auth, clerk, body }) => {
      await verifyAdmin(auth, clerk);

      const res = await AdminController.createUser({
        ...body,
        clerkUserId: body.clerkUserId ?? "NO-CLERK-ID",
      });

      return { message: "User created successfully", data: res };
    },
    {
      body: t.Object({
        fullName: t.String(),
        email: t.String(),
        role: t.String(),
        departmentId: t.Optional(t.String()),
        classId: t.Optional(t.String()),
        educationYear: t.Optional(t.String()),
        clerkUserId: t.Optional(t.String()), // optional clerk id
      }),
      detail: { tags: ["Admin - Users"] },
    }
  )

  .patch(
    "/users/:id",
    async ({ auth, clerk, params: { id }, body }) => {
      await verifyAdmin(auth, clerk);
      const res = await AdminController.updateUserById(id, body);
      return { message: "User updated successfully", data: res };
    },
    {
      body: t.Object({
        fullName: t.Optional(t.String()),
        role: t.Optional(t.String()),
        departmentId: t.Optional(t.String()),
        classId: t.Optional(t.String()),
      }),
      detail: { tags: ["Admin - Users"] },
    }
  )

  .delete(
    "/users/:id",
    async ({ auth, clerk, params: { id } }) => {
      await verifyAdmin(auth, clerk);
      await AdminController.deleteUserById(id);
      return { message: "User deleted successfully" };
    },
    { detail: { tags: ["Admin - Users"] } }
  )

  // ---- Departments ----
  .get(
    "/departments",
    async () => {
      const res = await AdminController.getAllDepartments();
      return { message: "Departments fetched successfully", data: res };
    },
    { detail: { tags: ["Admin - Department"] } }
  )

  .post(
    "/departments",
    async ({ auth, clerk, body }) => {
      await verifyAdmin(auth, clerk);
      const res = await AdminController.createDepartment(body);
      return { message: "Department created successfully", data: res };
    },
    {
      body: t.Object({ name: t.String() }),
      detail: { tags: ["Admin - Department"] },
    }
  )

  .patch(
    "/departments/:id",
    async ({ auth, clerk, params: { id }, body }) => {
      await verifyAdmin(auth, clerk);

      const res = await AdminController.updateDepartmentById(id, body);

      return { message: "Department updated successfully", data: res };
    },
    {
      body: t.Object({ name: t.Optional(t.String()) }),
      detail: { tags: ["Admin - Department"] },
    }
  )

  .delete(
    "/departments/:id",
    async ({ auth, clerk, params: { id } }) => {
      await verifyAdmin(auth, clerk);

      await AdminController.deleteDepartmentById(id);

      return { message: "Department deleted successfully" };
    },
    { detail: { tags: ["Admin - Department"] } }
  )
  // ---- Courses ----
  .get(
    "/courses",
    async ({ auth, clerk }) => {
      await verifyAdmin(auth, clerk);

      const res = await AdminController.getAllCourses();
      return { message: "Courses fetched successfully", data: res };
    },
    {
      detail: { tags: ["Admin - Courses"] },
    }
  )

  .post(
    "/courses",
    async ({ auth, clerk, body }) => {
      await verifyAdmin(auth, clerk);

      const res = await AdminController.createCourse(body);
      return { message: "Course created successfully", data: res };
    },
    {
      body: t.Object({
        courseCode: t.String(),
        courseName: t.String(),
        semester: t.Number(),
        departmentId: t.String(),
      }),
      detail: { tags: ["Admin - Courses"] },
    }
  )

  .patch(
    "/courses/:id",
    async ({ auth, clerk, params: { id }, body }) => {
      await verifyAdmin(auth, clerk);

      const res = await AdminController.updateCourseById(id, body);
      return { message: "Course updated successfully", data: res };
    },
    {
      body: t.Object({
        courseName: t.Optional(t.String()),
        teacherId: t.Optional(t.String()),
        semester: t.Optional(t.Number()),
      }),
      detail: { tags: ["Admin - Courses"] },
    }
  )

  .delete(
    "/courses/:id",
    async ({ auth, clerk, params: { id } }) => {
      await verifyAdmin(auth, clerk);

      await AdminController.deleteCourseById(id);
      return { message: "Course deleted successfully" };
    },
    {
      detail: { tags: ["Admin - Courses"] },
    }
  )

  // ---- Class ----
  .get(
    "/classes",
    async ({ auth, clerk }) => {
      await verifyAdmin(auth, clerk);

      const res = await AdminController.getAllClasses();
      return { message: "Classes fetched successfully", data: res };
    },
    {
      detail: { tags: ["Admin - Class"] },
    }
  )

  .post(
    "/classes",
    async ({ auth, clerk, body }) => {
      await verifyAdmin(auth, clerk);

      const res = await AdminController.createClass(body);
      return { message: "Class created successfully", data: res };
    },
    {
      body: t.Object({
        className: t.String(),
        departmentId: t.String(),
      }),
      detail: { tags: ["Admin - Class"] },
    }
  )

  .patch(
    "/classes/:id",
    async ({ auth, clerk, body, params: { id } }) => {
      await verifyAdmin(auth, clerk);

      const res = await AdminController.updateClassById(id, body);
      return { message: "Class updated successfully", data: res };
    },
    {
      body: t.Object({
        className: t.Optional(t.String()),
        departmentId: t.Optional(t.String()),
      }),
      detail: { tags: ["Admin - Class"] },
    }
  )

  .delete(
    "/classes/:id",
    async ({ auth, params: { id }, clerk }) => {
      await verifyAdmin(auth, clerk);

      await AdminController.deleteClassById(id);
      return { message: "Class deleted successfully" };
    },
    {
      detail: { tags: ["Admin - Class"] },
    }
  );
