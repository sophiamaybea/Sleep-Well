interface Props {
  weave: {
    id: string;
    title: string;
    prompt?: string;
    form: string;
    status: string;
    isNationalPoetryDay: boolean;
    createdAt: string;
  };
  stanzaCount?: number;
  onClick?: () => void;
}

export function WeaveCard({ weave, stanzaCount = 0, onClick }: Props) {
  return (
    <div
      className="p-4 border rounded-lg cursor-pointer hover:border-foreground transition-colors space-y-2"
      onClick={onClick}
    >
      {weave.isNationalPoetryDay && (
        <span className="text-xs font-medium uppercase tracking-widest text-amber-600">
          National Poetry Day
        </span>
      )}
      <h3 className="font-serif text-base">{weave.title}</h3>
      {weave.prompt && (
        <p className="text-sm text-muted-foreground line-clamp-2 italic">{weave.prompt}</p>
      )}
      <div className="flex gap-3 text-xs text-muted-foreground">
        <span>{weave.form}</span>
        <span>·</span>
        <span>{stanzaCount} {stanzaCount === 1 ? "verse" : "verses"}</span>
        <span>·</span>
        <span className={weave.status === "open" ? "text-green-600" : "text-muted-foreground"}>
          {weave.status}
        </span>
      </div>
    </div>
  );
}
