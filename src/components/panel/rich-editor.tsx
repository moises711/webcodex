"use client";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
export function RichEditor({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
    ],
    content: value as JSONContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });
  if (!editor) return <div className="skeleton" />;
  return (
    <>
      <div
        className="editor-toolbar"
        role="toolbar"
        aria-label="Formato de texto"
      >
        <button
          type="button"
          className="button secondary button-small"
          aria-pressed={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Negrita
        </button>
        <button
          type="button"
          className="button secondary button-small"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Cursiva
        </button>
        <button
          type="button"
          className="button secondary button-small"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          Título
        </button>
        <button
          type="button"
          className="button secondary button-small"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Lista
        </button>
        <button
          type="button"
          className="button secondary button-small"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Cita
        </button>
        <button
          type="button"
          className="button secondary button-small"
          onClick={() => {
            const href = window.prompt("URL del enlace (https://)");
            if (href?.startsWith("https://"))
              editor.chain().focus().setLink({ href }).run();
          }}
        >
          Enlace
        </button>
      </div>
      <EditorContent editor={editor} />
    </>
  );
}
