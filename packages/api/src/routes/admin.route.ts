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
      try {
        await verifyAdmin(auth, clerk);

        const user = await clerk.users.createUser({
          firstName: body.firstName,
          lastName: body.lastName,
          emailAddress: [body.email],
          password: body.password,
          publicMetadata: {
            role: body.role,
          },
        });

        const data = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.emailAddresses[0].emailAddress,
          role: user.publicMetadata.role,
          departmentId: body.departmentId || null,
          classId: body.classId || null,
          educationYear: body.educationYear || null,
          // clerkUserId: user.id,
        };

        const res = await AdminController.createUser({
          ...data,
          clerkUserId: user.id,
        });

        return { message: "User created successfully", data: res };
      } catch (error: any) {
        console.log("CREATE USER ERROR:", error);

        return {
          status: 422,
          error: error?.errors?.[0]?.message || error.message,
        };
      }
    },
    {
      body: t.Object({
        firstName: t.String(),
        lastName: t.String(),
        email: t.String(),
        password: t.String(),
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
      try {
        await verifyAdmin(auth, clerk);

        const existingUser = await AdminController.getUserById(id);
        if (!existingUser) {
          return { status: 404, error: "User not found" };
        }

        // Update Clerk user
        const clerkData: any = {};

        if (body.firstName) clerkData.firstName = body.firstName;
        if (body.lastName) clerkData.lastName = body.lastName;
        if (body.password) clerkData.password = body.password;
        if (body.role) clerkData.publicMetadata = { role: body.role };

        const clerkUser = await clerk.users.updateUser(
          existingUser.clerkUserId, // MUST PASS ID
          clerkData // PASS DATA
        );

        // pass data as a object
        const updateData = {
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          role: clerkUser.publicMetadata.role,
          departmentId: body.departmentId,
          classId: body.classId,
          educationYear: body.educationYear ?? existingUser.educationYear,
        };

        const res = await AdminController.updateUserById(id, updateData);

        return { message: "User updated successfully", data: res };
      } catch (error: any) {
        console.log("UPDATE USER ERROR:", error);

        return {
          status: 422,
          error: error?.errors?.[0]?.message || error.message,
        };
      }
    },
    {
      body: t.Object({
        firstName: t.Optional(t.String()),
        lastName: t.Optional(t.String()),
        password: t.Optional(t.String()),
        role: t.Optional(t.String()),
        departmentId: t.Optional(t.String()),
        classId: t.Optional(t.String()),
        educationYear: t.Optional(t.String()),
      }),
      detail: { tags: ["Admin - Users"] },
    }
  )

  .delete(
    "/users/:id",
    async ({ auth, clerk, params: { id } }) => {
      try {
        await verifyAdmin(auth, clerk);

        const existingUser = await AdminController.getUserById(id);
        if (!existingUser) {
          return { status: 404, error: "User not found" };
        }

        const deletedUser = await clerk.users.deleteUser(
          existingUser.clerkUserId
        );

        await AdminController.deleteUserById(id);
        return { message: "User deleted successfully", data: deletedUser };
      } catch (error: any) {
        console.log("DELETE USER ERROR:", error);

        return {
          status: 422,
          error: error?.errors?.[0]?.message || error.message,
        };
      }
    },
    { detail: { tags: ["Admin - Users"] } }
  )

  // ---- Departments ----
  .get(
    "/departments",
    async () => {
      try {
        const res = await AdminController.getAllDepartments();
        return { message: "Departments fetched successfully", data: res };
      } catch (error: any) {
        console.log("GET DEPARTMENT ERROR:", error);

        return {
          status: 422,
          error: error?.errors?.[0]?.message || error.message,
        };
      }
    },
    { detail: { tags: ["Admin - Department"] } }
  )

  .post(
    "/departments",
    async ({ auth, clerk, body }) => {
      try {
        await verifyAdmin(auth, clerk);
        if (body.name === "")
          throw new Error("Please enter the department name");

        const res = await AdminController.createDepartment(body);
        return { message: "Department created successfully", data: res };
      } catch (error: any) {
        console.log("CREATE DEPARTMENT ERROR:", error);

        return {
          status: 422,
          error: error?.errors?.[0]?.message || error.message,
        };
      }
    },
    {
      body: t.Object({ name: t.String() }),
      detail: { tags: ["Admin - Department"] },
    }
  )

  .patch(
    "/departments/:id",
    async ({ auth, clerk, params: { id }, body }) => {
      try {
        await verifyAdmin(auth, clerk);

        if (body.name === "") throw new Error("Please enter the new name");

        const res = await AdminController.updateDepartmentById(id, body);

        return { message: "Department updated successfully", data: res };
      } catch (error: any) {
        console.log("UPDATE DEPARTMENT ERROR:", error);

        return {
          status: 422,
          error: error?.errors?.[0]?.message || error.message,
        };
      }
    },
    {
      body: t.Object({ name: t.Optional(t.String()) }),
      detail: { tags: ["Admin - Department"] },
    }
  )

  .delete(
    "/departments/:id",
    async ({ auth, clerk, params: { id } }) => {
      try {
        await verifyAdmin(auth, clerk);

        await AdminController.deleteDepartmentById(id);

        return { message: "Department deleted successfully" };
      } catch (error: any) {
        console.log("DELETE DEPARTMENT ERROR:", error);

        return {
          status: 422,
          error: error?.errors?.[0]?.message || error.message,
        };
      }
    },
    { detail: { tags: ["Admin - Department"] } }
  )

  // ---- Courses ----
  .get(
    "/courses",
    async ({ auth, clerk }) => {
      try {
        await verifyAdmin(auth, clerk);

        const res = await AdminController.getAllCourses();

        return { message: "Courses fetched successfully", data: res };
      } catch (error: any) {
        console.log("GET COURSES ERROR:", error);

        return {
          status: 422,
          error: error?.errors?.[0]?.message || error.message,
        };
      }
    },
    {
      detail: { tags: ["Admin - Courses"] },
    }
  )

  .post(
    "/courses",
    async ({ auth, clerk, body }) => {
      try {
        await verifyAdmin(auth, clerk);

        if (
          body.courseCode ||
          body.courseName ||
          body.departmentId ||
          body.semester
        ) {
          throw new Error("Please provide all the fields");
        }

        const res = await AdminController.createCourse(body);

        return { message: "Course created successfully", data: res };
      } catch (error: any) {
        console.log("CREATE COURSES ERROR:", error);

        return {
          status: 422,
          error: error?.errors?.[0]?.message || error.message,
        };
      }
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
      try {
        await verifyAdmin(auth, clerk);

        if(!id) throw new Error("Please provide the course 'ID'.")

        const updateData: any = {};

        if (body.courseName !== undefined)
          updateData.courseName = body.courseName;
        if (body.teacherId !== undefined) updateData.teacherId = body.teacherId;
        if (body.semester !== undefined) updateData.semester = body.semester;

        const res = await AdminController.updateCourseById(id, updateData);
        return { message: "Course updated successfully", data: res };
      } catch (error: any) {
        console.log("UPDATE COURSES ERROR:", error);

        return {
          status: 422,
          error: error?.errors?.[0]?.message || error.message,
        };
      }
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
      try {
        await verifyAdmin(auth, clerk);

        if (id === "") throw new Error("Please provide course 'ID'.");

        await AdminController.deleteCourseById(id);
        return { message: "Course deleted successfully" };
      } catch (error: any) {
        console.log("DELETE COURSES ERROR:", error);

        return {
          status: 422,
          error: error?.errors?.[0]?.message || error.message,
        };
      }
    },
    {
      detail: { tags: ["Admin - Courses"] },
    }
  )

  // ---- Class ----
  .get(
    "/classes",
    async ({ auth, clerk }) => {
      try {
        await verifyAdmin(auth, clerk);

        const res = await AdminController.getAllClasses();
        return { message: "Classes fetched successfully", data: res };
      } catch (error: any) {
        console.log("GET COURSES ERROR:", error);

        return {
          status: 422,
          error: error?.errors?.[0]?.message || error.message,
        };
      }
    },
    {
      detail: { tags: ["Admin - Class"] },
    }
  )

  .post(
    "/classes",
    async ({ auth, clerk, body }) => {
      try {
        await verifyAdmin(auth, clerk);

        if (body.className || body.departmentId)
          throw new Error("Please provide course name and department ID");

        const res = await AdminController.createClass(body);
        return { message: "Class created successfully", data: res };
      } catch (error: any) {
        console.log("CREATE COURSES ERROR:", error);

        return {
          status: 422,
          error: error?.errors?.[0]?.message || error.message,
        };
      }
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
      try {
        await verifyAdmin(auth, clerk);

        if(!id) throw new Error("Please provide class 'ID'.")

        if (body.className || body.departmentId)
          throw new Error("Please provide course name and department ID");

        const res = await AdminController.updateClassById(id, body);
        return { message: "Class updated successfully", data: res };
      } catch (error: any) {
        console.log("UPDATE COURSES ERROR:", error);

        return {
          status: 422,
          error: error?.errors?.[0]?.message || error.message,
        };
      }
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
      try {
        await verifyAdmin(auth, clerk);

        if(!id) throw new Error("Please provide the class 'ID'.")

        await AdminController.deleteClassById(id);
        return { message: "Class deleted successfully" };
      } catch (error: any) {
        console.log("UPDATE COURSES ERROR:", error);

        return {
          status: 422,
          error: error?.errors?.[0]?.message || error.message,
        };
      }
    },
    {
      detail: { tags: ["Admin - Class"] },
    }
  );
