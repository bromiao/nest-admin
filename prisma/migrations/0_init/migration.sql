-- CreateTable
CREATE TABLE `admin_user` (
    `avatar` VARCHAR(255) NOT NULL,
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(255) NOT NULL,
    `nickname` VARCHAR(255) NOT NULL,
    `active` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `IDX_4d0392574f49340bb75a102b04`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `book` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileName` VARCHAR(255) NOT NULL,
    `cover` VARCHAR(1024) NULL,
    `title` VARCHAR(1024) NOT NULL,
    `author` VARCHAR(1024) NULL,
    `publisher` VARCHAR(255) NULL,
    `bookId` VARCHAR(255) NULL,
    `category` INTEGER NULL,
    `categoryText` VARCHAR(255) NULL,
    `language` VARCHAR(10) NULL,
    `rootFile` VARCHAR(255) NULL,
    `originalName` VARCHAR(255) NULL,
    `filePath` VARCHAR(255) NULL,
    `unzipPath` VARCHAR(255) NULL,
    `coverPath` VARCHAR(255) NULL,
    `createUser` VARCHAR(50) NULL,
    `createDatetime` BIGINT NULL,
    `updateDatetime` BIGINT NULL,
    `updateType` TINYINT UNSIGNED NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `path` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `redirect` VARCHAR(255) NOT NULL DEFAULT '',
    `meta` VARCHAR(255) NOT NULL,
    `pid` INTEGER NOT NULL,
    `active` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `IDX_fe3d90e414837d7fd66553847a`(`name`, `path`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `remark` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `IDX_ae4578dcaed5adff96595e6166`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contents` (
    `fileName` VARCHAR(100) NOT NULL,
    `id` VARCHAR(100) NOT NULL,
    `href` VARCHAR(255) NULL,
    `order` INTEGER NULL,
    `level` INTEGER NULL,
    `text` VARCHAR(500) NULL,
    `label` VARCHAR(255) NULL,
    `pid` VARCHAR(255) NULL,
    `navId` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`fileName`, `navId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auth` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `remark` VARCHAR(255) NULL,

    UNIQUE INDEX `key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_auth` (
    `roleId` INTEGER NOT NULL,
    `authId` INTEGER NOT NULL,

    PRIMARY KEY (`roleId`, `authId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_menu` (
    `roleId` INTEGER NOT NULL,
    `menuId` INTEGER NOT NULL,

    PRIMARY KEY (`roleId`, `menuId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

