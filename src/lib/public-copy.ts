const replacements: [RegExp, string][] = [
  [/\bservisio(s?)\b/gi, "servicio$1"], [/\bneuvos\b/gi, "nuevos"],
  [/\bse realizo\b/gi, "se realizó"], [/\binstalacion\b/gi, "instalación"],
  [/\bpagina(s?)\b/gi, "página$1"], [/\bdiseno\b/gi, "diseño"],
  [/\btecnico(s?)\b/gi, "técnico$1"], [/\bprogramacion\b/gi, "programación"],
];
export function correctPublicCopy(text: string) {
  return replacements.reduce((value, [pattern, replacement]) => value.replace(pattern, (match, ...args) => {
    const fixed = replacement.replace(/\$(\d)/g, (_, index) => String(args[Number(index) - 1] || ""));
    return match[0] === match[0].toUpperCase() ? fixed[0].toUpperCase() + fixed.slice(1) : fixed;
  }), text);
}
export function publicProjectCopy<T extends {title: string; summary: string}>(project: T): T {
  return {...project, title: correctPublicCopy(project.title), summary: correctPublicCopy(project.summary)};
}
