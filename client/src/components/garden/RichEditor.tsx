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
let compressor: DynamicsCompressorNode | null = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    const sr = audioCtx.sampleRate;

    compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 12;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.001;
    compressor.release.value = 0.05;
    compressor.connect(audioCtx.destination);

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(compressor);

    const revLen = sr * 0.6;
    const revBuf = audioCtx.createBuffer(2, revLen, sr);
    for (let ch = 0; ch < 2; ch++) {
      const revData = revBuf.getChannelData(ch);
      for (let i = 0; i < revLen; i++) {
        const t = i / sr;
        revData[i] = (Math.random() * 2 - 1) * Math.exp(-t / 0.08) * 0.6
          + (Math.random() * 2 - 1) * Math.exp(-t / 0.25) * 0.15;
      }
    }
    convolver = audioCtx.createConvolver();
    convolver.buffer = revBuf;
    const wetGain = audioCtx.createGain();
    wetGain.gain.value = 0.18;
    convolver.connect(wetGain).connect(masterGain);
  }
  return audioCtx;
}

function getDest() { return masterGain || getAudioCtx().destination; }
function getWet() { return convolver || getAudioCtx().destination; }

function makeNoise(ctx: AudioContext, duration: number) {
  const len = Math.ceil(ctx.sampleRate * duration);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
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
      const v = 0.7 + Math.random() * 0.3;
      const pitchVar = 0.85 + Math.random() * 0.3;

      const click = makeNoise(ctx, 0.015);
      const clickHp = ctx.createBiquadFilter();
      clickHp.type = "highpass";
      clickHp.frequency.value = 4000 * pitchVar;
      clickHp.Q.value = 0.8;
      const clickG = ctx.createGain();
      clickG.gain.setValueAtTime(0, now);
      clickG.gain.linearRampToValueAtTime(0.12 * v, now + 0.0005);
      clickG.gain.exponentialRampToValueAtTime(0.01 * v, now + 0.004);
      clickG.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
      click.connect(clickHp).connect(clickG);
      clickG.connect(dest);
      clickG.connect(wet);
      click.start(now);
      click.stop(now + 0.015);

      const thock = makeNoise(ctx, 0.12);
      const thockLp = ctx.createBiquadFilter();
      thockLp.type = "lowpass";
      thockLp.frequency.value = 280 + Math.random() * 80;
      thockLp.Q.value = 3.5;
      const thockBp = ctx.createBiquadFilter();
      thockBp.type = "bandpass";
      thockBp.frequency.value = 150 * pitchVar;
      thockBp.Q.value = 2.0;
      const thockG = ctx.createGain();
      thockG.gain.setValueAtTime(0, now);
      thockG.gain.linearRampToValueAtTime(0.22 * v, now + 0.001);
      thockG.gain.exponentialRampToValueAtTime(0.06 * v, now + 0.015);
      thockG.gain.exponentialRampToValueAtTime(0.008 * v, now + 0.05);
      thockG.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      thock.connect(thockLp).connect(thockBp).connect(thockG);
      thockG.connect(dest);
      thockG.connect(wet);
      thock.start(now + 0.0005);
      thock.stop(now + 0.12);

      const plate = ctx.createOscillator();
      plate.type = "sine";
      plate.frequency.value = (180 + Math.random() * 40) * pitchVar;
      const plateG = ctx.createGain();
      plateG.gain.setValueAtTime(0, now);
      plateG.gain.linearRampToValueAtTime(0.025 * v, now + 0.002);
      plateG.gain.exponentialRampToValueAtTime(0.004 * v, now + 0.03);
      plateG.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
      plate.connect(plateG);
      plateG.connect(dest);
      plateG.connect(wet);
      plate.start(now + 0.001);
      plate.stop(now + 0.1);

      const body = makeNoise(ctx, 0.08);
      const bodyLp = ctx.createBiquadFilter();
      bodyLp.type = "lowpass";
      bodyLp.frequency.value = 600 + Math.random() * 200;
      bodyLp.Q.value = 0.5;
      const bodyG = ctx.createGain();
      bodyG.gain.setValueAtTime(0, now);
      bodyG.gain.linearRampToValueAtTime(0.04 * v, now + 0.002);
      bodyG.gain.exponentialRampToValueAtTime(0.006 * v, now + 0.02);
      bodyG.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
      body.connect(bodyLp).connect(bodyG);
      bodyG.connect(dest);
      body.start(now + 0.001);
      body.stop(now + 0.08);

    } else if (type === "space") {
      const v = 0.8 + Math.random() * 0.2;

      const snap = makeNoise(ctx, 0.02);
      const snapHp = ctx.createBiquadFilter();
      snapHp.type = "highpass";
      snapHp.frequency.value = 2500;
      snapHp.Q.value = 0.5;
      const snapG = ctx.createGain();
      snapG.gain.setValueAtTime(0, now);
      snapG.gain.linearRampToValueAtTime(0.08 * v, now + 0.001);
      snapG.gain.exponentialRampToValueAtTime(0.005 * v, now + 0.008);
      snapG.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
      snap.connect(snapHp).connect(snapG);
      snapG.connect(dest);
      snapG.connect(wet);
      snap.start(now);
      snap.stop(now + 0.02);

      const thud = makeNoise(ctx, 0.25);
      const thudLp = ctx.createBiquadFilter();
      thudLp.type = "lowpass";
      thudLp.frequency.value = 200;
      thudLp.Q.value = 4.0;
      const thudG = ctx.createGain();
      thudG.gain.setValueAtTime(0, now);
      thudG.gain.linearRampToValueAtTime(0.28 * v, now + 0.002);
      thudG.gain.exponentialRampToValueAtTime(0.05 * v, now + 0.025);
      thudG.gain.exponentialRampToValueAtTime(0.008 * v, now + 0.08);
      thudG.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      thud.connect(thudLp).connect(thudG);
      thudG.connect(dest);
      thudG.connect(wet);
      thud.start(now + 0.001);
      thud.stop(now + 0.25);

      const rattle = makeNoise(ctx, 0.15);
      const rattleBp = ctx.createBiquadFilter();
      rattleBp.type = "bandpass";
      rattleBp.frequency.value = 400;
      rattleBp.Q.value = 1.2;
      const rattleG = ctx.createGain();
      rattleG.gain.setValueAtTime(0, now);
      rattleG.gain.linearRampToValueAtTime(0.03 * v, now + 0.003);
      rattleG.gain.exponentialRampToValueAtTime(0.004 * v, now + 0.04);
      rattleG.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      rattle.connect(rattleBp).connect(rattleG);
      rattleG.connect(dest);
      rattle.start(now + 0.002);
      rattle.stop(now + 0.15);

      const stabilizer = ctx.createOscillator();
      stabilizer.type = "sine";
      stabilizer.frequency.value = 120;
      const stabG = ctx.createGain();
      stabG.gain.setValueAtTime(0, now);
      stabG.gain.linearRampToValueAtTime(0.04 * v, now + 0.003);
      stabG.gain.exponentialRampToValueAtTime(0.006, now + 0.05);
      stabG.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      stabilizer.connect(stabG);
      stabG.connect(dest);
      stabG.connect(wet);
      stabilizer.start(now + 0.001);
      stabilizer.stop(now + 0.2);

    } else if (type === "enter") {
      const v = 0.85 + Math.random() * 0.15;

      const crack = makeNoise(ctx, 0.025);
      const crackHp = ctx.createBiquadFilter();
      crackHp.type = "highpass";
      crackHp.frequency.value = 3500;
      crackHp.Q.value = 0.6;
      const crackG = ctx.createGain();
      crackG.gain.setValueAtTime(0, now);
      crackG.gain.linearRampToValueAtTime(0.14 * v, now + 0.0008);
      crackG.gain.exponentialRampToValueAtTime(0.008 * v, now + 0.006);
      crackG.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
      crack.connect(crackHp).connect(crackG);
      crackG.connect(dest);
      crackG.connect(wet);
      crack.start(now);
      crack.stop(now + 0.025);

      const deepThock = makeNoise(ctx, 0.2);
      const deepLp = ctx.createBiquadFilter();
      deepLp.type = "lowpass";
      deepLp.frequency.value = 250;
      deepLp.Q.value = 5.0;
      const deepG = ctx.createGain();
      deepG.gain.setValueAtTime(0, now);
      deepG.gain.linearRampToValueAtTime(0.3 * v, now + 0.002);
      deepG.gain.exponentialRampToValueAtTime(0.06 * v, now + 0.03);
      deepG.gain.exponentialRampToValueAtTime(0.01 * v, now + 0.08);
      deepG.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      deepThock.connect(deepLp).connect(deepG);
      deepG.connect(dest);
      deepG.connect(wet);
      deepThock.start(now + 0.001);
      deepThock.stop(now + 0.2);

      const ring = ctx.createOscillator();
      ring.type = "sine";
      ring.frequency.value = 160;
      const ringG = ctx.createGain();
      ringG.gain.setValueAtTime(0, now);
      ringG.gain.linearRampToValueAtTime(0.035 * v, now + 0.003);
      ringG.gain.exponentialRampToValueAtTime(0.008, now + 0.06);
      ringG.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      ring.connect(ringG);
      ringG.connect(dest);
      ringG.connect(wet);
      ring.start(now + 0.002);
      ring.stop(now + 0.28);

      const slideNoise = makeNoise(ctx, 0.1);
      const slideBp = ctx.createBiquadFilter();
      slideBp.type = "bandpass";
      slideBp.frequency.value = 500;
      slideBp.Q.value = 0.8;
      const slideG = ctx.createGain();
      slideG.gain.setValueAtTime(0, now + 0.01);
      slideG.gain.linearRampToValueAtTime(0.02 * v, now + 0.02);
      slideG.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      slideNoise.connect(slideBp).connect(slideG);
      slideG.connect(dest);
      slideNoise.start(now + 0.01);
      slideNoise.stop(now + 0.1);

    } else if (type === "backspace") {
      const v = 0.6 + Math.random() * 0.3;

      const tick = makeNoise(ctx, 0.012);
      const tickHp = ctx.createBiquadFilter();
      tickHp.type = "highpass";
      tickHp.frequency.value = 5000;
      tickHp.Q.value = 0.6;
      const tickG = ctx.createGain();
      tickG.gain.setValueAtTime(0, now);
      tickG.gain.linearRampToValueAtTime(0.07 * v, now + 0.0005);
      tickG.gain.exponentialRampToValueAtTime(0.005 * v, now + 0.003);
      tickG.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);
      tick.connect(tickHp).connect(tickG);
      tickG.connect(dest);
      tickG.connect(wet);
      tick.start(now);
      tick.stop(now + 0.012);

      const softThock = makeNoise(ctx, 0.08);
      const softLp = ctx.createBiquadFilter();
      softLp.type = "lowpass";
      softLp.frequency.value = 350;
      softLp.Q.value = 2.5;
      const softG = ctx.createGain();
      softG.gain.setValueAtTime(0, now);
      softG.gain.linearRampToValueAtTime(0.12 * v, now + 0.001);
      softG.gain.exponentialRampToValueAtTime(0.02 * v, now + 0.015);
      softG.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
      softThock.connect(softLp).connect(softG);
      softG.connect(dest);
      softG.connect(wet);
      softThock.start(now + 0.0005);
      softThock.stop(now + 0.08);

      const muted = ctx.createOscillator();
      muted.type = "sine";
      muted.frequency.value = 140 + Math.random() * 20;
      const mutedG = ctx.createGain();
      mutedG.gain.setValueAtTime(0, now);
      mutedG.gain.linearRampToValueAtTime(0.012 * v, now + 0.002);
      mutedG.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      muted.connect(mutedG);
      mutedG.connect(dest);
      muted.start(now + 0.001);
      muted.stop(now + 0.06);
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
