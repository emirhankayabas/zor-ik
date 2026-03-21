import { z } from "zod";

// Department validation
export const getDepartmentSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t("departmentNameMin")),
    managerId: z.string().optional(),
  });

export type DepartmentInput = z.infer<ReturnType<typeof getDepartmentSchema>>;

// Employee validation
export const getEmployeeSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t("nameMin")),
    email: z.string().email(t("invalidEmail")),
    password: z.string().min(6, t("passwordMin")),
    position: z.string().min(2, t("positionMin")),
    departmentId: z.string().optional(),
    role: z.enum(["EMPLOYEE", "MANAGER", "COMPANY_ADMIN"]),
    hireDate: z.string().optional(),
    workingDays: z.array(z.number()).optional(),
  });

export type EmployeeInput = z.infer<ReturnType<typeof getEmployeeSchema>>;

// Leave Request validation
export const getLeaveRequestSchema = (t: (key: string) => string) =>
  z.object({
    leaveTypeId: z.string().min(1, t("leaveTypeRequired")),
    startDate: z.string().min(1, t("startDateRequired")),
    endDate: z.string().min(1, t("endDateRequired")),
    reason: z.string().min(5, t("reasonMin")),
  });

export type LeaveRequestInput = z.infer<ReturnType<typeof getLeaveRequestSchema>>;

// Attendance Correction validation
export const getAttendanceCorrectionSchema = (t: (key: string) => string) =>
  z.object({
    type: z.enum(["ENTRY", "EXIT", "BOTH"]),
    date: z.string().min(1, t("dateRequired")),
    entryTime: z.string().optional(),
    exitTime: z.string().optional(),
    reason: z.string().min(5, t("reasonMin")),
  });

export type AttendanceCorrectionInput = z.infer<
  ReturnType<typeof getAttendanceCorrectionSchema>
>;

// Shift validation
export const getShiftSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("shiftNameRequired")),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, t("timeFormat")),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, t("timeFormat")),
    breakMinutes: z.number().min(0, t("minZero")),
    isDefault: z.boolean(),
  });

export type ShiftInput = z.infer<ReturnType<typeof getShiftSchema>>;
