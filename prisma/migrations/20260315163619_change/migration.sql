/*
  Warnings:

  - You are about to drop the `Uni` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Uni";

-- CreateTable
CREATE TABLE "universities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);
