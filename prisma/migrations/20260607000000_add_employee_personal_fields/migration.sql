-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('PRIMARY', 'SECONDARY', 'HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORATE');

-- CreateEnum
CREATE TYPE "MilitaryStatus" AS ENUM ('DONE', 'EXEMPT', 'DEFERRED', 'PENDING', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'TEMPORARY', 'INTERN');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('PERMANENT', 'FIXED_TERM');

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "addressCity" TEXT,
ADD COLUMN     "addressDistrict" TEXT,
ADD COLUMN     "addressLine" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "birthPlace" TEXT,
ADD COLUMN     "bloodType" "BloodType",
ADD COLUMN     "contractEnd" TIMESTAMP(3),
ADD COLUMN     "contractStart" TIMESTAMP(3),
ADD COLUMN     "contractType" "ContractType" DEFAULT 'PERMANENT',
ADD COLUMN     "educationLevel" "EducationLevel",
ADD COLUMN     "emergencyName" TEXT,
ADD COLUMN     "emergencyPhone" TEXT,
ADD COLUMN     "emergencyRelation" TEXT,
ADD COLUMN     "employmentType" "EmploymentType" DEFAULT 'FULL_TIME',
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "iban" TEXT,
ADD COLUMN     "maritalStatus" "MaritalStatus",
ADD COLUMN     "militaryStatus" "MilitaryStatus",
ADD COLUMN     "nationalId" TEXT,
ADD COLUMN     "nationality" TEXT DEFAULT 'TC',
ADD COLUMN     "personalEmail" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "sgkRegistrationNo" TEXT,
ADD COLUMN     "terminationDate" TIMESTAMP(3),
ADD COLUMN     "terminationReason" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "employees_nationalId_companyId_key" ON "employees"("nationalId", "companyId");

