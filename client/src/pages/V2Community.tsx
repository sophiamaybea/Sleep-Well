import V2Layout from "@/components/V2Layout";
import { Users, Calendar, MessageCircle } from "lucide-react";

interface Circle {
  id: number;
  name: string;
  description: string;
  members: number;
  nextMeeting?: string;
  isJoined: boolean;
}

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  type: string;
  attendees: number;
}

export default function V2Community() {
  const circles: Circle[] = [
    { id: 1, name: "Grief & Growing", description: "A quiet space for writing through loss", members: 24, nextMeeting: "Thursday 7pm", isJoined: true },
    { id: 2, name: "Morning Pages", description: "Daily freewriting practice, no editing", members: 41, nextMeeting: "Daily 8am", isJoined: true },
    { id: 3, name: "Poetry Workshop", description: "Weekly feedback circle for poets", members: 18, nextMeeting: "Saturday 2pm", isJoined: false },
    { id: 4, name: "Memoir Collective", description: "Long-form memory work and support", members: 12, isJoined: false },
    { id: 5, name: "Flash Fiction Lab", description: "Under 1000 words, sharp and vivid", members: 29, nextMeeting: "Wednesday 6pm", isJoined: false },
  ];

  const events: Event[] = [
    { id: 1, title: "Open Mic: Spring Equinox", date: "Mar 20", time: "7pm GMT", type: "LIVE", attendees: 34 },
    { id: 2, title: "Craft Talk: The Fragment as Form", date: "Mar 22", time: "3pm GMT", type: "WORKSHOP", attendees: 19 },
    { id: 3, title: "Editor Q&A with Morgan M.", date: "Mar 25", time: "5pm GMT", type: "Q&A", attendees: 27 },
  ];

  const eventBadge = (type: string) => {
    switch (type) {
      case "LIVE": return "bg-red-900/40 text-red-300";
      case "WORKSHOP": return "bg-amber-900/40 text-amber-300";
      case "Q&A": return "bg-blue-900/40 text-blue-300";
      default: return "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]";
    }
  };

  return (
    <V2Layout activeTab="community">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Circles - 2 cols */}
          <div className="col-span-2">
            <h2 className="font-display text-xl mb-6 flex items-center gap-2">
              <Users size={20} className="text-[var(--color-accent)]" />
              Writing Circles
            </h2>
            <div className="space-y-3">
              {circles.map((circle) => (
                <div
                  key={circle.id}
                  className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-accent)] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium">{circle.name}</h3>
                        {circle.isJoined && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-900/40 text-emerald-300">Joined</span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--color-muted-foreground)] mb-2">{circle.description}</p>
                      <div className="flex items-center gap-4 text-xs text-[var(--color-muted-foreground)]">
                        <span className="flex items-center gap-1"><Users size={12} /> {circle.members} members</span>
                        {circle.nextMeeting && (
                          <span className="flex items-center gap-1"><Calendar size={12} /> {circle.nextMeeting}</span>
                        )}
                      </div>
                    </div>
                    {!circle.isJoined && (
                      <button className="px-4 py-1.5 text-sm border border-[var(--color-border)] rounded-full text-[var(--color-muted-foreground)] hover:border-[var(--color-accent)] hover:text-[var(--color-foreground)] transition-colors">
                        Join
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events - 1 col */}
          <div>
            <h2 className="font-display text-xl mb-6 flex items-center gap-2">
              <Calendar size={20} className="text-[var(--color-accent)]" />
              Upcoming Events
            </h2>
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-accent)] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider ${eventBadge(event.type)}`}>
                      {event.type}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm mb-1">{event.title}</h3>
                  <div className="text-xs text-[var(--color-muted-foreground)]">
                    {event.date} at {event.time} &middot; {event.attendees} attending
                  </div>
                </div>
              ))}
            </div>

            {/* Community Activity */}
            <h3 className="font-display text-lg mt-8 mb-4 flex items-center gap-2">
              <MessageCircle size={18} className="text-[var(--color-accent)]" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                { user: "Maia O.", action: "shared a new piece in", target: "Grief & Growing", time: "2h ago" },
                { user: "Soren K.", action: "joined", target: "Poetry Workshop", time: "4h ago" },
                { user: "Eleanor C.", action: "commented on your piece in", target: "Morning Pages", time: "yesterday" },
              ].map((activity, i) => (
                <div key={i} className="text-sm text-[var(--color-muted-foreground)]">
                  <span className="text-[var(--color-foreground)] font-medium">{activity.user}</span>{" "}
                  {activity.action}{" "}
                  <span className="text-[var(--color-accent)]">{activity.target}</span>
                  <div className="text-xs mt-0.5">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </V2Layout>
  );
}