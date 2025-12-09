import { Elysia, t } from "elysia";
import { departmentController } from "../controller/department.controller";
import { clerkPlugin } from "elysia-clerk";

export const departmentRouter = new Elysia({ prefix: "v1/department" })
  .use(clerkPlugin())

  .get(
    "/",
      ({ auth, clerk, body }) => {
      if (!auth) return { message: "Unauthorized" };

      const { userId } = auth();

      return {
        message: "Success",
        data: userId,
      };
    },
    { detail: { tags: ["Admin"] } }
  );
