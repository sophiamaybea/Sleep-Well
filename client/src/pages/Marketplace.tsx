import { useState, useEffect } from "react";
import { 
  useMarketplaceServices, 
  useCreateService, 
  useMyTipJar, 
  useUpsertTipJar, 
  useBookService,
  useCaptureBooking,
  useCaptureTip,
  useSendTip
} from "../hooks/useMarketplace";
import { useAuth } from "../hooks/use-auth";
import { useSearch } from "wouter";

function formatPrice(pence: number, currency = "gbp") {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: currency.toUpperCase() }).format(pence / 100);
}

function ServiceCard({ service, onBook, isBooking }: { service: any; onBook: (id: string) => void; isBooking: boolean }) {
  return (
    <div className="border border-border rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm">{service.title}</h3>
          <p className="text-xs text-muted-foreground">{service.serviceType?.replace(/_/g, " ")}</p>
        </div>
        <span className="text-sm font-medium text-primary shrink-0">{formatPrice(service.pricePence, service.currency)}</span>
      </div>
      {service.description && (
        <p className="text-xs text-muted-foreground line-clamp-3">{service.description}</p>
      )}
      <p className="text-xs text-muted-foreground">Delivery: {service.deliveryDays} days</p>
      <button
        onClick={() => onBook(service.id)}
        disabled={isBooking}
        className="w-full mt-1 rounded-md bg-primary text-primary-foreground text-xs py-1.5 px-3 hover:opacity-90 transition disabled:opacity-50"
      >
        {isBooking ? "Redirecting to PayPal..." : "Book this service"}
      </button>
    </div>
  );
}

function TipJarSection() {
  const { user } = useAuth();
  const { data: tipJar } = useMyTipJar();
  const upsert = useUpsertTipJar();
  const sendTip = useSendTip();
  const [msg, setMsg] = useState("");
  const [amount, setAmount] = useState(300);
  const [active, setActive] = useState(false);

  if (!user) return null;
  const jar = tipJar as any;

  function handleSave() {
    upsert.mutate({
      isActive: active,
      message: msg || jar?.message || "Buy me a coffee ☕",
      suggestedAmountPence: amount,
    });
  }

  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-sm">Your Tip Jar</h3>
      <p className="text-xs text-muted-foreground">Tips will be sent directly to your PayPal account once configured.</p>
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
        Enable tip jar
      </label>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Message</label>
        <input
          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
          value={msg || jar?.message || ""}
          onChange={e => setMsg(e.target.value)}
          placeholder="Buy me a coffee ☕"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Suggested amount (pence)</label>
        <input
          type="number"
          className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
        />
      </div>
      <button
        onClick={handleSave}
        disabled={upsert.isPending}
        className="w-full rounded-md bg-primary text-primary-foreground text-xs py-1.5 px-3 hover:opacity-90 transition"
      >
        {upsert.isPending ? "Saving..." : "Save tip jar"}
      </button>
    </div>
  );
}

function CreateServiceForm({ onDone }: { onDone: () => void }) {
  const create = useCreateService();
  const [form, setForm] = useState({
    title: "",
    description: "",
    serviceType: "manuscript_feedback",
    pricePence: 5000,
    deliveryDays: 7,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate(form, { onSuccess: onDone });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Title</label>
        <input required className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Service type</label>
        <select className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs" value={form.serviceType} onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))}>
          <option value="manuscript_feedback">Manuscript Feedback</option>
          <option value="line_editing">Line Editing</option>
          <option value="coaching">Coaching</option>
          <option value="workshop">Workshop</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Description</label>
        <textarea className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground block mb-1">Price (pence)</label>
          <input type="number" className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs" value={form.pricePence} onChange={e => setForm(f => ({ ...f, pricePence: Number(e.target.value) }))} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground block mb-1">Delivery (days)</label>
          <input type="number" className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs" value={form.deliveryDays} onChange={e => setForm(f => ({ ...f, deliveryDays: Number(e.target.value) }))} />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={create.isPending} className="flex-1 rounded-md bg-primary text-primary-foreground text-xs py-1.5 hover:opacity-90 transition">
          {create.isPending ? "Creating..." : "Create service"}
        </button>
        <button type="button" onClick={onDone} className="flex-1 rounded-md border border-border text-xs py-1.5 hover:opacity-70 transition">Cancel</button>
      </div>
    </form>
  );
}

export default function Marketplace() {
  const { user } = useAuth();
  const search = useSearch();
  const { data: services, isLoading } = useMarketplaceServices();
  const bookService = useBookService();
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<"browse" | "manage">("browse");
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const params = new URLSearchParams(search);
  const bookingId = params.get("bookingId");
  const success = params.get("success");
  const txId = params.get("txId");
  const tipSuccess = params.get("tipSuccess");

  const captureBooking = useCaptureBooking(bookingId || "");
  const captureTip = useCaptureTip(txId || "");

  useEffect(() => {
    if (success === "true" && bookingId) {
      setPaymentStatus("Capturing booking payment...");
      captureBooking.mutate(undefined, {
        onSuccess: () => setPaymentStatus("Payment successful! Your booking is confirmed."),
        onError: () => setPaymentStatus("Payment failed during capture. Please contact support.")
      });
    } else if (tipSuccess === "true" && txId) {
      setPaymentStatus("Capturing tip...");
      captureTip.mutate(undefined, {
        onSuccess: () => setPaymentStatus("Thank you for your tip!"),
        onError: () => setPaymentStatus("Failed to capture tip.")
      });
    }
  }, [success, bookingId, tipSuccess, txId]);

  const isWriter = user?.role === "writer" || user?.role === "editor" || user?.role === "admin";
  const allServices = (services as any[]) ?? [];

  function handleBook(serviceId: string) {
    if (!user) return;
    bookService.mutate({ serviceId }, {
      onSuccess: (data: any) => {
        if (data?.checkoutUrl) window.location.href = data.checkoutUrl;
      },
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {paymentStatus && (
        <div className="bg-primary/10 border border-primary/20 text-primary rounded-md p-4 text-sm font-medium">
          {paymentStatus}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold">Literary Marketplace</h1>
        <p className="text-sm text-muted-foreground mt-1">Discover services from writers and editors in the garden. Book feedback, coaching, workshops, and more via PayPal.</p>
      </div>

      {isWriter && (
        <div className="flex gap-2 border-b border-border pb-2">
          <button onClick={() => setTab("browse")} className={`text-sm px-3 py-1 rounded-md transition ${tab === "browse" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>Browse</button>
          <button onClick={() => setTab("manage")} className={`text-sm px-3 py-1 rounded-md transition ${tab === "manage" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>Manage my services</button>
        </div>
      )}

      {tab === "manage" && isWriter && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">My Services</h2>
            {!showCreate && (
              <button onClick={() => setShowCreate(true)} className="text-xs rounded-md bg-primary text-primary-foreground px-3 py-1.5 hover:opacity-90 transition">+ New service</button>
            )}
          </div>
          {showCreate && <CreateServiceForm onDone={() => setShowCreate(false)} />}
          <TipJarSection />
        </div>
      )}

      {tab === "browse" && (
        <div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading services...</p>
          ) : allServices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No services listed yet. Writers and editors can add services from the Manage tab.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allServices.map((s: any) => (
                <ServiceCard 
                  key={s.id} 
                  service={s} 
                  onBook={handleBook} 
                  isBooking={bookService.isPending && bookService.variables?.serviceId === s.id}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
