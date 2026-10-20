import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
try {
  await db.$transaction(async (tx) => {
    const demoWhere = {
      summary:
        "Proyecto de ejemplo para explorar el portal de Códex Cusco. Este contenido es demostrativo.",
    };
    await tx.project.updateMany({
      where: demoWhere,
      data: { coverMediaId: null },
    });
    const result = await tx.project.deleteMany({ where: demoWhere });
    await tx.user.updateMany({
      where: {
        email: {
          in: [
            "admin@codex.local",
            "sistemas@codex.local",
            "ingenieria@codex.local",
          ],
        },
        isActive: true,
      },
      data: { isActive: false, sessionVersion: { increment: 1 } },
    });
    await tx.siteSettings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        siteName: "Códex Cusco",
        contactEmail: "codexcusco@gmail.com",
        logoUrl: "/resources/images/codex-cusco-logo.png",
        notice:
          "Códex Cusco ofrece desarrollo de software y páginas web, marketing digital, ciberseguridad y soporte técnico. Para consultas sobre nuestros servicios, escribe a codexcusco@gmail.com o comunícate al +51 957 258 762.",
      },
      update: {
        contactEmail: "codexcusco@gmail.com",
        logoUrl: "/resources/images/codex-cusco-logo.png",
        notice:
          "Códex Cusco ofrece desarrollo de software y páginas web, marketing digital, ciberseguridad y soporte técnico. Para consultas sobre nuestros servicios, escribe a codexcusco@gmail.com o comunícate al +51 957 258 762.",
      },
    });
    if (result.count)
      await tx.auditLog.create({
        data: {
          action: "PRODUCTION_PREPARED",
          entity: "SiteSettings",
          entityId: "1",
        },
      });
    console.log(
      `${result.count} proyectos de ejemplo eliminados. Cuentas, imágenes y trabajos reales conservados.`,
    );
  });
} finally {
  await db.$disconnect();
}
