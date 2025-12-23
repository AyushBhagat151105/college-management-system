import { Elysia, t } from "elysia";
import { APIKey, clerkPlugin } from "elysia-clerk";
import { StudentController } from "../controller/student.controller";

async function verifyStudent(auth: any, clerk: any) {
  const { userId } = auth();

  if (!userId) throw new Error("Please login or signup first");

  const currentUser = await clerk.users.getUser(userId);

  const role = currentUser?.publicMetadata?.role;

  if (!role) throw new Error("User role missing in Clerk publicMetadata");

  // todo: for production i have write admin also access teacher route after complete change this
  const allowedRoles = ["STUDENT", "ADMIN"];

  if (!allowedRoles.includes(role)) {
    throw new Error("Unauthorized access TEACHER role required");
  }

  return { userId, role };
}

export const studentRouter = new Elysia({ prefix: "/v1/student" })
  .use(clerkPlugin())

  .get(
    "/",
    async ({ auth, clerk }) => {
      try {
        const { userId } = await verifyStudent(auth, clerk);

        if (!userId) throw new Error("UserID is required.");

        const res = await StudentController.getAllStudents();

        if (res.length === 0) throw new Error("Student not exist right now.");

        return { message: "Students fetched successfully.", data: res };
      } catch (error: any) {
        console.log("GET STUDENTS ERROR", error);

        return {
          status: 422,
          error: error?.errors?.[0]?.message || error.message,
        };
      }
    },
    { detail: { tags: ["Student"] } }
  )

  .get(
    "/profile/:id",
    async ({ auth, clerk, params: { id } }) => {
      try {
        const { userId } = await verifyStudent(auth, clerk);

        const res = await StudentController.getUserById(id);

        return { message: "Student details fetched successfully.", data: res };
      } catch (error: any) {
        console.log("GET PROFILE ERROR", error);

        return {
          status: 422,
          error: error.errors?.[0]?.message || error.message,
        };
      }
    },
    { detail: { tags: ["Student"] } }
  )

  // this work only when student token give otherwise they give student not found.
  .get(
    "/timetable",
    async ({ auth, clerk }) => {
      try {
        const { userId } = await verifyStudent(auth, clerk);

        console.log(userId);

        const res = await StudentController.getTimetable(userId);

        return { message: "Timetable fetched successfully", data: res };
      } catch (error: any) {
        console.log("GET TIMETABLE ERROR", error);

        return {
          status: 422,
          error: error.errors?.[0]?.message || error.message,
        };
      }
    },
    { detail: { tags: ["Student"] } }
  )

  .get(
    "/attendance",
    async ({ auth, clerk }) => {
      try {
        const { userId } = await verifyStudent(auth, clerk);

        const res = await StudentController.getAttendance(userId);

        return { message: "Attendance fetched successfully", data: res };
      } catch (error: any) {
        console.log("GET ATTENDANCE ERROR", error);

        return {
          status: 404,
          error: error.errors?.[0].message || error.message,
        };
      }
    },
    {
      detail: { tags: ["Student - Attendance"] },
    }
  )

  .get(
    "/results",
    async ({ auth, clerk }) => {
      try {
        const { userId } = await verifyStudent(auth, clerk);

        const res = await StudentController.getResults(userId);

        if (res.length === 0) throw new Error("No results found.");

        return { message: "Results fetched successfully", data: res };
      } catch (error: any) {
        console.log("GET ATTENDANCE ERROR", error);

        return {
          status: 404,
          error: error.errors?.[0].message || error.message,
        };
      }
    },
    {
      detail: { tags: ["Student - Result"] },
    }
  )

  .get(
    "/materials",
    async ({ auth, clerk }) => {
      try {
        const { userId } = await verifyStudent(auth, clerk);

        const res = await StudentController.getMaterials(userId);

        if (res.length === 0) throw new Error("No material here.");

        return { message: "Material fetched successfully", data: res };
      } catch (error: any) {
        console.log("GET ATTENDANCE ERROR", error);

        return {
          status: 404,
          error: error.errors?.[0].message || error.message,
        };
      }
    },
    {
      detail: { tags: ["Student - Material"] },
    }
  )

  // todo: in this got error check this route and controller and fix this
  .post(
    "/assignments/:id/submit",
    async ({ auth, clerk, params: { id }, body }) => {
      try {
        const { userId } = await verifyStudent(auth, clerk);

        const res = await StudentController.submitAssignments({
          assignmentId: id,
          studentId: userId,
          fileUrl: body.fileUrl,
        });

        return { message: "Assignment submitted successfully.", data: res };
      } catch (error: any) {
        console.log("GET ATTENDANCE ERROR", error);

        return {
          status: 404,
          error: error.errors?.[0].message || error.message,
        };
      }
    },
    {
      body: t.Object({
        fileUrl: t.String(),
      }),
      detail: { tags: ["Student - Assignment"] },
    }
  );
