-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(254) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'AREA_ADMIN', 'EDITOR', 'INTERNAL') NOT NULL DEFAULT 'EDITOR',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `mustChangePassword` BOOLEAN NOT NULL DEFAULT true,
    `sessionVersion` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Area` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#2F86C8',
    `icon` VARCHAR(191) NULL,
    `coverImageUrl` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Area_name_key`(`name`),
    UNIQUE INDEX `Area_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserArea` (
    `userId` VARCHAR(191) NOT NULL,
    `areaId` VARCHAR(191) NOT NULL,
    `isManager` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`userId`, `areaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` VARCHAR(191) NOT NULL,
    `areaId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `summary` TEXT NOT NULL,
    `content` JSON NULL,
    `type` ENUM('PROJECT', 'SYSTEM') NOT NULL DEFAULT 'PROJECT',
    `status` ENUM('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `year` INTEGER NULL,
    `tags` JSON NOT NULL,
    `techStack` JSON NOT NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `coverLinkUrl` TEXT NULL,
    `coverLinkText` VARCHAR(191) NULL,
    `coverMediaId` VARCHAR(191) NULL,
    `publishedAt` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `updatedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Project_slug_key`(`slug`),
    UNIQUE INDEX `Project_coverMediaId_key`(`coverMediaId`),
    INDEX `Project_areaId_status_idx`(`areaId`, `status`),
    INDEX `Project_status_publishedAt_idx`(`status`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Media` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `storageKey` TEXT NOT NULL,
    `alt` TEXT NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `Media_projectId_order_idx`(`projectId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SystemInfo` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `systemName` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `environment` VARCHAR(191) NOT NULL DEFAULT 'demo',
    `credentialVisibility` ENUM('PUBLIC', 'INTERNAL', 'HIDDEN') NOT NULL DEFAULT 'INTERNAL',

    UNIQUE INDEX `SystemInfo_projectId_key`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DemoCredential` (
    `id` VARCHAR(191) NOT NULL,
    `systemInfoId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `passwordEnc` TEXT NOT NULL,
    `notes` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteSettings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `siteName` VARCHAR(191) NOT NULL DEFAULT 'Códex Cusco',
    `logoUrl` TEXT NULL,
    `contactEmail` VARCHAR(191) NULL,
    `socials` JSON NULL,
    `requireReview` BOOLEAN NOT NULL DEFAULT false,
    `notice` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `meta` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LoginAttempt` (
    `key` VARCHAR(191) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `expiresAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordReset` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,

    UNIQUE INDEX `PasswordReset_tokenHash_key`(`tokenHash`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PageVisit` (
    `id` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserArea` ADD CONSTRAINT `UserArea_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserArea` ADD CONSTRAINT `UserArea_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_coverMediaId_fkey` FOREIGN KEY (`coverMediaId`) REFERENCES `Media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Media` ADD CONSTRAINT `Media_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SystemInfo` ADD CONSTRAINT `SystemInfo_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DemoCredential` ADD CONSTRAINT `DemoCredential_systemInfoId_fkey` FOREIGN KEY (`systemInfoId`) REFERENCES `SystemInfo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
