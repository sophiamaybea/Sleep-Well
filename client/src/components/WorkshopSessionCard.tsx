interface Session {
  id: string;
  title: string;
  description: string;
  theme?: string | null;
  status: string;
  tierRequired: string;
  scheduledAt?: string | null;
  participantCount?: number;
}

interface Props {
  session: Session;
  onOpen: () => void;
}

export default function WorkshopSessionCard({ session, onOpen }: Props) {
  const statusLabel: Record<string, string> = {
    upcoming: "Upcoming",
    live: "Live now",
    closed: "Closed",
  };

  const statusColour: Record<string, string> = {
    upcoming: "text-amber-600",
    live: "text-green-600",
    closed: "text-muted-foreground",
  };

  const formatted = session.scheduledAt
    ? new Date(session.scheduledAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="border border-border rounded-md p-5 hover:border-gold/50 transition cursor-pointer group"
         onClick={onOpen}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium ${statusColour[session.status] ?? "text-muted-foreground"}`}>
              {statusLabel[session.status] ?? session.status}
            </span>
            {session.tierRequired === "cultivator" && (
              <span className="text-xs px-1.5 py-0.5 bg-gold/10 text-gold border border-gold/30 rounded">
                Cultivator
              </span>
            )}
          </div>
          <h3 className="font-serif text-base group-hover:text-gold transition">{session.title}</h3>
          {session.theme && (
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-0.5">{session.theme}</p>
          )}
          {session.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{session.description}</p>
          )}
        </div>
        <div className="text-right text-xs text-muted-foreground shrink-0">
          {formatted && <p>{formatted}</p>}
          {typeof session.participantCount === "number" && (
            <p className="mt-1">{session.participantCount} joined</p>
          )}
        </div>
      </div>
    </div>
  );
}
