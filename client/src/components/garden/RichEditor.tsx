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
let masterGain: GainNode | null = null;
let convolver: ConvolverNode | null = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    const sr = audioCtx.sampleRate;

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(audioCtx.destination);

    const revLen = sr * 0.35;
    const revBuf = audioCtx.createBuffer(1, revLen, sr);
    const revData = revBuf.getChannelData(0);
    for (let i = 0; i < revLen; i++) {
      revData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 0.1));
    }
    convolver = audioCtx.createConvolver();
    convolver.buffer = revBuf;
    const wetGain = audioCtx.createGain();
    wetGain.gain.value = 0.12;
    convolver.connect(wetGain).connect(masterGain);
  }
  return audioCtx;
}

function getDest() { return masterGain || getAudioCtx().destination; }
function getWet() { return convolver || getAudioCtx().destination; }

function makeNoise(ctx: AudioContext, duration: number) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

function playTypewriterSound(type: "key" | "space" | "enter" | "backspace" = "key") {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;
    const dest = getDest();
    const wet = getWet();

    if (type === "key") {
      const v = 0.5 + Math.random() * 0.3;

      const tick = makeNoise(ctx, 0.08);
      const tickLp = ctx.createBiquadFilter();
      tickLp.type = "lowpass";
      tickLp.frequency.value = 3000 + Math.random() * 400;
      tickLp.Q.value = 0.3;
      const tickG = ctx.createGain();
      tickG.gain.setValueAtTime(0, now);
      tickG.gain.linearRampToValueAtTime(0.035 * v, now + 0.002);
      tickG.gain.exponentialRampToValueAtTime(0.002 * v, now + 0.012);
      tickG.gain.exponentialRampToValueAtTime(0.0004, now + 0.06);
      tick.connect(tickLp).connect(tickG);
      tickG.connect(dest);
      tickG.connect(wet);
      tick.start(now);
      tick.stop(now + 0.08);

      const body = makeNoise(ctx, 0.2);
      const bodyLp = ctx.createBiquadFilter();
      bodyLp.type = "lowpass";
      bodyLp.frequency.value = 200 + Math.random() * 60;
      bodyLp.Q.value = 1.6;
      const bodyG = ctx.createGain();
      bodyG.gain.setValueAtTime(0, now);
      bodyG.gain.linearRampToValueAtTime(0.09 * v, now + 0.003);
      bodyG.gain.exponentialRampToValueAtTime(0.015 * v, now + 0.03);
      bodyG.gain.exponentialRampToValueAtTime(0.0004, now + 0.16);
      body.connect(bodyLp).connect(bodyG);
      bodyG.connect(dest);
      bodyG.connect(wet);
      body.start(now + 0.001);
      body.stop(now + 0.2);

      const hum = ctx.createOscillator();
      hum.type = "sine";
      hum.frequency.value = 100 + Math.random() * 25;
      const humG = ctx.createGain();
      humG.gain.setValueAtTime(0, now);
      humG.gain.linearRampToValueAtTime(0.01 * v, now + 0.005);
      humG.gain.exponentialRampToValueAtTime(0.0004, now + 0.1);
      hum.connect(humG);
      humG.connect(dest);
      hum.start(now + 0.003);
      hum.stop(now + 0.12);

    } else if (type === "space") {
      const tap = makeNoise(ctx, 0.06);
      const tapBp = ctx.createBiquadFilter();
      tapBp.type = "bandpass";
      tapBp.frequency.value = 800;
      tapBp.Q.value = 0.35;
      const tapG = ctx.createGain();
      tapG.gain.setValueAtTime(0, now);
      tapG.gain.linearRampToValueAtTime(0.04, now + 0.002);
      tapG.gain.exponentialRampToValueAtTime(0.0004, now + 0.045);
      tap.connect(tapBp).connect(tapG);
      tapG.connect(dest);
      tapG.connect(wet);
      tap.start(now);
      tap.stop(now + 0.06);

      const cushion = makeNoise(ctx, 0.2);
      const cushionLp = ctx.createBiquadFilter();
      cushionLp.type = "lowpass";
      cushionLp.frequency.value = 160;
      cushionLp.Q.value = 1.8;
      const cushionG = ctx.createGain();
      cushionG.gain.setValueAtTime(0, now);
      cushionG.gain.linearRampToValueAtTime(0.12, now + 0.003);
      cushionG.gain.exponentialRampToValueAtTime(0.02, now + 0.04);
      cushionG.gain.exponentialRampToValueAtTime(0.0004, now + 0.18);
      cushion.connect(cushionLp).connect(cushionG);
      cushionG.connect(dest);
      cushionG.connect(wet);
      cushion.start(now + 0.001);
      cushion.stop(now + 0.2);

    } else if (type === "enter") {
      const click = makeNoise(ctx, 0.05);
      const clickLp = ctx.createBiquadFilter();
      clickLp.type = "lowpass";
      clickLp.frequency.value = 2200;
      clickLp.Q.value = 0.35;
      const clickG = ctx.createGain();
      clickG.gain.setValueAtTime(0, now);
      clickG.gain.linearRampToValueAtTime(0.05, now + 0.002);
      clickG.gain.exponentialRampToValueAtTime(0.0004, now + 0.04);
      click.connect(clickLp).connect(clickG);
      clickG.connect(dest);
      clickG.connect(wet);
      click.start(now);
      click.stop(now + 0.05);

      const chime = ctx.createOscillator();
      chime.type = "sine";
      chime.frequency.value = 1100;
      const chimeG = ctx.createGain();
      chimeG.gain.setValueAtTime(0, now + 0.03);
      chimeG.gain.linearRampToValueAtTime(0.012, now + 0.05);
      chimeG.gain.exponentialRampToValueAtTime(0.0004, now + 0.5);
      chime.connect(chimeG);
      chimeG.connect(dest);
      chimeG.connect(wet);
      chime.start(now + 0.03);
      chime.stop(now + 0.55);

    } else if (type === "backspace") {
      const tap = makeNoise(ctx, 0.04);
      const tapLp = ctx.createBiquadFilter();
      tapLp.type = "lowpass";
      tapLp.frequency.value = 1800;
      tapLp.Q.value = 0.3;
      const tapG = ctx.createGain();
      tapG.gain.setValueAtTime(0, now);
      tapG.gain.linearRampToValueAtTime(0.02, now + 0.002);
      tapG.gain.exponentialRampToValueAtTime(0.0004, now + 0.03);
      tap.connect(tapLp).connect(tapG);
      tapG.connect(dest);
      tapG.connect(wet);
      tap.start(now);
      tap.stop(now + 0.04);
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
