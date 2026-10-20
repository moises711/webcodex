import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
try {
  const last = await db.area.aggregate({ _max: { order: true } });
  await db.area.upsert({
    where: { slug: "ciberseguridad" },
    update: {},
    create: {
      name: "Ciberseguridad",
      slug: "ciberseguridad",
      icon: "ShieldCheck",
      description:
        "Protección de sistemas, redes y datos para fortalecer la seguridad de tu negocio.",
      order: (last._max.order ?? -1) + 1,
    },
  });
  console.log("Área Ciberseguridad disponible.");
} finally {
  await db.$disconnect();
}
