import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function EditorialReview() {
  const [response, setResponse] = useState("");
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: flags = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/editorial-letters"],
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, editorResponse, decision }: { id: string; editorResponse: string; decision: string }) => {
      const res = await fetch(`/api/editorial-letters/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editorResponse, decision }),
      });
      if (!res.ok) throw new Error("Failed to respond");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editorial-letters"] });
      setResponse("");
      setSelectedFlag(null);
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Editorial Review</h1>
      <p className="text-gray-600 mb-8">Review flagged writings and provide editorial feedback.</p>

      {isLoading && <p className="text-gray-400">Loading flags...</p>}

      <div className="space-y-4">
        {flags.map((f: any) => (
          <div key={f.id} className="bg-white rounded-lg shadow p-6 border">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">Writing #{f.writingId?.slice(0, 8)}</h3>
                <span className={`text-xs px-2 py-1 rounded ${
                  f.status === "flagged" ? "bg-yellow-100 text-yellow-700" :
                  f.status === "reviewed" ? "bg-green-100 text-green-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {f.status}
                </span>
                {f.isPaidFlag && <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 ml-2">Paid</span>}
              </div>
              <span className="text-xs text-gray-400">{new Date(f.createdAt).toLocaleDateString()}</span>
            </div>

            {f.editorResponse && (
              <div className="bg-gray-50 rounded p-3 mb-3">
                <p className="text-sm text-gray-600"><strong>Response:</strong> {f.editorResponse}</p>
                <p className="text-xs text-gray-400 mt-1">Decision: {f.decision}</p>
              </div>
            )}

            {f.status === "flagged" && (
              <div className="mt-4">
                {selectedFlag === f.id ? (
                  <div>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Write your editorial response..."
                      className="w-full p-3 border rounded mb-3"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => respondMutation.mutate({ id: f.id, editorResponse: response, decision: "accept" })}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => respondMutation.mutate({ id: f.id, editorResponse: response, decision: "revise" })}
                        className="bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700"
                      >
                        Request Revision
                      </button>
                      <button
                        onClick={() => respondMutation.mutate({ id: f.id, editorResponse: response, decision: "decline" })}
                        className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                      >
                        Decline
                      </button>
                      <button onClick={() => setSelectedFlag(null)} className="text-gray-500 text-sm ml-2">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedFlag(f.id)}
                    className="text-indigo-600 text-sm hover:text-indigo-800"
                  >
                    Review
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
