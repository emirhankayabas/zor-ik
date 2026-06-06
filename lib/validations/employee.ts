import { z } from "zod";
import { isValidTCKN, isValidIBAN } from "@/lib/validators";

// Department validation
export const getDepartmentSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t("departmentNameMin")),
    managerId: z.string().optional(),
  });

export type DepartmentInput = z.infer<ReturnType<typeof getDepartmentSchema>>;

// Enum value lists (mirror prisma/schema.prisma)
export const GENDER_VALUES = ["MALE", "FEMALE", "OTHER"] as const;
export const MARITAL_STATUS_VALUES = [
  "SINGLE",
  "MARRIED",
  "DIVORCED",
  "WIDOWED",
] as const;
export const BLOOD_TYPE_VALUES = [
  "A_POS",
  "A_NEG",
  "B_POS",
  "B_NEG",
  "AB_POS",
  "AB_NEG",
  "O_POS",
  "O_NEG",
] as const;
export const EDUCATION_LEVEL_VALUES = [
  "PRIMARY",
  "SECONDARY",
  "HIGH_SCHOOL",
  "ASSOCIATE",
  "BACHELOR",
  "MASTER",
  "DOCTORATE",
] as const;
export const MILITARY_STATUS_VALUES = [
  "DONE",
  "EXEMPT",
  "DEFERRED",
  "PENDING",
  "NOT_APPLICABLE",
] as const;
export const EMPLOYMENT_TYPE_VALUES = [
  "FULL_TIME",
  "PART_TIME",
  "TEMPORARY",
  "INTERN",
] as const;
export const CONTRACT_TYPE_VALUES = ["PERMANENT", "FIXED_TERM"] as const;

// Form fields are plain strings; unselected <select> sends "". We keep types
// RHF-friendly (no z.preprocess → no `unknown` inputs) and accept "" as
// "not provided". Empty → undefined conversion happens at submit/API time
// via stripEmptyPersonalInfo().
const optStr = z.string().optional();
// Enum-or-empty: allows the placeholder "" option while preserving enum safety.
const optEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.union([z.enum(values), z.literal("")]).optional();
const isBlank = (v: string | undefined) => v === undefined || v === "";

/**
 * Personal/özlük fields shared by create + edit. All optional; TC, IBAN and
 * personal email validated only when a non-empty value is supplied.
 */
export const getPersonalInfoSchema = (t: (key: string) => string) =>
  z.object({
    // Kimlik
    nationalId: optStr.refine(
      (v) => isBlank(v) || isValidTCKN(v),
      t("invalidNationalId"),
    ),
    birthDate: optStr,
    birthPlace: optStr,
    gender: optEnum(GENDER_VALUES),
    maritalStatus: optEnum(MARITAL_STATUS_VALUES),
    nationality: optStr,
    bloodType: optEnum(BLOOD_TYPE_VALUES),
    // İletişim
    phone: optStr,
    personalEmail: optStr.refine(
      (v) => isBlank(v) || z.string().email().safeParse(v).success,
      t("invalidEmail"),
    ),
    addressCity: optStr,
    addressDistrict: optStr,
    addressLine: optStr,
    // Acil durum
    emergencyName: optStr,
    emergencyPhone: optStr,
    emergencyRelation: optStr,
    // Banka
    iban: optStr.refine((v) => isBlank(v) || isValidIBAN(v), t("invalidIban")),
    // Eğitim & Askerlik
    educationLevel: optEnum(EDUCATION_LEVEL_VALUES),
    militaryStatus: optEnum(MILITARY_STATUS_VALUES),
    // İstihdam & Sözleşme
    employmentType: optEnum(EMPLOYMENT_TYPE_VALUES),
    contractType: optEnum(CONTRACT_TYPE_VALUES),
    contractStart: optStr,
    contractEnd: optStr,
    sgkRegistrationNo: optStr,
    terminationDate: optStr,
    terminationReason: optStr,
  });

/** Keys covered by the personal-info schema (for picking/cleaning payloads). */
export const PERSONAL_INFO_KEYS = [
  "nationalId",
  "birthDate",
  "birthPlace",
  "gender",
  "maritalStatus",
  "nationality",
  "bloodType",
  "phone",
  "personalEmail",
  "addressCity",
  "addressDistrict",
  "addressLine",
  "emergencyName",
  "emergencyPhone",
  "emergencyRelation",
  "iban",
  "educationLevel",
  "militaryStatus",
  "employmentType",
  "contractType",
  "contractStart",
  "contractEnd",
  "sgkRegistrationNo",
  "terminationDate",
  "terminationReason",
] as const;

export type PersonalInfoInput = z.infer<
  ReturnType<typeof getPersonalInfoSchema>
>;

// Employee validation (create) — core fields + optional özlük
export const getEmployeeSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z.string().min(2, t("nameMin")),
      email: z.string().email(t("invalidEmail")),
      password: z.string().min(6, t("passwordMin")),
      position: z.string().min(2, t("positionMin")),
      departmentId: z.string().optional(),
      role: z.enum(["EMPLOYEE", "MANAGER", "COMPANY_ADMIN"]),
      hireDate: z.string().optional(),
      workingDays: z.array(z.number()).optional(),
    })
    .merge(getPersonalInfoSchema(t));

export type EmployeeInput = z.infer<ReturnType<typeof getEmployeeSchema>>;

// Date-typed özlük fields (need string → Date conversion for Prisma).
const PERSONAL_DATE_KEYS = new Set([
  "birthDate",
  "contractStart",
  "contractEnd",
  "terminationDate",
]);

/**
 * Maps validated personal-info form values to a Prisma-ready data object:
 * - "" / undefined → null (clears the column)
 * - date strings → Date objects
 * Only keys in PERSONAL_INFO_KEYS are considered, so it is safe to pass the
 * whole form payload.
 */
export function buildPersonalInfoData(
  input: Partial<Record<(typeof PERSONAL_INFO_KEYS)[number], unknown>>,
): Record<string, string | Date | null> {
  const data: Record<string, string | Date | null> = {};
  for (const key of PERSONAL_INFO_KEYS) {
    if (!(key in input)) continue;
    const raw = input[key];
    if (raw === undefined || raw === null || raw === "") {
      data[key] = null;
      continue;
    }
    if (PERSONAL_DATE_KEYS.has(key)) {
      data[key] = new Date(raw as string);
    } else {
      data[key] = raw as string;
    }
  }
  return data;
}

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
