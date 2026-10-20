import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
try {
  const before = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [limits, tokens] = await db.$transaction([
    db.loginAttempt.deleteMany({ where: { expiresAt: { lt: before } } }),
    db.passwordReset.deleteMany({ where: { expiresAt: { lt: before } } }),
  ]);
  console.log(
    JSON.stringify({
      expiredCountersRemoved: limits.count,
      expiredResetTokensRemoved: tokens.count,
    }),
  );
} finally {
  await db.$disconnect();
}
