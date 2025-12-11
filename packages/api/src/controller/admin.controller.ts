import { clerkClient } from "@clerk/clerk-sdk-node";
import { prisma } from "../db";

export const AdminController = {
  // get All users
  getAllUsers: async () => {
    return prisma.user.findMany({
      select: {
        id: true,
        clerkUserId: true,
        fullName: true,
        role: true,
        email: true,
        department: true,
        educationYear: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // create user
  createUser: async (data: any) => {
    return prisma.user.create({ data });
  },

  // get user by id
  getUserById: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        clerkUserId: true,
        fullName: true,
        role: true,
        email: true,
        department: true,
        educationYear: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // update user by id
  updateUserById: async (id: string, data: any) => {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  // delete user by id
  deleteUserById: async (id: string) => {
    return prisma.user.delete({
      where: { id },
    });
  },

  // get all the department
  getAllDepartments: async () => {
    return prisma.department.findMany({
      select: {
        id: true,
        departmentName: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // // get department by id
  // getDepartmentById: async (id: string) => {
  //   return prisma.department.findUnique({
  //     where: { id },
  //     select: {
  //       id: true,
  //       departmentName: true,
  //     },
  //   });
  // },

  // create department
  createDepartment: async (data: { name: string }) => {
    return prisma.department.create({
      data: {
        departmentName: data.name,
      },
      select: { id: true, departmentName: true },
    });
  },

  // update department by id
  updateDepartmentById: async (id: string, data: { name?: string }) => {
    const updateData: any = {};

    if (data.name) updateData.departmentName = data.name;

    return prisma.department.update({
      where: { id },
      data: updateData,
      select: { id: true, departmentName: true },
    });
  },

  // delete department
  deleteDepartmentById: async (id: string) => {
    return prisma.department.delete({
      where: { id },
      select: { id: true, departmentName: true },
    });
  },

  // Get all courses
  getAllCourses: async () => {
    return prisma.course.findMany({
      include: {
        department: true,
        teacher: true,
      },
    });
  },

  // Create new course
  createCourse: async (data: any) => {
    return prisma.course.create({
      data: {
        courseCode: data.courseCode,
        courseName: data.courseName,
        semester: data.semester,
        departmentId: data.departmentId,
        teacherId: data.teacherId ?? null,
      },
    });
  },

  // Update a course by ID
  updateCourseById: async (id: string, data: any) => {
    const updateData: any = {};

    if (data.courseName) updateData.courseName = data.courseName;
    if (data.semester) updateData.semester = data.semester;
    if (data.teacherId !== undefined) updateData.teacherId = data.teacherId;

    return prisma.course.update({
      where: { id },
      data: updateData,
    });
  },

  // Delete course
  deleteCourseById: async (id: string) => {
    return prisma.course.delete({
      where: { id },
    });
  },

  // Get all classes
  getAllClasses: async () => {
    return prisma.class.findMany({
      include: {
        department: true,
      },
    });
  },

  // Create new class
  createClass: async (data: any) => {
    return prisma.class.create({
      data: {
        className: data.className,
        departmentId: data.departmentId,
      },
    });
  },

  // Update class
  updateClassById: async (id: string, data: any) => {
    const updateData: any = {};

    if (data.className) updateData.className = data.className;
    if (data.departmentId) updateData.departmentId = data.departmentId;

    return prisma.class.update({
      where: { id },
      data: updateData,
    });
  },

  // Delete class
  deleteClassById: async (id: string) => {
    return prisma.class.delete({
      where: { id },
    });
  },
};
