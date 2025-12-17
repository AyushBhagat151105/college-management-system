import { prisma } from "../db";

export const HodController = {
  // get HOD
  getHod: async () => {
    const hod = await prisma.user.findFirst({
      where: {
        role: "HOD",
      },
    });

    if (!hod) throw new Error("HOD is not exist");

    return await prisma.user.findMany({
      where: {
        role: "HOD",
      },
    });
  },

  // get all teacher
  getAllTeachers: async () => {
    const teacher = await prisma.user.findFirst({
      where: {
        role: "TEACHER",
      },
    });

    if (!teacher) throw new Error("Teacher not exist");

    return await prisma.user.findMany({
      where: {
        role: "TEACHER",
      },
      select: {
        clerkUserId: true,
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        departmentId: true,
        department: true,
        coursesTeaching: true,
        role: true,
        classId: true,
        class: true,
        profileImg: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // get all students
  getAllStudents: async () => {
    const student = await prisma.user.findFirst({
      where: {
        role: "STUDENT",
      },
    });

    if (!student) throw new Error("Student not exist");

    return await prisma.user.findMany({
      where: {
        role: "STUDENT",
      },
      select: {
        clerkUserId: true,
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        departmentId: true,
        department: true,
        coursesTeaching: true,
        role: true,
        classId: true,
        class: true,
        profileImg: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // assign teacher
  assignTeacher: async (teacherId: string, courseId: string) => {
    if (!teacherId || !courseId)
      throw new Error("Please provide TeacherID and CourseID.");

    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) throw new Error("Teacher not found.");
    if (teacher.role !== "TEACHER") throw new Error("User is not a teacher.");

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) throw new Error("Course not found.");

    return await prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        teacher: {
          connect: { id: teacherId },
        },
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  },

  // todo: This is not working because we don't have any time table created so we need to create them first then it can approved by HOD
  // approve time table
  approveTimeTable: async (timeTableId: string, approvedById: string) => {
    if (!timeTableId) {
      throw new Error("Timetable ID is required.");
    }

    const timetable = await prisma.timetable.findUnique({
      where: { id: timeTableId },
    });

    if (!timetable) {
      throw new Error("Timetable not found.");
    }

    if (timetable.status === "APPROVED") {
      throw new Error("Timetable already approved.");
    }

    return await prisma.timetable.update({
      where: { id: timeTableId },
      data: {
        status: "APPROVED",
        approvedBy: approvedById,
        approvedAt: new Date(),
      },
      include: {
        class: true,
        course: true,
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  },
};
