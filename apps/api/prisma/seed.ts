import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();
async function main() {
  const username = process.env.SUPER_ADMIN_USERNAME || 'admin';
  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!password) throw new Error('SUPER_ADMIN_PASSWORD is required');
  const existingSuper = await prisma.user.findFirst({ where: { role: UserRole.SUPER_ADMIN } });
  if (existingSuper) return;
  await prisma.user.create({ data: { username, passwordHash: await argon2.hash(password), role: UserRole.SUPER_ADMIN } });
  console.log(`Super admin created: ${username}`);
}
main().finally(() => prisma.$disconnect());
