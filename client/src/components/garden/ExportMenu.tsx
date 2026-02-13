import { useState, useRef, useEffect } from "react";
import { Download, FileText, FileCode, File, FileType } from "lucide-react";
import { stripHtml } from "./RichEditor";

interface ExportMenuProps {
  title: string;
  content: string;
  compact?: boolean;
  writingId?: string;
}

function htmlToMarkdown(html: string): string {
  if (!html.includes("<")) return html;
  let md = html;
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n## $1\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n### $1\n");
  md = md.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b>(.*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i>(.*?)<\/i>/gi, "*$1*");
  md = md.replace(/<u>(.*?)<\/u>/gi, "$1");
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, (_, inner) => {
    const text = inner.replace(/<\/?p[^>]*>/gi, "").trim();
    return "\n> " + text.split("\n").join("\n> ") + "\n";
  });
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1");
  md = md.replace(/<\/?(ul|ol|li)[^>]*>/gi, "");
  md = md.replace(/<hr\s*\/?>/gi, "\n---\n");
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
  md = md.replace(/<[^>]+>/g, "");
  md = md.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  md = md.replace(/\n{3,}/g, "\n\n");
  return md.trim();
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(title: string): string {
  return (title || "untitled")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

export default function ExportMenu({ title, content, compact = false, writingId }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const filename = sanitizeFilename(title);

  function exportTxt() {
    const plain = stripHtml(content);
    downloadFile(`${filename}.txt`, `${title}\n\n${plain}`, "text/plain");
    setOpen(false);
  }

  function exportMd() {
    const md = content.includes("<") ? htmlToMarkdown(content) : content;
    downloadFile(`${filename}.md`, `# ${title}\n\n${md}`, "text/markdown");
    setOpen(false);
  }

  function exportDocx() {
    if (!writingId) return;
    const a = document.createElement("a");
    a.href = `/api/writings/${writingId}/export-docx`;
    a.download = `${filename}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setOpen(false);
  }

  function exportPdf() {
    const isHtml = content.includes("<");
    const bodyContent = isHtml ? content : `<p>${content.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")}</p>`;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<style>
  body { font-family: 'Lora', serif; max-width: 680px; margin: 60px auto; padding: 0 40px; color: #1a1a1a; line-height: 2; font-size: 14px; }
  h1 { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-style: italic; font-size: 2.5rem; margin-bottom: 2rem; letter-spacing: -0.02em; }
  h2 { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-style: italic; font-size: 1.75rem; margin: 2em 0 0.5em; }
  h3 { font-family: 'Cormorant Garamond', serif; font-weight: 300; font-style: italic; font-size: 1.35rem; margin: 1.5em 0 0.4em; }
  p { margin-bottom: 0.75em; }
  blockquote { border-left: 2px solid #ccc; padding-left: 1.25rem; margin: 1em 0; color: #555; font-style: italic; }
  ul { list-style: disc; padding-left: 1.5rem; }
  ol { list-style: decimal; padding-left: 1.5rem; }
  hr { border: none; border-top: 1px solid #ddd; margin: 2em 0; }
  @media print { body { margin: 0; padding: 20px; } }
</style></head><body>
<h1>${title}</h1>
${bodyContent}
</body></html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
    setOpen(false);
  }

  if (!content) return null;

  const btnClass = compact
    ? "p-1.5 text-white/40 hover:text-white/70 transition-colors"
    : "flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.15] hover:border-white/25 rounded-full font-mono text-[9px] uppercase tracking-widest text-white/50 hover:text-white/70 transition-all";

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className={btnClass} data-testid="button-export">
        <Download size={compact ? 13 : 11} />
        {!compact && "Export"}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-[#0f1520] border border-white/[0.15] rounded-lg shadow-xl z-50 py-1 overflow-hidden">
          <button onClick={exportTxt} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white/80 hover:bg-white/[0.05] transition-all" data-testid="export-txt">
            <FileText size={13} className="text-white/40" />
            Plain Text (.txt)
          </button>
          <button onClick={exportMd} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white/80 hover:bg-white/[0.05] transition-all" data-testid="export-md">
            <FileCode size={13} className="text-white/40" />
            Markdown (.md)
          </button>
          {writingId && (
            <button onClick={exportDocx} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white/80 hover:bg-white/[0.05] transition-all" data-testid="export-docx">
              <FileType size={13} className="text-white/40" />
              Manuscript (.docx)
            </button>
          )}
          <button onClick={exportPdf} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white/80 hover:bg-white/[0.05] transition-all" data-testid="export-pdf">
            <File size={13} className="text-white/40" />
            Print / PDF
          </button>
        </div>
      )}
    </div>
  );
}
