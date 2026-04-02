import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Pollinations() {
  const [writingId, setWritingId] = useState("");
  const [affirmation, setAffirmation] = useState("");
  const [highlightText, setHighlightText] = useState("");
  const queryClient = useQueryClient();

  const { data: pollinations = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/pollinations"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/pollinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writingId, affirmation, highlightText: highlightText || undefined }),
      });
      if (!res.ok) throw new Error("Failed to send pollination");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pollinations"] });
      setWritingId("");
      setAffirmation("");
      setHighlightText("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/pollinations/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/pollinations"] }),
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Pollinations</h1>
      <p className="text-gray-600 mb-8">Send affirmations and highlight favourite lines from others' writings.</p>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Send a Pollination</h2>
        <input
          value={writingId}
          onChange={(e) => setWritingId(e.target.value)}
          placeholder="Writing ID"
          className="w-full p-3 border rounded mb-3"
        />
        <textarea
          value={affirmation}
          onChange={(e) => setAffirmation(e.target.value)}
          placeholder="Your affirmation..."
          className="w-full p-3 border rounded mb-3"
          rows={2}
        />
        <input
          value={highlightText}
          onChange={(e) => setHighlightText(e.target.value)}
          placeholder="Highlighted text (optional)"
          className="w-full p-3 border rounded mb-3"
        />
        <button
          onClick={() => createMutation.mutate()}
          disabled={!writingId.trim() || !affirmation.trim() || createMutation.isPending}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          Send Pollination
        </button>
      </div>

      {isLoading && <p className="text-gray-400">Loading pollinations...</p>}
      <div className="space-y-4">
        {pollinations.map((p: any) => (
          <div key={p.id} className="bg-white rounded-lg shadow p-4 border">
            {p.highlightText && (
              <blockquote className="border-l-4 border-indigo-300 pl-3 mb-2 italic text-gray-600">
                "{p.highlightText}"
              </blockquote>
            )}
            <p className="text-gray-800">{p.affirmation}</p>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
              <button onClick={() => deleteMutation.mutate(p.id)} className="text-red-500 text-sm hover:text-red-700">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
