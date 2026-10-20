-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'AREA_ADMIN', 'EDITOR', 'INTERNAL');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('PROJECT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CredentialVisibility" AS ENUM ('PUBLIC', 'INTERNAL', 'HIDDEN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EDITOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "sessionVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#2F86C8',
    "icon" TEXT,
    "coverImageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserArea" (
    "userId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "isManager" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserArea_pkey" PRIMARY KEY ("userId","areaId")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" JSONB,
    "type" "ProjectType" NOT NULL DEFAULT 'PROJECT',
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "year" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "techStack" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "coverMediaId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemInfo" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "systemName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "environment" TEXT NOT NULL DEFAULT 'demo',
    "credentialVisibility" "CredentialVisibility" NOT NULL DEFAULT 'INTERNAL',

    CONSTRAINT "SystemInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoCredential" (
    "id" TEXT NOT NULL,
    "systemInfoId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordEnc" TEXT NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DemoCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "siteName" TEXT NOT NULL DEFAULT 'Códex Cusco',
    "logoUrl" TEXT,
    "contactEmail" TEXT,
    "socials" JSONB,
    "requireReview" BOOLEAN NOT NULL DEFAULT false,
    "notice" TEXT,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "key" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Area_name_key" ON "Area"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Area_slug_key" ON "Area"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_coverMediaId_key" ON "Project"("coverMediaId");

-- CreateIndex
CREATE INDEX "Project_areaId_status_idx" ON "Project"("areaId", "status");

-- CreateIndex
CREATE INDEX "Project_status_publishedAt_idx" ON "Project"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Media_projectId_order_idx" ON "Media"("projectId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "SystemInfo_projectId_key" ON "SystemInfo"("projectId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_tokenHash_key" ON "PasswordReset"("tokenHash");

-- AddForeignKey
ALTER TABLE "UserArea" ADD CONSTRAINT "UserArea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserArea" ADD CONSTRAINT "UserArea_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemInfo" ADD CONSTRAINT "SystemInfo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoCredential" ADD CONSTRAINT "DemoCredential_systemInfoId_fkey" FOREIGN KEY ("systemInfoId") REFERENCES "SystemInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
