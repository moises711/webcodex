import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { calculateProforma, soles, type Proforma } from "@/lib/proforma";
export async function generateProformaPdf(data: Proforma) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Proforma ${data.number}`);
  pdf.setAuthor(data.company);
  pdf.registerFontkit(fontkit);
  const regular = await pdf.embedFont(
    await readFile(
      path.join(process.cwd(), "src/server/pdf/fonts/DejaVuSans.ttf"),
    ),
    { subset: false },
  );
  const bold = await pdf.embedFont(
    await readFile(
      path.join(process.cwd(), "src/server/pdf/fonts/DejaVuSans-Bold.ttf"),
    ),
    { subset: false },
  );
  const css = await readFile(
    path.join(process.cwd(), "src/app/globals.css"),
    "utf8",
  );
  function token(name: string) {
    const value = css.match(new RegExp(`--${name}:\\s*(#[a-fA-F0-9]{6})`))?.[1];
    if (!value) throw new Error("Token de diseño no disponible");
    return rgb(
      parseInt(value.slice(1, 3), 16) / 255,
      parseInt(value.slice(3, 5), 16) / 255,
      parseInt(value.slice(5, 7), 16) / 255,
    );
  }
  const ink = token("text"),
    muted = token("text-muted"),
    blue = token("brand-600"),
    border = token("border"),
    surface = token("surface"),
    pale = token("surface-2");
  const supported = new Set(regular.getCharacterSet());
  function clean(value: string) {
    return [...value.replace(/[–—]/g, "-")]
      .map((character) =>
        character === "\n" || supported.has(character.codePointAt(0)!)
          ? character
          : "?",
      )
      .join("");
  }
  const logo = await pdf.embedPng(
    await readFile(
      path.join(process.cwd(), "public/resources/images/codex-cusco-logo.png"),
    ),
  );
  let page = pdf.addPage([595.28, 841.89]);
  let y = 800;
  function text(
    value: string,
    x: number,
    top: number,
    size = 10,
    strong = false,
    color = ink,
  ) {
    page.drawText(clean(value), {
      x,
      y: top - size,
      size,
      font: strong ? bold : regular,
      color,
    });
  }
  function wrap(value: string, width: number, size = 10, strong = false) {
    const font = strong ? bold : regular;
    const lines: string[] = [];
    for (const paragraph of clean(value).split("\n")) {
      let line = "";
      for (const word of paragraph.split(/\s+/)) {
        if (
          font.widthOfTextAtSize(line ? `${line} ${word}` : word, size) <= width
        ) {
          line = line ? `${line} ${word}` : word;
        } else {
          if (line) lines.push(line);
          line = "";
          for (const char of word) {
            if (font.widthOfTextAtSize(line + char, size) > width) {
              lines.push(line);
              line = "";
            }
            line += char;
          }
        }
      }
      lines.push(line);
    }
    return lines;
  }
  function header(continued = false) {
    text(
      data.company,
      34,
      808,
      Math.min(18, 300 / bold.widthOfTextAtSize(clean(data.company), 1)),
      true,
    );
    text("SERVICIOS TECNOLÓGICOS E INFORMÁTICOS", 34, 782, 8, true, blue);
    text(
      `RUC: ${data.ruc || "-"} | ${data.location}`,
      34,
      765,
      9,
      false,
      muted,
    );
    wrap(data.contact, 310, 8).forEach((line, index) =>
      text(line, 34, 752 - index * 10, 8, false, muted),
    );
    page.drawImage(logo, { x: 355, y: 758, width: 90, height: 30 });
    text("PROFORMA", 459, 804, 13, true);
    text(
      data.number,
      459,
      784,
      Math.min(8, 102 / regular.widthOfTextAtSize(clean(data.number), 1)),
    );
    text(data.date.split("-").reverse().join("/"), 459, 770, 8);
    y = continued ? 738 : 742;
  }
  function ensure(height: number) {
    if (y - height < 65) {
      page = pdf.addPage([595.28, 841.89]);
      header(true);
    }
  }
  function section(title: string) {
    ensure(40);
    y -= 12;
    text(title, 34, y, 11, true, blue);
    y -= 18;
  }
  function paragraph(value: string, size = 10) {
    const lines = wrap(value, 527, size);
    for (const line of lines) {
      ensure(15);
      text(line, 34, y, size);
      y -= 14;
    }
  }
  function field(label: string, value: string) {
    paragraph(`${label}: ${value || "-"}`, 9);
  }
  header();
  y -= 12;
  const columns = [
    {
      title: "DATOS DEL CLIENTE",
      x: 34,
      fields: [
        `Nombre / Razón social: ${data.client}`,
        `DNI / RUC: ${data.document || "-"}`,
        `Dirección: ${data.address || "-"}`,
        `Teléfono / Contacto: ${data.phone || "-"}`,
      ],
    },
    {
      title: "RESUMEN DE LA PROFORMA",
      x: 306,
      fields: [
        `Servicio: ${data.service}`,
        `Equipos: ${data.equipment || "-"}`,
        `Tiempo de entrega: ${data.delivery}`,
        `Validez: ${data.validity} días calendario`,
      ],
    },
  ];
  const columnLines = columns.map((column) =>
    column.fields.flatMap((value) => wrap(value, 247, 9)),
  );
  const boxHeight =
    Math.max(...columnLines.map((lines) => lines.length)) * 13 + 36;
  ensure(boxHeight);
  columns.forEach((column, index) => {
    page.drawRectangle({
      x: column.x,
      y: y - boxHeight,
      width: 255,
      height: boxHeight,
      color: pale,
      borderColor: border,
      borderWidth: 0.5,
    });
    text(column.title, column.x + 8, y - 8, 10, true, blue);
    columnLines[index].forEach((line, row) =>
      text(line, column.x + 8, y - 29 - row * 13, 9),
    );
  });
  y -= boxHeight + 4;
  if (data.scope) {
    section("ALCANCE DEL SERVICIO");
    paragraph(data.scope, 9);
  }
  section("DETALLE ECONÓMICO DEL PRESUPUESTO");
  function tableHeader() {
    ensure(30);
    page.drawRectangle({
      x: 34,
      y: y - 23,
      width: 527,
      height: 24,
      color: ink,
    });
    text("#", 42, y - 6, 8, true, surface);
    text("DESCRIPCIÓN DEL SERVICIO", 62, y - 6, 8, true, surface);
    text("CANT.", 363, y - 6, 8, true, surface);
    text("P. UNIT.", 411, y - 6, 8, true, surface);
    text("TOTAL (S/)", 496, y - 6, 8, true, surface);
    y -= 25;
  }
  tableHeader();
  const amounts = calculateProforma(data);
  data.items.forEach((item, index) => {
    const lines = wrap(item.description, 283, 9);
    const height = Math.max(24, lines.length * 13 + 10);
    if (y - height < 65) {
      ensure(height);
      tableHeader();
    }
    page.drawRectangle({
      x: 34,
      y: y - height,
      width: 527,
      height,
      color: index % 2 ? pale : surface,
      borderColor: border,
      borderWidth: 0.4,
    });
    text(String(index + 1), 42, y - 8, 9);
    lines.forEach((line, i) => text(line, 62, y - 7 - i * 13, 9));
    text(String(item.quantity), 373, y - 8, 9);
    text(soles(Math.round(item.price * 100)), 407, y - 8, 8);
    const amount = soles(amounts.lines[index]);
    text(amount, 551 - regular.widthOfTextAtSize(clean(amount), 9), y - 8, 9);
    y -= height;
  });
  ensure(85);
  y -= 12;
  function total(label: string, value: number, emphasis = false) {
    page.drawRectangle({
      x: 304,
      y: y - 22,
      width: 257,
      height: 23,
      color: emphasis ? ink : pale,
    });
    text(label, 314, y - 7, 9, true, emphasis ? surface : ink);
    const amount = soles(value);
    text(
      amount,
      551 - bold.widthOfTextAtSize(clean(amount), 10),
      y - 6,
      10,
      true,
      emphasis ? surface : ink,
    );
    y -= 23;
  }
  total("Subtotal", amounts.subtotal);
  if (data.taxEnabled) total(`IGV (${data.taxRate}%)`, amounts.tax);
  total(
    data.taxEnabled ? "TOTAL CON IGV" : "TOTAL SIN IGV",
    amounts.total,
    true,
  );
  section("CONDICIONES DE LA PROFORMA");
  field("Garantía", data.warranty);
  field("Tiempo de entrega", data.delivery);
  field("Forma de pago", data.payment);
  field(
    "Importes",
    data.taxEnabled
      ? `Incluyen IGV del ${data.taxRate}%.`
      : "Sin IGV. El impuesto no está incluido en este total.",
  );
  if (data.notes) field("Observaciones", data.notes);
  const signerLines = wrap(data.signer || data.company, 211, 9, true);
  ensure(65 + signerLines.length * 12);
  y -= 24;
  page.drawLine({
    start: { x: 54, y },
    end: { x: 265, y },
    color: border,
    thickness: 1,
  });
  page.drawLine({
    start: { x: 330, y },
    end: { x: 541, y },
    color: border,
    thickness: 1,
  });
  signerLines.forEach((line, index) =>
    text(line, 54, y - 8 - index * 12, 9, true),
  );
  text("Conformidad del cliente", 330, y - 8, 9, true);
  text("Firma del responsable", 54, y - 38, 8, false, muted);
  text("Firma / DNI", 330, y - 23, 8, false, muted);
  pdf.getPages().forEach((p, index) => {
    p.drawText(
      `Proforma ${data.number} | Página ${index + 1} de ${pdf.getPageCount()}`,
      { x: 34, y: 28, size: 8, font: regular, color: muted },
    );
  });
  return pdf.save();
}
