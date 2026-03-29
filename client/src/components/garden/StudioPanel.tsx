import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Search, X, MessageCircle, FileText, TrendingUp, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface Insight {
  id: string;
  summary: string;
  insightType: string;
  sourceWritingIds: string[];
  patternData: any;
  status: string;
  createdAt: string;
}

export default function StudioPanel() {
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(false);

  const { data: insights = [] } = useQuery<Insight[]>({
    queryKey: ["/api/agent/patterns"],
  });

  const scanMutation = useMutation({
    mutationFn: async () => {
      setIsScanning(true);
      const res = await apiRequest("POST", "/api/agent/patterns/scan");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent/patterns"] });
      setIsScanning(false);
      if (data.data?.insight) {
        toast({ title: "Analysis Complete", description: "The Pattern Spotter found new insights." });
      } else {
        toast({ title: "Analysis Complete", description: data.message || "No new patterns found." });
      }
    },
    onError: () => {
      setIsScanning(false);
      toast({ title: "Analysis Failed", variant: "destructive" });
    }
  });

  const dismissMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/agent/patterns/${id}/dismiss`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent/patterns"] });
    }
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 mb-3">
          <Brain size={18} className="text-violet-400/60" />
          <h2 className="font-display text-2xl font-light italic text-white/90">Native Studio</h2>
        </div>
        <p className="font-serif text-sm text-white/45 max-w-md mx-auto leading-relaxed">
          Your private space for AI-assisted reflection. Here, local agents scan your work for recurring themes and hidden patterns.
        </p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => scanMutation.mutate()}
          disabled={isScanning}
          className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all ${
            isScanning 
              ? "border-violet-500/20 bg-violet-500/5 text-violet-300/40 cursor-wait"
              : "border-violet-500/30 bg-violet-500/10 text-violet-300/80 hover:bg-violet-500/20"
          } font-mono text-[10px] uppercase tracking-widest`}
        >
          {isScanning ? (
            <Zap size={14} className="animate-pulse" />
          ) : (
            <Search size={14} />
          )}
          {isScanning ? "Agents Scanning..." : "Run Pattern Analysis"}
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="font-mono text-[9px] uppercase tracking-[0.3em] text-violet-300/50 mb-3 flex items-center gap-2">
          <TrendingUp size={12} />
          Agent Insights
        </h3>

        <AnimatePresence mode="popLayout">
          {insights.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 border border-dashed border-violet-500/15 rounded-3xl"
            >
              <MessageCircle size={32} className="mx-auto text-violet-500/20 mb-4" />
              <p className="font-serif text-sm text-white/30 italic">No active insights yet. Run a scan to see what your agents find.</p>
            </motion.div>
          ) : (
            insights.map((insight) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative p-6 rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] hover:bg-violet-500/[0.05] transition-all"
              >
                <button
                  onClick={() => dismissMutation.mutate(insight.id)}
                  className="absolute top-4 right-4 text-white/20 hover:text-white/60 transition-colors"
                >
                  <X size={14} />
                </button>
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <Sparkles size={14} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="font-serif text-sm text-white/80 leading-relaxed">
                      {insight.summary}
                    </p>
                    {insight.patternData?.themes && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {insight.patternData.themes.slice(0, 5).map((t: any) => (
                          <span key={t.word} className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 font-mono text-[8px] text-violet-300/60">
                            {t.word} ({t.count})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
