/*
  Warnings:

  - A unique constraint covering the columns `[name,companyId]` on the table `departments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CorrectionType" AS ENUM ('ENTRY', 'EXIT', 'BOTH');

-- CreateEnum
CREATE TYPE "CorrectionStatus" AS ENUM ('PENDING', 'MANAGER_APPROVED', 'APPROVED', 'REJECTED');

-- DropIndex
DROP INDEX "departments_managerId_idx";

-- AlterTable
ALTER TABLE "approvals" ADD COLUMN     "attendanceCorrectionId" TEXT,
ALTER COLUMN "leaveRequestId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "annualLeaveQuota" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalLeftLeaveDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "workingDays" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5]::INTEGER[];

-- AlterTable
ALTER TABLE "leave_requests" ADD COLUMN     "actualDays" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "link" TEXT;

-- CreateTable
CREATE TABLE "public_holidays" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "isHalfDay" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "public_holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salaries" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "grossSalary" DOUBLE PRECISION NOT NULL,
    "netSalary" DOUBLE PRECISION NOT NULL,
    "sgkEmployee" DOUBLE PRECISION NOT NULL,
    "unemployment" DOUBLE PRECISION NOT NULL,
    "sgkEmployer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unemploymentEmployer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalEmployerCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "incomeTax" DOUBLE PRECISION NOT NULL,
    "stampTax" DOUBLE PRECISION NOT NULL,
    "taxExemption" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "incomeTaxMatrah" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_corrections" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" "CorrectionType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "entryTime" TEXT,
    "exitTime" TEXT,
    "reason" TEXT NOT NULL,
    "status" "CorrectionStatus" NOT NULL DEFAULT 'PENDING',
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_corrections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "public_holidays_date_companyId_key" ON "public_holidays"("date", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "salaries_employeeId_key" ON "salaries"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "payrolls_employeeId_month_year_key" ON "payrolls"("employeeId", "month", "year");

-- CreateIndex
CREATE INDEX "attendance_corrections_employeeId_idx" ON "attendance_corrections"("employeeId");

-- CreateIndex
CREATE INDEX "attendance_corrections_companyId_idx" ON "attendance_corrections"("companyId");

-- CreateIndex
CREATE INDEX "attendance_corrections_status_idx" ON "attendance_corrections"("status");

-- CreateIndex
CREATE INDEX "approvals_attendanceCorrectionId_idx" ON "approvals"("attendanceCorrectionId");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_companyId_key" ON "departments"("name", "companyId");

-- AddForeignKey
ALTER TABLE "public_holidays" ADD CONSTRAINT "public_holidays_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_attendanceCorrectionId_fkey" FOREIGN KEY ("attendanceCorrectionId") REFERENCES "attendance_corrections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
