import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback } from "react";
import DOMPurify from "dompurify";
import {
  Bold, Italic, Underline as UnderlineIcon, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Undo, Redo,
} from "lucide-react";

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function RichEditor({ content, onChange, placeholder = "Begin writing...", autoFocus = true }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class: "prose-editor min-h-[55vh] focus:outline-none text-lg font-serif leading-[2] text-white/80 tracking-wide",
        "data-testid": "editor-content",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const isEmpty = editor.isEmpty;
      onChange(isEmpty ? "" : html);
    },
    autofocus: autoFocus ? "end" : false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="space-y-3">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const btn = (active: boolean) =>
    `p-1.5 rounded transition-all ${
      active
        ? "text-white/80 bg-white/[0.08]"
        : "text-white/35 hover:text-white/60 hover:bg-white/[0.04]"
    }`;

  const sep = "w-px h-5 bg-white/[0.08] mx-1";

  return (
    <div className="flex items-center gap-0.5 pb-3 border-b border-white/[0.08] flex-wrap" data-testid="editor-toolbar">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))} title="Bold (Cmd+B)" data-testid="toolbar-bold">
        <Bold size={15} />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))} title="Italic (Cmd+I)" data-testid="toolbar-italic">
        <Italic size={15} />
      </button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive("underline"))} title="Underline (Cmd+U)" data-testid="toolbar-underline">
        <UnderlineIcon size={15} />
      </button>
      <div className={sep} />
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))} title="Heading 2" data-testid="toolbar-h2">
        <Heading2 size={15} />
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))} title="Heading 3" data-testid="toolbar-h3">
        <Heading3 size={15} />
      </button>
      <div className={sep} />
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))} title="Bullet List" data-testid="toolbar-bullet">
        <List size={15} />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))} title="Numbered List" data-testid="toolbar-ordered">
        <ListOrdered size={15} />
      </button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))} title="Block Quote" data-testid="toolbar-quote">
        <Quote size={15} />
      </button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btn(false)} title="Horizontal Rule" data-testid="toolbar-hr">
        <Minus size={15} />
      </button>
      <div className={sep} />
      <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={`${btn(false)} disabled:opacity-20`} title="Undo (Cmd+Z)" data-testid="toolbar-undo">
        <Undo size={15} />
      </button>
      <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={`${btn(false)} disabled:opacity-20`} title="Redo (Cmd+Shift+Z)" data-testid="toolbar-redo">
        <Redo size={15} />
      </button>
    </div>
  );
}

export function stripHtml(html: string): string {
  if (!html) return "";
  if (!html.includes("<")) return html;
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function ContentRenderer({ content, className = "", maxLength }: { content: string; className?: string; maxLength?: number }) {
  if (!content) return null;

  const isHtml = content.includes("<");

  if (!isHtml) {
    const text = maxLength ? content.slice(0, maxLength) : content;
    return (
      <p className={className}>
        {text}
        {maxLength && content.length > maxLength && <span className="text-white/50 italic"> ...continues</span>}
      </p>
    );
  }

  if (maxLength) {
    const plain = stripHtml(content);
    const truncated = plain.slice(0, maxLength);
    return (
      <p className={className}>
        {truncated}
        {plain.length > maxLength && <span className="text-white/50 italic"> ...continues</span>}
      </p>
    );
  }

  return (
    <div
      className={`prose-content ${className}`}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
    />
  );
}

export function wordCountFromContent(content: string): number {
  const text = stripHtml(content);
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
