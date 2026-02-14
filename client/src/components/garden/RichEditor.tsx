import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback, useRef, useState } from "react";
import DOMPurify from "dompurify";
import {
  Bold, Italic, Underline as UnderlineIcon, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Undo, Redo, Volume2, VolumeX,
} from "lucide-react";

let audioCtx: AudioContext | null = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTypewriterSound(type: "key" | "space" | "enter" | "backspace" = "key") {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;

    if (type === "key") {
      const variance = 0.7 + Math.random() * 0.6;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = "square";
      osc.frequency.value = 1800 + Math.random() * 1200;
      filter.type = "bandpass";
      filter.frequency.value = 2000 + Math.random() * 500;
      filter.Q.value = 2;
      gain.gain.setValueAtTime(0.06 * variance, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);

      const noise = ctx.createBufferSource();
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseData.length; i++) noiseData[i] = (Math.random() * 2 - 1) * 0.3;
      noise.buffer = noiseBuffer;
      const noiseGain = ctx.createGain();
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "highpass";
      noiseFilter.frequency.value = 3000;
      noiseGain.gain.setValueAtTime(0.08 * variance, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.03);

      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thud.type = "sine";
      thud.frequency.value = 150 + Math.random() * 80;
      thudGain.gain.setValueAtTime(0.04 * variance, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      thud.connect(thudGain);
      thudGain.connect(ctx.destination);
      thud.start(now);
      thud.stop(now + 0.035);

    } else if (type === "space") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 900 + Math.random() * 300;
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.065);

      const thud = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thud.type = "sine";
      thud.frequency.value = 120;
      thudGain.gain.setValueAtTime(0.07, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      thud.connect(thudGain);
      thudGain.connect(ctx.destination);
      thud.start(now);
      thud.stop(now + 0.085);

    } else if (type === "enter") {
      const ding = ctx.createOscillator();
      const dingGain = ctx.createGain();
      ding.type = "sine";
      ding.frequency.value = 2400;
      dingGain.gain.setValueAtTime(0.04, now);
      dingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      ding.connect(dingGain);
      dingGain.connect(ctx.destination);
      ding.start(now);
      ding.stop(now + 0.16);

      const slide = ctx.createOscillator();
      const slideGain = ctx.createGain();
      slide.type = "sawtooth";
      slide.frequency.setValueAtTime(300, now + 0.05);
      slide.frequency.linearRampToValueAtTime(150, now + 0.2);
      slideGain.gain.setValueAtTime(0.03, now + 0.05);
      slideGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      slide.connect(slideGain);
      slideGain.connect(ctx.destination);
      slide.start(now + 0.05);
      slide.stop(now + 0.22);

    } else if (type === "backspace") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = 600 + Math.random() * 200;
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    }
  } catch (e) {}
}

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function RichEditor({ content, onChange, placeholder = "Begin writing...", autoFocus = true }: RichEditorProps) {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { return localStorage.getItem("typewriter-sound") !== "off"; } catch { return true; }
  });

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem("typewriter-sound", next ? "on" : "off"); } catch {}
      return next;
    });
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!soundEnabled) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === "Enter") {
      playTypewriterSound("enter");
    } else if (e.key === " ") {
      playTypewriterSound("space");
    } else if (e.key === "Backspace" || e.key === "Delete") {
      playTypewriterSound("backspace");
    } else if (e.key.length === 1) {
      playTypewriterSound("key");
    }
  }, [soundEnabled]);

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
        class: "prose-editor typewriter-editor min-h-[55vh] focus:outline-none text-lg leading-[2] text-white/80 tracking-wide",
        "data-testid": "editor-content",
      },
      handleKeyDown: (_view, event) => {
        handleKeyDown(event);
        return false;
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
      <div className="flex items-center gap-1">
        <Toolbar editor={editor} />
        <div className="ml-auto">
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded transition-all ${soundEnabled ? "text-amber-400/60 hover:text-amber-300" : "text-white/20 hover:text-white/40"}`}
            title={soundEnabled ? "Mute typewriter sounds" : "Enable typewriter sounds"}
            data-testid="toggle-typewriter-sound"
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        </div>
      </div>
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
    const lines = text.split("\n");
    return (
      <div className={className}>
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
        {maxLength && content.length > maxLength && <span className="text-white/50 italic"> ...continues</span>}
      </div>
    );
  }

  if (maxLength) {
    const plain = stripHtmlPreserveBreaks(content);
    const truncated = plain.slice(0, maxLength);
    const lines = truncated.split("\n");
    return (
      <div className={className}>
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
        {plain.length > maxLength && <span className="text-white/50 italic"> ...continues</span>}
      </div>
    );
  }

  return (
    <div
      className={`prose-content ${className}`}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
    />
  );
}

function stripHtmlPreserveBreaks(html: string): string {
  return html
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div|h[1-6]|li|blockquote)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function wordCountFromContent(content: string): number {
  const text = stripHtml(content);
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
