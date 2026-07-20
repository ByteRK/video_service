import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const statements = [
  `CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL PRIMARY KEY, "username" TEXT NOT NULL UNIQUE, "passwordHash" TEXT NOT NULL, "role" TEXT NOT NULL DEFAULT 'ADMIN', "enabled" BOOLEAN NOT NULL DEFAULT true, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "Video" ("id" TEXT NOT NULL PRIMARY KEY, "publicId" TEXT NOT NULL UNIQUE, "name" TEXT NOT NULL, "originalName" TEXT NOT NULL, "storedName" TEXT NOT NULL UNIQUE, "mimeType" TEXT NOT NULL, "extension" TEXT NOT NULL, "size" BIGINT NOT NULL, "status" TEXT NOT NULL DEFAULT 'ACTIVE', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, "uploaderId" TEXT NOT NULL, CONSTRAINT "Video_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE TABLE IF NOT EXISTS "UploadSession" ("id" TEXT NOT NULL PRIMARY KEY, "fingerprint" TEXT NOT NULL, "originalName" TEXT NOT NULL, "mimeType" TEXT NOT NULL, "totalSize" BIGINT NOT NULL, "chunkSize" INTEGER NOT NULL, "totalChunks" INTEGER NOT NULL, "receivedChunks" TEXT NOT NULL DEFAULT '[]', "status" TEXT NOT NULL DEFAULT 'UPLOADING', "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL, "uploaderId" TEXT NOT NULL, CONSTRAINT "UploadSession_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "UploadSession_fingerprint_uploaderId_key" ON "UploadSession"("fingerprint", "uploaderId")`,
  `CREATE TABLE IF NOT EXISTS "AuditLog" ("id" TEXT NOT NULL PRIMARY KEY, "action" TEXT NOT NULL, "targetType" TEXT NOT NULL, "targetId" TEXT, "detail" TEXT, "ip" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "actorId" TEXT NOT NULL, CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE)`
];

async function main() {
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON');
  for (const sql of statements) await prisma.$executeRawUnsafe(sql);
  console.log('Database schema is ready');
}
main().finally(() => prisma.$disconnect());
