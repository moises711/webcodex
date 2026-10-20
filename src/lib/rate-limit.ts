import "server-only";
import { createHash } from "node:crypto";
import { db } from "./db";
export async function consumeLoginAttempt(email: string, ip: string) {
  const keys = ["email:" + email, "pair:" + email + ":" + ip].map((v) =>
    createHash("sha256").update(v).digest("hex"),
  );
  return db.$transaction(async (tx) => {
    let allowed = true;
    for (const key of keys.sort()) {
      await tx.$executeRaw`
        INSERT INTO LoginAttempt (\`key\`, attempts, expiresAt)
        VALUES (${key}, 1, DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 15 MINUTE))
        ON DUPLICATE KEY UPDATE
          attempts = IF(expiresAt < UTC_TIMESTAMP(3), 1, attempts + 1),
          expiresAt = IF(expiresAt < UTC_TIMESTAMP(3), DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 15 MINUTE), expiresAt)
      `;
      const row = await tx.loginAttempt.findUniqueOrThrow({ where: { key } });
      if (row.attempts > 5) allowed = false;
    }
    return allowed;
  });
}

export async function resetLoginAttempts(email: string, ip: string) {
  const keys = ["email:" + email, "pair:" + email + ":" + ip].map((v) =>
    createHash("sha256").update(v).digest("hex"),
  );
  await db.loginAttempt.deleteMany({ where: { key: { in: keys } } });
}

// Database-backed limits are shared by workers and survive application restarts.
export async function consumeRequestLimit(
  scope: string,
  identity: string,
  maximum: number,
  seconds: number,
) {
  const key = createHash("sha256")
    .update(`request:${scope}:${identity}`)
    .digest("hex");
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`
    INSERT INTO LoginAttempt (\`key\`, attempts, expiresAt)
    VALUES (${key}, 1, DATE_ADD(UTC_TIMESTAMP(3), INTERVAL ${seconds} SECOND))
    ON DUPLICATE KEY UPDATE
      attempts = IF(expiresAt < UTC_TIMESTAMP(3), 1, attempts + 1),
      expiresAt = IF(expiresAt < UTC_TIMESTAMP(3), DATE_ADD(UTC_TIMESTAMP(3), INTERVAL ${seconds} SECOND), expiresAt)
  `;
    const row = await tx.loginAttempt.findUniqueOrThrow({ where: { key } });
    return row.attempts <= maximum;
  });
}
