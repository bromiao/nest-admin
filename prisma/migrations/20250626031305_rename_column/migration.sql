/*
  Warnings:

  - You are about to drop the column `createDatetime` on the `book` table. All the data in the column will be lost.
  - You are about to drop the column `updateDatetime` on the `book` table. All the data in the column will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
-- Step 1: Add new columns
ALTER TABLE `book` ADD COLUMN `createDatetime` BIGINT NULL,
    ADD COLUMN `updateDatetime` BIGINT NULL;

-- Step 2: Migrate data
UPDATE `book` SET `createDatetime` = `createDatetime`,
    `updateDatetime` = `updateDatetime`
WHERE `createDatetime` IS NOT NULL AND `updateDatetime` IS NOT NULL;

-- Step 3: Drop old columns
ALTER TABLE `book` DROP COLUMN `createDatetime`,
    DROP COLUMN `updateDatetime`;

-- DropTable
DROP TABLE `roles`;

-- DropTable
DROP TABLE `users`;
