const types = new Set([
  "doc",
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "codeBlock",
  "horizontalRule",
  "hardBreak",
  "text",
]);
export function isSafeRichContent(value: unknown) {
  if (value === null) return true;
  try {
    const json = JSON.stringify(value);
    if (!json || json.length > 100000) return false;
  } catch {
    return false;
  }
  const queue: { node: unknown; depth: number }[] = [{ node: value, depth: 0 }];
  let count = 0;
  while (queue.length) {
    const { node, depth } = queue.pop()!;
    if (
      ++count > 1000 ||
      depth > 30 ||
      !node ||
      typeof node !== "object" ||
      Array.isArray(node)
    )
      return false;
    const n = node as Record<string, unknown>;
    if (typeof n.type !== "string" || !types.has(n.type)) return false;
    if (n.text !== undefined && typeof n.text !== "string") return false;
    if (
      n.attrs !== undefined &&
      (!n.attrs || typeof n.attrs !== "object" || Array.isArray(n.attrs))
    )
      return false;
    if (n.marks !== undefined) {
      if (!Array.isArray(n.marks) || n.marks.length > 20) return false;
      if (
        n.marks.some(
          (mark) =>
            !mark || typeof mark !== "object" || typeof mark.type !== "string",
        )
      )
        return false;
    }
    if (n.content !== undefined) {
      if (!Array.isArray(n.content)) return false;
      for (const child of n.content)
        queue.push({ node: child, depth: depth + 1 });
    }
  }
  return true;
}
