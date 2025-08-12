/*
  Warnings:

  - You are about to drop the column `baseSalary` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the `Attendance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Salary` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED');

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "Salary" DROP CONSTRAINT "Salary_employeeId_fkey";

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "baseSalary",
ADD COLUMN     "attendanceData" TEXT,
ADD COLUMN     "salary" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "salaryData" TEXT;

-- DropTable
DROP TABLE "Attendance";

-- DropTable
DROP TABLE "Salary";

-- DropEnum
DROP TYPE "AttendanceStatus";

-- DropEnum
DROP TYPE "SalaryStatus";

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "maxStock" INTEGER,
    "location" TEXT,
    "supplier" TEXT,
    "status" "InventoryStatus" NOT NULL DEFAULT 'IN_STOCK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);
