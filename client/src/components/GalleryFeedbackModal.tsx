import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useGalleryFeedback } from "@/hooks/useGalleryFeedback";

interface Props {
  writingId: string;
  writingTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const PRICE = "£15";

export function GalleryFeedbackModal({
  writingId,
  writingTitle,
  isOpen,
  onClose,
}: Props) {
  const { createMutation, captureMutation, statusQuery } =
    useGalleryFeedback(writingId);
  const [step, setStep] = useState<"menu" | "checkout" | "success">("menu");

  if (!isOpen) return null;

  const hasPaid = Array.isArray(statusQuery.data)
    ? statusQuery.data.some((r: any) => r.paymentConfirmed)
    : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="bg-[#faf8f3] border border-[#d4c9b0] rounded-2xl shadow-xl max-w-md w-full mx-4 p-8"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {/* MENU */}
        {step === "menu" && (
          <>
            <h2 className="text-xl text-[#3d3228] mb-3">
              You're sending <em>{writingTitle}</em> to the Gallery
            </h2>
            <p className="text-sm text-[#7a6e5f] mb-6 leading-relaxed">
              Would you like one page of editorial feedback on this piece before
              it goes out? A close reading: what's alive in it, what could
              deepen, what to do next.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setStep("checkout")}
                className="w-full py-3 px-4 bg-[#3d3228] text-[#faf8f3] rounded-xl text-sm hover:bg-[#5a4a3a] transition-colors"
              >
                Yes — add editorial feedback {PRICE}
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 px-4 border border-[#d4c9b0] text-[#7a6e5f] rounded-xl text-sm hover:bg-[#f0ebe0] transition-colors"
              >
                Send to Gallery without feedback
              </button>
            </div>
            {hasPaid && (
              <p className="mt-4 text-xs text-[#7a6e5f] text-center">
                ✓ Feedback already purchased for this piece
              </p>
            )}
          </>
        )}

        {/* CHECKOUT */}
        {step === "checkout" && (
          <>
            <h2 className="text-xl text-[#3d3228] mb-3">
              Editorial Feedback — {PRICE}
            </h2>
            <p className="text-sm text-[#7a6e5f] mb-6 leading-relaxed">
              One page of close reading on <em>{writingTitle}</em>. Delivered to
              your Garden within 5–7 days.
            </p>
            <PayPalScriptProvider
              options={{
                clientId:
                  (import.meta as any).env?.VITE_PAYPAL_CLIENT_ID || "",
                currency: "GBP",
              }}
            >
              <PayPalButtons
                style={{
                  layout: "vertical",
                  color: "gold",
                  shape: "rect",
                  label: "pay",
                }}
                createOrder={async () => {
                  const { orderId } =
                    await createMutation.mutateAsync(writingId);
                  return orderId;
                }}
                onApprove={async (data) => {
                  await captureMutation.mutateAsync(data.orderID);
                  setStep("success");
                }}
                onError={(err) => {
                  console.error("PayPal error:", err);
                }}
              />
            </PayPalScriptProvider>
            <button
              onClick={() => setStep("menu")}
              className="mt-4 text-xs text-[#7a6e5f] underline w-full text-center"
            >
              ← Go back
            </button>
          </>
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <>
            <h2 className="text-xl text-[#3d3228] mb-3">Thank you ❖</h2>
            <p className="text-sm text-[#7a6e5f] leading-relaxed mb-6">
              Your piece is on its way to the Gallery, and your editorial
              feedback request has been received. You'll find the letter in your
              Garden within 5–7 days.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-[#3d3228] text-[#faf8f3] rounded-xl text-sm"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
