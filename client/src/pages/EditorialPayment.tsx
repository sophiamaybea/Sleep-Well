import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function EditorialPayment() {
  const searchString = useSearch();
  const token = new URLSearchParams(searchString).get("token");
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid payment link.");
      setLoading(false);
      return;
    }
    fetch(`/api/editorial-waitlist/payment/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setEntry(data);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load."); setLoading(false); });
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0908] flex items-center justify-center">
      <p className="text-[#e8e0d4] font-serif">Loading...</p>
    </div>
  );

  if (error || !entry) return (
    <div className="min-h-screen bg-[#0a0908] flex items-center justify-center">
      <p className="text-red-400 font-serif">{error || "Not found."}</p>
    </div>
  );

  if (paid || entry.status === "paid") return (
    <div className="min-h-screen bg-[#0a0908] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-serif text-[#e8e0d4] mb-4">Payment Confirmed</h1>
        <p className="text-[#8a8078] font-serif">Thank you. Your editorial feedback is being prepared.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0908] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-serif text-[#e8e0d4] mb-2 text-center">Editorial Feedback Payment</h1>
        <p className="text-[#8a8078] font-serif text-center mb-6">
          Amount: <span className="text-[#e8e0d4] font-bold">&pound;{entry.quotedPrice}</span>
        </p>
        <div className="bg-[#1a1815] border border-[#2a2520] rounded-lg p-6">
          <PayPalScriptProvider options={{ clientId: entry.paypalClientId, currency: "GBP" }}>
            <PayPalButtons
              style={{ layout: "vertical", color: "gold", shape: "rect" }}
              createOrder={async () => {
                const res = await fetch("/api/paypal/create-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ waitlistId: entry.id, amount: entry.quotedPrice }),
                });
                const data = await res.json();
                return data.id;
              }}
              onApprove={async (data: any) => {
                await fetch("/api/paypal/capture-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId: data.orderID, waitlistId: entry.id }),
                });
                setPaid(true);
              }}
              onError={() => setError("Payment failed. Please try again.")}
            />
          </PayPalScriptProvider>
        </div>
      </div>
    </div>
  );
}
