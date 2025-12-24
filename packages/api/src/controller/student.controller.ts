import { prisma } from "../db";

export const StudentController = {
  getAllStudents: async () => {
    const student = await prisma.user.findMany({
      where: { role: "STUDENT" },
    });

    if (!student) throw new Error("Student not exist.");

    return student;
  },

  getUserById: async (studentId: string) => {
    const student = await prisma.user.findUnique({
      where: {
        id: studentId,
        role: "STUDENT",
      },
    });

    if (!student) throw new Error("Student not found.");
    if (student.role !== "STUDENT") throw new Error("You are not a student");

    return student;
  },

  // this work only when student token give otherwise they give student not found.
  getTimetable: async (clerkUserId: string) => {
    const student = await prisma.user.findFirst({
      where: {
        // todo: use this when you are providing particular user id
        // clerkUserId: clerkUserId,
        role: "STUDENT",
      },
      select: {
        id: true,
        role: true,
        classId: true,
        class: {
          select: {
            className: true,
          },
        },
      },
    });

    if (!student) throw new Error("Student not found.");
    if (student.role !== "STUDENT") throw new Error("Unauthorized.");

    if (student.classId === null) throw new Error("Class is not assigned");

    if (!student.classId)
      throw new Error("Student is not assigned to any class.");

    const timetable = await prisma.timetable.findMany({
      where: {
        classId: student.classId,
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        course: {
          select: {
            id: true,
            courseName: true,
          },
        },
        class: {
          select: {
            id: true,
            className: true,
          },
        },
      },
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });

    return {
      class: student.class,
      timetable,
    };
  },

  getAttendance: async (clerkUserId: string) => {
    const student = await prisma.user.findFirst({
      where: {
        // todo: use this when you are providing particular user id
        // clerkUserId: clerkUserId,
        role: "STUDENT",
      },
      select: {
        attendances: true,
      },
    });

    if (!student) throw new Error("Student not found.");

    return student;
  },

  getResults: async (clerkUserId: string) => {
    const student = await prisma.user.findFirst({
      where: {
        // todo: use this when you are providing particular user id
        // clerkUserId: clerkUserId,
        role: "STUDENT",
      },
      include: { results: true },
    });

    if (!student) throw new Error("Student not found.");

    return student.results;
  },

  getMaterials: async (clerkUserId: string) => {
    const student = await prisma.user.findFirst({
      where: {
        // todo: use this when you are providing particular user id
        // clerkUserId: clerkUserId,
        role: "STUDENT",
      },
      include: {
        class: {
          include: {
            courses: {
              include: {
                studyMaterials: true,
              },
            },
          },
        },
      },
    });

    if (!student) throw new Error("Student not found.");

    const materials: any[] = [];
    student?.class?.courses?.forEach((course) => {
      course.studyMaterials.forEach((material) => materials.push(material));
    });

    return materials;
  },

  // todo: in this got error check this route and controller and fix this
  submitAssignments: async (body: {
    assignmentId: string;
    studentId: string;
    fileUrl: string;
  }) => {
    const { assignmentId, studentId, fileUrl } = body;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    if (new Date() > assignment.dueDate) {
      throw new Error("Assignment submission deadline has passed");
    }

    const alreadySubmitted = await prisma.submission.findFirst({
      where: {
        assignmentId,
        studentId,
      },
    });

    if (alreadySubmitted) {
      throw new Error("You have already submitted this assignment");
    }

    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId,
        fileUrl,
      },
    });

    return {
      message: "Assignment submitted successfully",
      submission,
    };
  },
};
