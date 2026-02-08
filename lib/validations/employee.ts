import { z } from 'zod';

// Department validation
export const departmentSchema = z.object({
    name: z.string().min(2, 'Departman adı en az 2 karakter olmalıdır'),
    managerId: z.string().optional(),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;

// Employee validation
export const employeeSchema = z.object({
    name: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
    position: z.string().min(2, 'Pozisyon en az 2 karakter olmalıdır'),
    departmentId: z.string().optional(),
    role: z.enum(['EMPLOYEE', 'MANAGER', 'COMPANY_ADMIN']),
    hireDate: z.string().optional(),
    workingDays: z.array(z.number()).optional(),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;

// Leave Request validation
export const leaveRequestSchema = z.object({
    leaveTypeId: z.string().min(1, 'İzin türü seçiniz'),
    startDate: z.string().min(1, 'Başlangıç tarihi seçiniz'),
    endDate: z.string().min(1, 'Bitiş tarihi seçiniz'),
    reason: z.string().min(5, 'Açıklama en az 5 karakter olmalıdır'),
});

export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;

// Attendance Correction validation
export const attendanceCorrectionSchema = z.object({
    type: z.enum(['ENTRY', 'EXIT', 'BOTH']),
    date: z.string().min(1, 'Tarih seçiniz'),
    entryTime: z.string().optional(),
    exitTime: z.string().optional(),
    reason: z.string().min(5, 'Açıklama en az 5 karakter olmalıdır'),
});

export type AttendanceCorrectionInput = z.infer<typeof attendanceCorrectionSchema>;
