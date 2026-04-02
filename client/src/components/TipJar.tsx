import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

interface TipJarProps {
  recipientId: string;
  writingId?: string;
  recipientName: string;
}

const amounts = [1, 3, 5, 10];

export default function TipJar({ recipientId, writingId, recipientName }: TipJarProps) {
  const [amount, setAmount] = useState(3);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const tipMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId, writingId, amount, message }),
      });
      if (!res.ok) throw new Error("Failed to send tip");
      return res.json();
    },
    onSuccess: () => {
      setSent(true);
      setMessage("");
    },
  });

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-green-700 font-medium">Tip sent to {recipientName}!</p>
        <button onClick={() => setSent(false)} className="text-sm text-green-600 mt-2 underline">
          Send another
        </button>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <h4 className="font-semibold text-amber-900 mb-2">Leave a tip for {recipientName}</h4>
      <div className="flex gap-2 mb-3">
        {amounts.map((a) => (
          <button
            key={a}
            onClick={() => setAmount(a)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${amount === a ? "bg-amber-600 text-white" : "bg-white border border-amber-300 text-amber-700"}`}
          >
            ${a}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Add a message (optional)"
        className="w-full p-2 border rounded text-sm mb-3"
      />
      <button
        onClick={() => tipMutation.mutate()}
        disabled={tipMutation.isPending}
        className="w-full bg-amber-600 text-white py-2 rounded font-medium hover:bg-amber-700 disabled:opacity-50"
      >
        {tipMutation.isPending ? "Sending..." : `Send $${amount} Tip`}
      </button>
      {tipMutation.isError && (
        <p className="text-red-500 text-sm mt-2">Failed to send tip. Please try again.</p>
      )}
    </div>
  );
}
