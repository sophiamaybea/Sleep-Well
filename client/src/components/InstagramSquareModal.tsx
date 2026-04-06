import { useRef, useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLogInstagramSquare } from "@/hooks/use-instagram-square";
import { Download, Instagram } from "lucide-react";

const CANVAS_SIZE = 1080;

const THEMES = {
    dark:    { bg: "#1a1a2e", text: "#e8e0d0", accent: "#9c6b8a" },
    cream:   { bg: "#faf6f1", text: "#2c2c2c", accent: "#8b7355" },
    forest:  { bg: "#1b2e1b", text: "#d4e8d0", accent: "#7ab87a" },
    midnight:{ bg: "#0d1b2a", text: "#c8d8e8", accent: "#5b8db8" },
    rose:    { bg: "#2e1b1b", text: "#f0d8d8", accent: "#c87070" },
  } as const;
type ThemeKey = keyof typeof THEMES;

const FONTS = {
    serif:      "Georgia, 'Times New Roman', serif",
    sans:       "'Helvetica Neue', Helvetica, Arial, sans-serif",
    mono:       "'Courier New', Courier, monospace",
  } as const;
type FontKey = keyof typeof FONTS;

export interface InstagramSquareModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    writingId?: string;
    title?: string;
    content: string;
  }

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
          const test = current ? current + " " + word : word;
          if (ctx.measureText(test).width > maxWidth && current) {
                  lines.push(current);
                  current = word;
                } else {
                  current = test;
                }
        }
    if (current) lines.push(current);
    return lines;
  }

export function InstagramSquareModal({ open, onOpenChange, writingId, title, content }: InstagramSquareModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [theme, setTheme] = useState<ThemeKey>("dark");
    const [font, setFont] = useState<FontKey>("serif");
    const [downloading, setDownloading] = useState(false);
    const logMutation = useLogInstagramSquare();

  const renderCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const colors = THEMES[theme];
        const fontFamily = FONTS[font];
        const S = CANVAS_SIZE;
        const PAD = 108;
        ctx.clearRect(0, 0, S, S);
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, S, S);
        // accent border
                                       ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 4;
        ctx.strokeRect(24, 24, S - 48, S - 48);
        // title
                                       if (title) {
                                               ctx.fillStyle = colors.accent;
                                               ctx.font = `italic 48px ${fontFamily}`;
                                               ctx.textAlign = "center";
                                               ctx.fillText(title, S / 2, PAD + 10, S - PAD * 2);
                                             }
        // body text
                                       ctx.fillStyle = colors.text;
        ctx.font = `42px ${fontFamily}`;
        ctx.textAlign = "center";
        const maxWidth = S - PAD * 2;
        const lineH = 62;
        const snippetText = content.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim().slice(0, 400);
        const rawLines = snippetText.split(/\n|\\n/).flatMap(l => wrapText(ctx, l.trim(), maxWidth));
        const visibleLines = rawLines.slice(0, 12);
        const startY = title ? PAD + 90 : (S - visibleLines.length * lineH) / 2;
        visibleLines.forEach((line, i) => {
                ctx.fillText(line, S / 2, startY + i * lineH);
              });
        // watermark
                                       ctx.fillStyle = colors.accent;
        ctx.font = `28px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.fillText("the page gallery", S / 2, S - 60);
      }, [theme, font, content, title]);

  useEffect(() => {
        if (open) renderCanvas();
      }, [open, renderCanvas]);

  const handleDownload = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setDownloading(true);
        try {
                const url = canvas.toDataURL("image/png");
                const a = document.createElement("a");
                a.href = url;
                a.download = `${title ?? "poem"}-instagram-square.png`;
                a.click();
                logMutation.mutate({
                          writingId,
                          title,
                          contentSnippet: content.slice(0, 200),
                          theme,
                          fontChoice: font,
                        });
              } finally {
                setDownloading(false);
              }
      };

  return (
        <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl">
                          <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                                    <Instagram className="w-5 h-5" /> Instagram Square
                                                  </DialogTitle>
                                    </DialogHeader>
                          <div className="flex flex-col gap-4">
                                      <div className="flex gap-3 items-center flex-wrap">
                                                    <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-muted-foreground">Theme</span>
                                                                    <Select value={theme} onValueChange={(v) => { setTheme(v as ThemeKey); setTimeout(renderCanvas, 0); }}>
                                                                                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                                                                                      <SelectContent>
                                                                                                          {(Object.keys(THEMES) as ThemeKey[]).map(k => (
                              <SelectItem key={k} value={k}>{k}</SelectItem>
                            ))}
                                                                                                        </SelectContent>
                                                                                    </Select>
                                                                  </div>
                                                    <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-muted-foreground">Font</span>
                                                                    <Select value={font} onValueChange={(v) => { setFont(v as FontKey); setTimeout(renderCanvas, 0); }}>
                                                                                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                                                                                      <SelectContent>
                                                                                                          {(Object.keys(FONTS) as FontKey[]).map(k => (
                              <SelectItem key={k} value={k}>{k}</SelectItem>
                            ))}
                                                                                                        </SelectContent>
                                                                                    </Select>
                                                                  </div>
                                                  </div>
                                      <div className="flex justify-center overflow-auto rounded border">
                                                    <canvas
                                                                    ref={canvasRef}
                                                                    width={CANVAS_SIZE}
                                                                    height={CANVAS_SIZE}
                                                                    style={{ width: "100%", maxWidth: 480, aspectRatio: "1/1" }}
                                                                  />
                                                  </div>
                                      <Button onClick={handleDownload} disabled={downloading} className="w-full gap-2">
                                                    <Download className="w-4 h-4" />
                                                    {downloading ? "Preparing..." : "Download PNG (1080 x 1080)"}
                                                  </Button>
                                    </div>
                        </DialogContent>
              </Dialog>
      );
  }
