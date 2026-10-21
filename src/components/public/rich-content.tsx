import { correctPublicCopy } from "@/lib/public-copy";
import { isSafeRichContent } from "@/lib/rich-content-validation";
type Node = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: Node[];
};
export function safeUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function RichContent({ content }: { content: unknown }) {
  if (!content || !isSafeRichContent(content)) return null;
  function render(node: Node, key: string, depth = 0): React.ReactNode {
    if (depth > 30) return null;
    const children = node.content
      ?.slice(0, 1000)
      .map((n, i) => render(n, `${key}-${i}`, depth + 1));
    switch (node.type) {
      case "doc":
        return <div key={key}>{children}</div>;
      case "paragraph":
        return <p key={key}>{children}</p>;
      case "heading":
        return node.attrs?.level === 3 ? (
          <h3 key={key}>{children}</h3>
        ) : (
          <h2 key={key}>{children}</h2>
        );
      case "bulletList":
        return <ul key={key}>{children}</ul>;
      case "orderedList":
        return <ol key={key}>{children}</ol>;
      case "listItem":
        return <li key={key}>{children}</li>;
      case "blockquote":
        return <blockquote key={key}>{children}</blockquote>;
      case "codeBlock":
        return (
          <pre key={key}>
            <code>{children}</code>
          </pre>
        );
      case "horizontalRule":
        return <hr key={key} />;
      case "hardBreak":
        return <br key={key} />;
      case "text": {
        let text: React.ReactNode = node.text ? correctPublicCopy(node.text) : node.text;
        for (const mark of node.marks || []) {
          if (mark.type === "bold") text = <strong>{text}</strong>;
          if (mark.type === "italic") text = <em>{text}</em>;
          if (mark.type === "code") text = <code>{text}</code>;
          if (mark.type === "strike") text = <s>{text}</s>;
          if (mark.type === "link") {
            const href = safeUrl(mark.attrs?.href);
            if (href)
              text = (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {text}
                </a>
              );
          }
        }
        return <span key={key}>{text}</span>;
      }
      default:
        return null;
    }
  }
  return (
    <div className="rich-content">{render(content as Node, "content")}</div>
  );
}
