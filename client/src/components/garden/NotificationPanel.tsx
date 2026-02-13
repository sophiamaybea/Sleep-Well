import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Sprout, Sparkles, MessageCircle, Moon, Check, CheckCheck } from "lucide-react";

function timeAgo(date: string | Date | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type Notification = {
  id: string;
  type: string;
  actorName: string | null;
  message: string;
  writingId: string | null;
  isRead: boolean;
  createdAt: string;
};

const typeIcons: Record<string, typeof Bell> = {
  new_tender: Sprout,
  resonance: Sparkles,
  marginalia: MessageCircle,
  general: Bell,
};

export function NotificationBell({ onClick }: { onClick: () => void }) {
  const { data } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    queryFn: async () => {
      const res = await fetch("/api/notifications/unread-count", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch unread count");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const unreadCount = data?.count || 0;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className="relative p-2 text-white/40 hover:text-white/70 transition-colors"
      data-testid="button-notifications"
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1 right-1"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
        </motion.div>
      )}
    </motion.button>
  );
}

export default function NotificationPanel() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to mark read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/read-all", {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to mark all read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1
              className="text-3xl md:text-4xl font-display font-light tracking-tight italic text-white/90"
              data-testid="heading-notifications"
            >
              Whispers
            </h1>
          </div>
          {hasUnread && (
            <motion.button
              onClick={() => markAllReadMutation.mutate()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-white/60 hover:border-white/20 transition-all"
              data-testid="button-mark-all-read"
            >
              <CheckCheck size={12} />
              Mark all read
            </motion.button>
          )}
        </div>
      </motion.div>

      {isLoading && (
        <div className="text-center py-20">
          <Bell size={24} className="mx-auto text-white/35 animate-pulse mb-4" />
          <p className="font-mono text-xs text-white/40 tracking-widest uppercase">Loading whispers...</p>
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-dashed border-white/10 rounded-2xl p-16 text-center space-y-6"
        >
          <Moon size={40} className="mx-auto text-white/10" />
          <div className="space-y-2">
            <h3 className="text-2xl font-display font-light italic text-white/50">
              All quiet in the garden
            </h3>
            <p className="font-serif text-white/40 max-w-md mx-auto leading-relaxed">
              No whispers yet. When others interact with your work, you'll hear about it here.
            </p>
          </div>
        </motion.div>
      )}

      <div className="space-y-1">
        <AnimatePresence>
          {notifications.map((notification, i) => {
            const Icon = typeIcons[notification.type] || Bell;
            return (
              <motion.button
                key={notification.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                onClick={() => {
                  if (!notification.isRead) {
                    markReadMutation.mutate(notification.id);
                  }
                }}
                className={`w-full text-left rounded-xl p-4 transition-all duration-300 group relative ${
                  notification.isRead
                    ? "bg-transparent hover:bg-white/[0.02]"
                    : "bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
                data-testid={`notification-item-${notification.id}`}
              >
                {!notification.isRead && (
                  <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-amber-400/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
                )}
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                    notification.isRead
                      ? "border-white/[0.12] text-white/35"
                      : "border-amber-500/20 text-amber-400/60"
                  }`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {notification.actorName && (
                        <span className={`font-serif text-sm font-semibold ${notification.isRead ? "text-white/40" : "text-white/70"}`}>
                          {notification.actorName}
                        </span>
                      )}
                      <span className={`font-serif text-sm ${notification.isRead ? "text-white/40" : "text-white/45"}`}>
                        {notification.message}
                      </span>
                    </div>
                    <span className="font-mono text-[9px] text-white/30 mt-1 block">
                      {timeAgo(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.isRead && (
                    <div className="flex-shrink-0 mt-1">
                      <Check size={12} className="text-white/30 group-hover:text-white/30 transition-colors" />
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
