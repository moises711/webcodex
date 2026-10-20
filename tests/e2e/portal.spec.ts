import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
const fixtures = () => JSON.parse(readFileSync(".local/e2e.json", "utf8"));
async function login(page: import("@playwright/test").Page, index = 0) {
  const f = fixtures();
  await page.goto("/ingresar");
  await page.getByLabel("Correo electrónico").fill(f.users[index].email);
  await page.getByLabel("Contraseña", { exact: true }).fill(f.password);
  await page.getByRole("button", { name: "Ingresar", exact: true }).click();
  await expect(page).toHaveURL(/\/panel$/);
}
test("public catalog, search and anonymous credential boundaries", async ({
  page,
}) => {
  const f = fixtures();
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Ideas que conectan. Proyectos que avanzan.",
    }),
  ).toBeVisible();
  await page.getByLabel("Buscar proyectos").fill("asistencia");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(
    page.getByRole("heading", { name: "Portal de asistencia" }),
  ).toBeVisible();
  for (const index of [0, 1]) {
    await page.goto(`/proyectos/${f.projects[index].slug}`);
    await expect(
      page.getByRole("button", { name: "Mostrar credenciales demo" }),
    ).toHaveCount(0);
    expect(await page.content()).not.toContain(f.secret);
  }
  await page.goto(`/proyectos/${f.projects[2].slug}`);
  expect(await page.content()).not.toContain(f.secret);
  await page.getByRole("button", { name: "Mostrar credenciales demo" }).click();
  await expect(
    page.getByText(`Contraseña: ${f.secret}`, { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ocultar credenciales" }).click();
  await expect(
    page.getByText(`Contraseña: ${f.secret}`, { exact: true }),
  ).toHaveCount(0);
});
test("login, create, upload, publish and public detail", async ({ page }) => {
  const f = fixtures();
  await login(page);
  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `/tmp/panel-dashboard-${width}.png`,
      fullPage: true,
    });
  }
  await page.getByRole("link", { name: /^Crear contenido/ }).click();
  await page
    .locator(`a[href="/panel/proyectos/nuevo?areaId=${f.areas[0].id}"]`)
    .click();
  await page
    .getByLabel("Título", { exact: true })
    .fill(`${f.prefix} proyecto nuevo`);
  await page
    .getByLabel(/^Descripción del trabajo/)
    .fill("Proyecto publicado durante la prueba E2E");
  await page
    .getByLabel("Fecha del trabajo", { exact: false })
    .fill("2026-10-20");
  await page.getByRole("button", { name: "Guardar contenido" }).click();
  await expect(page).toHaveURL(/\/panel\/proyectos\/c[a-z0-9]+#imagenes$/);
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);
    for (const width of [375, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `/tmp/panel-${theme}-${width}.png`,
        fullPage: true,
      });
    }
  }
  await page.locator('input[type="file"]').setInputFiles(".local/e2e.png");
  await expect(
    page.getByText(
      "Imagen subida. Revisa su texto alternativo y guarda el orden.",
    ),
  ).toBeVisible();
  await page
    .getByLabel("Texto alternativo", { exact: true })
    .fill("Imagen de prueba optimizada");
  await page
    .getByRole("button", { name: "Guardar imágenes y portada" })
    .click();
  await expect(
    page.getByText("Imágenes y portada guardadas", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Publicar", exact: true }).click();
  await expect(page.getByText("Estado actual: Publicado")).toBeVisible();
  await page.goto(
    `/buscar?q=${encodeURIComponent(f.prefix + " proyecto nuevo")}`,
  );
  await page.getByRole("link", { name: /proyecto nuevo/ }).click();
  await expect(
    page.getByRole("heading", {
      name: `${f.prefix} proyecto nuevo`,
      level: 1,
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Imagen de prueba optimizada" }).first(),
  ).toBeVisible();
});
test("cross-area routes, uploads and hidden credentials stay protected", async ({
  page,
}) => {
  const f = fixtures();
  await login(page);
  await page.goto(`/panel/proyectos/${f.projects[1].id}`);
  await expect(
    page.getByRole("heading", { name: "Esta página no está disponible" }),
  ).toBeVisible();
  const response = await page.request.post("/api/upload", {
    headers: { origin: "http://localhost:3000" },
    multipart: {
      projectId: f.projects[1].id,
      alt: "Unauthorized",
      file: {
        name: "test.png",
        mimeType: "image/png",
        buffer: readFileSync(".local/e2e.png"),
      },
    },
  });
  expect(response.status()).toBe(403);
  await page.goto(`/proyectos/${f.projects[1].slug}`);
  await expect(
    page.getByRole("button", { name: "Mostrar credenciales demo" }),
  ).toHaveCount(0);
  await page.goto(`/proyectos/${f.projects[0].slug}`);
  await page.getByRole("button", { name: "Mostrar credenciales demo" }).click();
  await expect(
    page.getByText(`Contraseña: ${f.secret}`, { exact: true }),
  ).toBeVisible();
  await page.goto("/panel/admin/usuarios");
  await expect(
    page.getByRole("heading", { name: "Esta página no está disponible" }),
  ).toBeVisible();
});
test("super admin pages load without exposing password hashes", async ({
  page,
}) => {
  await login(page, 2);
  for (const [url, title] of [
    ["areas", "Administrar áreas"],
    ["usuarios", "Usuarios del portal"],
    ["ajustes", "Ajustes del portal"],
    ["auditoria", "Auditoría"],
  ]) {
    await page.goto(`/panel/admin/${url}`);
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    expect(await page.content()).not.toContain("passwordHash");
  }
});
for (const width of [375, 768, 1280])
  test(`responsive and accessible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const dark of [false, true]) {
      await page.emulateMedia({ colorScheme: dark ? "dark" : "light" });
      await page.reload();
      const sizes = await page.evaluate(() => ({
        viewport: innerWidth,
        content: document.documentElement.scrollWidth,
      }));
      expect(sizes.content).toBeLessThanOrEqual(sizes.viewport);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
    }
    if (width === 1280)
      await page.screenshot({
        path: "test-results/portal-desktop.png",
        fullPage: true,
      });
  });
