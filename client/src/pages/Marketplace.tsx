import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StarBackground from "@/components/StarBackground";
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

// ─── helpers ───────────────────────────────────────────────────────────────
function formatPrice(pence: number, currency = "gbp") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(pence / 100);
}

// ─── Scroll-reveal hook (Intersection Observer) ────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    const targets = document.querySelectorAll(".scroll-reveal");
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ─── Offer cards data ──────────────────────────────────────────────────────
const OFFER_CARDS = [
  {
    id: "feedback",
    icon: "✦",
    label: "Manuscript Feedback",
    tagline: "One reader who reads like an editor.",
    description:
      "Detailed written notes on structure, voice, pacing and line — from writers who know what it feels like to be lost inside a draft.",
    earn: "Writers charge £30–£250 depending on word count.",
    accent: "#c8a96e",
  },
  {
    id: "editing",
    icon: "◈",
    label: "Line Editing",
    tagline: "The sentence-level work that changes everything.",
    description:
      "Sentence-by-sentence close editing: rhythm, precision, syntax, and the places where the writing almost says what it means.",
    earn: "Writers charge £50–£400 per project.",
    accent: "#7a8fa6",
  },
  {
    id: "coaching",
    icon: "◉",
    label: "1:1 Coaching",
    tagline: "A conversation that moves the work forward.",
    description:
      "Hour-long sessions for writers who need a thinking partner — on a project in progress, on submission strategy, on what to write next.",
    earn: "Writers charge £60–£150 per session.",
    accent: "#a67c8f",
  },
  {
    id: "workshop",
    icon: "⬡",
    label: "Workshops",
    tagline: "A room — virtual or otherwise — for serious play.",
    description:
      "Group workshops built by practising writers: flash fiction, essays, poetry, hybrids. Live sessions or asynchronous packs.",
    earn: "Writers charge £15–£80 per seat.",
    accent: "#6b9e7a",
  },
  {
    id: "tipjar",
    icon: "♡",
    label: "Tip Jar",
    tagline: "For the work you gave away.",
    description:
      "Readers can leave a small contribution when a poem or essay meant something to them. No obligation — just an open hand.",
    earn: "Any amount. Fully controlled by the writer.",
    accent: "#c97a5e",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    n: "01",
    heading: "A writer lists a service",
    body: "Takes two minutes. Set your title, describe what you're offering, choose a price in pence, and decide how many days you need. You can edit or pause it any time.",
  },
  {
    n: "02",
    heading: "A reader or fellow writer books it",
    body: "Payment goes through Stripe Checkout — secure, familiar, no account required. The Page Gallery takes nothing right now. This is early days.",
  },
  {
    n: "03",
    heading: "You do the work, get paid",
    body: "Once the booking is captured, funds move to your connected account. We send you the details. You show up.",
  },
  {
    n: "04",
    heading: "Both parties come back",
    body: "The Marketplace lives inside the journal — the same writers publishing here are the ones offering services. Trust is built in.",
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────

function ServiceCard({
  service,
  onBook,
  isBooking,
}: {
  service: any;
  onBook: (id: string) => void;
  isBooking: boolean;
}) {
  return (
    <div className="mp-service-card scroll-reveal">
      <div className="mp-service-card__header">
        <div>
          <h3 className="mp-service-card__title">{service.title}</h3>
          <p className="mp-service-card__type">
            {service.serviceType?.replace(/_/g, " ")}
          </p>
        </div>
        <span className="mp-service-card__price">
          {formatPrice(service.pricePence, service.currency)}
        </span>
      </div>
      {service.description && (
        <p className="mp-service-card__desc">{service.description}</p>
      )}
      <p className="mp-service-card__delivery">
        Delivery: {service.deliveryDays} days
      </p>
      <button
        onClick={() => onBook(service.id)}
        disabled={isBooking}
        className="mp-service-card__btn"
      >
        {isBooking ? "Redirecting…" : "Book this service"}
      </button>
    </div>
  );
}

function TipJarSection() {
  const { user } = useAuth();
  const { data: tipJar } = useMyTipJar();
  const upsert = useUpsertTipJar();
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
    <div className="mp-tipjar scroll-reveal">
      <h3 className="mp-tipjar__heading">Your Tip Jar</h3>
      <p className="mp-tipjar__sub">
        Tips will be sent directly to your account once configured.
      </p>
      <label className="mp-tipjar__check-label">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        Enable tip jar
      </label>
      <div className="mp-tipjar__field">
        <label>Message</label>
        <input
          value={msg || jar?.message || ""}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Buy me a coffee ☕"
        />
      </div>
      <div className="mp-tipjar__field">
        <label>Suggested amount (pence)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>
      <button
        onClick={handleSave}
        disabled={upsert.isPending}
        className="mp-tipjar__btn"
      >
        {upsert.isPending ? "Saving…" : "Save tip jar"}
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
    <form onSubmit={handleSubmit} className="mp-create-form scroll-reveal">
      <div className="mp-create-form__field">
        <label>Title</label>
        <input
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
      </div>
      <div className="mp-create-form__field">
        <label>Service type</label>
        <select
          value={form.serviceType}
          onChange={(e) =>
            setForm((f) => ({ ...f, serviceType: e.target.value }))
          }
        >
          <option value="manuscript_feedback">Manuscript Feedback</option>
          <option value="line_editing">Line Editing</option>
          <option value="coaching">Coaching</option>
          <option value="workshop">Workshop</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="mp-create-form__field">
        <label>Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
      </div>
      <div className="mp-create-form__row">
        <div className="mp-create-form__field">
          <label>Price (pence)</label>
          <input
            type="number"
            value={form.pricePence}
            onChange={(e) =>
              setForm((f) => ({ ...f, pricePence: Number(e.target.value) }))
            }
          />
        </div>
        <div className="mp-create-form__field">
          <label>Delivery (days)</label>
          <input
            type="number"
            value={form.deliveryDays}
            onChange={(e) =>
              setForm((f) => ({ ...f, deliveryDays: Number(e.target.value) }))
            }
          />
        </div>
      </div>
      <div className="mp-create-form__actions">
        <button type="submit" disabled={create.isPending} className="mp-btn-primary">
          {create.isPending ? "Creating…" : "Create service"}
        </button>
        <button type="button" onClick={onDone} className="mp-btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function Marketplace() {
  const { user } = useAuth();
  const search = useSearch();
  const { data: services, isLoading } = useMarketplaceServices();
  const bookService = useBookService();
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<"browse" | "manage">("browse");
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const params = new URLSearchParams(search);
  const bookingId = params.get("bookingId");
  const success = params.get("success");
  const txId = params.get("txId");
  const tipSuccess = params.get("tipSuccess");
  const captureBooking = useCaptureBooking(bookingId || "");
  const captureTip = useCaptureTip(txId || "");

  useScrollReveal();

  // Parallax hero text on scroll
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    function handleScroll() {
      const y = window.scrollY;
      if (hero) {
        const eyebrow = hero.querySelector<HTMLElement>(".mp-hero__eyebrow");
        const heading = hero.querySelector<HTMLElement>(".mp-hero__heading");
        const sub = hero.querySelector<HTMLElement>(".mp-hero__sub");
        if (eyebrow) eyebrow.style.transform = `translateY(${y * 0.08}px)`;
        if (heading) heading.style.transform = `translateY(${y * 0.14}px)`;
        if (sub) sub.style.transform = `translateY(${y * 0.06}px)`;
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (success === "true" && bookingId) {
      setPaymentStatus("Capturing booking payment…");
      captureBooking.mutate(undefined, {
        onSuccess: () =>
          setPaymentStatus("Payment confirmed. Your booking is live."),
        onError: () =>
          setPaymentStatus(
            "Payment failed during capture. Please contact support."
          ),
      });
    } else if (tipSuccess === "true" && txId) {
      setPaymentStatus("Capturing tip…");
      captureTip.mutate(undefined, {
        onSuccess: () => setPaymentStatus("Thank you for your tip."),
        onError: () => setPaymentStatus("Failed to capture tip."),
      });
    }
  }, [success, bookingId, tipSuccess, txId]);

  const isWriter =
    user?.role === "writer" || user?.role === "editor" || user?.role === "admin";
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
    <>
      <style>{`
        /* ── MARKETPLACE CSS ── */

        /* ── Scroll reveal base state ── */
        .scroll-reveal {
          opacity: 0;
          clip-path: inset(12px 0 0 0);
          transition:
            opacity 0.72s cubic-bezier(0.16, 1, 0.3, 1),
            clip-path 0.72s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .scroll-reveal.revealed {
          opacity: 1;
          clip-path: inset(0 0 0 0);
        }
        @media (prefers-reduced-motion: reduce) {
          .scroll-reveal {
            opacity: 1 !important;
            clip-path: none !important;
            transition: none !important;
          }
        }

        /* ── stagger children ── */
        .scroll-stagger .scroll-reveal:nth-child(1) { transition-delay: 0ms; }
        .scroll-stagger .scroll-reveal:nth-child(2) { transition-delay: 60ms; }
        .scroll-stagger .scroll-reveal:nth-child(3) { transition-delay: 120ms; }
        .scroll-stagger .scroll-reveal:nth-child(4) { transition-delay: 180ms; }
        .scroll-stagger .scroll-reveal:nth-child(5) { transition-delay: 240ms; }

        /* ── Hero ── */
        .mp-hero {
          position: relative;
          min-height: clamp(420px, 56vh, 640px);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding-bottom: clamp(2.5rem, 5vw, 4rem);
          overflow: hidden;
          border-bottom: 1px solid oklch(from var(--color-text, #28251d) l c h / 0.08);
        }
        .mp-hero__bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 120%, oklch(0.72 0.04 60 / 0.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 10% 30%, oklch(0.75 0.03 220 / 0.10) 0%, transparent 60%);
          pointer-events: none;
        }
        .mp-hero__rule {
          position: absolute;
          top: 2.5rem;
          left: clamp(1.5rem, 5vw, 5rem);
          right: clamp(1.5rem, 5vw, 5rem);
          height: 1px;
          background: oklch(from var(--color-text, #28251d) l c h / 0.10);
        }
        .mp-hero__inner {
          position: relative;
          z-index: 1;
          max-width: var(--content-wide, 1200px);
          margin: 0 auto;
          padding: 0 clamp(1.5rem, 5vw, 5rem);
        }
        .mp-hero__eyebrow {
          font-size: clamp(0.7rem, 1.2vw, 0.8rem);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: oklch(from var(--color-text-muted, #7a7974) l c h / 0.75);
          margin-bottom: 1.2rem;
          font-family: var(--font-body, serif);
        }
        .mp-hero__heading {
          font-family: var(--font-display, Georgia, serif);
          font-size: clamp(2.4rem, 6vw, 5.2rem);
          line-height: 1.0;
          font-weight: 400;
          font-style: italic;
          color: var(--color-text, #28251d);
          max-width: 14ch;
          letter-spacing: -0.01em;
        }
        .mp-hero__heading em {
          font-style: normal;
          font-weight: 300;
          color: oklch(from var(--color-text, #28251d) l c h / 0.5);
        }
        .mp-hero__sub {
          margin-top: 1.6rem;
          font-family: var(--font-body, sans-serif);
          font-size: clamp(0.9rem, 1.4vw, 1.05rem);
          color: var(--color-text-muted, #7a7974);
          max-width: 52ch;
          line-height: 1.65;
        }
        .mp-hero__cta-row {
          margin-top: 2.2rem;
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          align-items: center;
        }

        /* ── Section scaffold ── */
        .mp-section {
          max-width: var(--content-wide, 1200px);
          margin: 0 auto;
          padding: clamp(3.5rem, 6vw, 6rem) clamp(1.5rem, 5vw, 5rem);
        }
        .mp-section--narrow {
          max-width: var(--content-default, 960px);
        }
        .mp-section-label {
          font-size: clamp(0.68rem, 1vw, 0.75rem);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: oklch(from var(--color-text-muted, #7a7974) l c h / 0.65);
          margin-bottom: 0.9rem;
          font-family: var(--font-body, sans-serif);
        }
        .mp-section-heading {
          font-family: var(--font-display, Georgia, serif);
          font-size: clamp(1.6rem, 3.5vw, 2.8rem);
          font-weight: 400;
          font-style: italic;
          line-height: 1.1;
          color: var(--color-text, #28251d);
          margin-bottom: clamp(0.8rem, 2vw, 1.2rem);
        }
        .mp-section-body {
          font-size: clamp(0.9rem, 1.4vw, 1.05rem);
          color: var(--color-text-muted, #7a7974);
          max-width: 60ch;
          line-height: 1.72;
          margin-bottom: 3rem;
        }

        /* ── Offer cards ── */
        .mp-offer-grid {
          display: grid;
          gap: clamp(1rem, 2vw, 1.5rem);
          grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
          margin-top: 2.5rem;
        }
        .mp-offer-card {
          background: var(--color-surface, #f9f8f5);
          border: 1px solid oklch(from var(--color-text, #28251d) l c h / 0.08);
          border-radius: 0.75rem;
          padding: clamp(1.4rem, 2.5vw, 2rem);
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          transition: box-shadow 0.22s cubic-bezier(0.16,1,0.3,1), transform 0.22s cubic-bezier(0.16,1,0.3,1);
        }
        .mp-offer-card:hover {
          box-shadow: 0 8px 28px oklch(0.2 0.01 80 / 0.09);
          transform: translateY(-2px);
        }
        .mp-offer-card__icon {
          font-size: 1.4rem;
          line-height: 1;
        }
        .mp-offer-card__label {
          font-family: var(--font-display, Georgia, serif);
          font-size: clamp(1rem, 1.6vw, 1.2rem);
          font-weight: 400;
          font-style: italic;
          color: var(--color-text, #28251d);
        }
        .mp-offer-card__tagline {
          font-size: clamp(0.72rem, 1.1vw, 0.82rem);
          letter-spacing: 0.06em;
          color: var(--color-text-muted, #7a7974);
          text-transform: uppercase;
        }
        .mp-offer-card__desc {
          font-size: clamp(0.85rem, 1.2vw, 0.95rem);
          color: var(--color-text-muted, #7a7974);
          line-height: 1.65;
          flex: 1;
        }
        .mp-offer-card__earn {
          font-size: clamp(0.78rem, 1.1vw, 0.87rem);
          padding: 0.5rem 0.75rem;
          border-radius: 0.4rem;
          background: oklch(from var(--color-text, #28251d) l c h / 0.04);
          color: var(--color-text, #28251d);
          font-family: var(--font-body, sans-serif);
          letter-spacing: 0.01em;
        }
        .mp-offer-card__accent-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 0.4rem;
          flex-shrink: 0;
          vertical-align: middle;
          position: relative;
          top: -1px;
        }

        /* ── How it works ── */
        .mp-hiw-grid {
          display: grid;
          gap: 1px;
          background: oklch(from var(--color-text, #28251d) l c h / 0.08);
          border: 1px solid oklch(from var(--color-text, #28251d) l c h / 0.08);
          border-radius: 0.75rem;
          overflow: hidden;
          margin-top: 2.5rem;
        }
        @media (min-width: 640px) {
          .mp-hiw-grid { grid-template-columns: 1fr 1fr; }
        }
        .mp-hiw-item {
          background: var(--color-surface, #f9f8f5);
          padding: clamp(1.6rem, 3vw, 2.4rem);
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .mp-hiw-item__n {
          font-size: clamp(2rem, 4vw, 3rem);
          font-family: var(--font-display, Georgia, serif);
          font-weight: 300;
          color: oklch(from var(--color-text, #28251d) l c h / 0.15);
          line-height: 1;
          margin-bottom: 0.2rem;
        }
        .mp-hiw-item__heading {
          font-family: var(--font-display, Georgia, serif);
          font-size: clamp(0.95rem, 1.6vw, 1.15rem);
          font-style: italic;
          color: var(--color-text, #28251d);
          line-height: 1.25;
        }
        .mp-hiw-item__body {
          font-size: clamp(0.82rem, 1.1vw, 0.92rem);
          color: var(--color-text-muted, #7a7974);
          line-height: 1.65;
        }

        /* ── Browse / service grid ── */
        .mp-services-grid {
          display: grid;
          gap: clamp(1rem, 2vw, 1.4rem);
          grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
        }
        .mp-service-card {
          background: var(--color-surface, #f9f8f5);
          border: 1px solid oklch(from var(--color-text, #28251d) l c h / 0.09);
          border-radius: 0.65rem;
          padding: 1.4rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          transition: box-shadow 0.2s cubic-bezier(0.16,1,0.3,1);
        }
        .mp-service-card:hover { box-shadow: 0 4px 20px oklch(0.2 0.01 80 / 0.08); }
        .mp-service-card__header { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; }
        .mp-service-card__title { font-family: var(--font-display, Georgia, serif); font-size: 1rem; font-style: italic; color: var(--color-text, #28251d); }
        .mp-service-card__type { font-size: 0.75rem; color: var(--color-text-muted, #7a7974); text-transform: capitalize; margin-top: 0.15rem; }
        .mp-service-card__price { font-size: 0.9rem; font-weight: 500; color: var(--color-text, #28251d); white-space: nowrap; }
        .mp-service-card__desc { font-size: 0.83rem; color: var(--color-text-muted, #7a7974); line-height: 1.6; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .mp-service-card__delivery { font-size: 0.75rem; color: var(--color-text-muted, #7a7974); }
        .mp-service-card__btn { margin-top: 0.25rem; width: 100%; padding: 0.6rem 1rem; border-radius: 0.4rem; font-size: 0.8rem; background: var(--color-text, #28251d); color: var(--color-bg, #FAF8F4); cursor: pointer; transition: opacity 0.18s; border: none; }
        .mp-service-card__btn:hover:not(:disabled) { opacity: 0.85; }
        .mp-service-card__btn:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── Tabs ── */
        .mp-tabs { display: flex; gap: 0.4rem; border-bottom: 1px solid oklch(from var(--color-text, #28251d) l c h / 0.09); padding-bottom: 0.25rem; margin-bottom: 2rem; }
        .mp-tab { font-size: 0.85rem; padding: 0.4rem 0.9rem; border-radius: 0.375rem; transition: background 0.18s, color 0.18s; border: none; cursor: pointer; color: var(--color-text-muted, #7a7974); background: none; }
        .mp-tab--active { background: var(--color-text, #28251d); color: var(--color-bg, #FAF8F4); }
        .mp-tab:not(.mp-tab--active):hover { background: oklch(from var(--color-text, #28251d) l c h / 0.06); color: var(--color-text, #28251d); }

        /* ── Buttons ── */
        .mp-btn-primary {
          padding: 0.65rem 1.4rem; border-radius: 0.45rem; font-size: 0.85rem;
          background: var(--color-text, #28251d); color: var(--color-bg, #FAF8F4);
          border: none; cursor: pointer; transition: opacity 0.18s;
          font-family: var(--font-body, sans-serif);
        }
        .mp-btn-primary:hover:not(:disabled) { opacity: 0.82; }
        .mp-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
        .mp-btn-ghost {
          padding: 0.65rem 1.4rem; border-radius: 0.45rem; font-size: 0.85rem;
          background: none; color: var(--color-text-muted, #7a7974);
          border: 1px solid oklch(from var(--color-text, #28251d) l c h / 0.15);
          cursor: pointer; transition: border-color 0.18s, color 0.18s;
          font-family: var(--font-body, sans-serif);
        }
        .mp-btn-ghost:hover { border-color: oklch(from var(--color-text, #28251d) l c h / 0.35); color: var(--color-text, #28251d); }
        .mp-btn-outline-sm {
          padding: 0.45rem 1rem; border-radius: 0.375rem; font-size: 0.78rem;
          background: none; color: var(--color-text, #28251d);
          border: 1px solid oklch(from var(--color-text, #28251d) l c h / 0.18);
          cursor: pointer; transition: background 0.18s, border-color 0.18s;
          font-family: var(--font-body, sans-serif);
        }
        .mp-btn-outline-sm:hover { background: oklch(from var(--color-text, #28251d) l c h / 0.05); }

        /* ── Tip jar ── */
        .mp-tipjar { background: var(--color-surface, #f9f8f5); border: 1px solid oklch(from var(--color-text, #28251d) l c h / 0.09); border-radius: 0.65rem; padding: 1.6rem; display: flex; flex-direction: column; gap: 0.9rem; }
        .mp-tipjar__heading { font-family: var(--font-display, Georgia, serif); font-size: 1.05rem; font-style: italic; color: var(--color-text, #28251d); }
        .mp-tipjar__sub { font-size: 0.82rem; color: var(--color-text-muted, #7a7974); line-height: 1.6; }
        .mp-tipjar__check-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--color-text, #28251d); cursor: pointer; }
        .mp-tipjar__field { display: flex; flex-direction: column; gap: 0.3rem; }
        .mp-tipjar__field label { font-size: 0.75rem; color: var(--color-text-muted, #7a7974); }
        .mp-tipjar__field input { border: 1px solid oklch(from var(--color-text, #28251d) l c h / 0.18); border-radius: 0.375rem; background: var(--color-bg, #FAF8F4); padding: 0.45rem 0.65rem; font-size: 0.82rem; color: var(--color-text, #28251d); outline: none; transition: border-color 0.18s; }
        .mp-tipjar__field input:focus { border-color: oklch(from var(--color-text, #28251d) l c h / 0.45); }
        .mp-tipjar__btn { padding: 0.6rem 1.2rem; border-radius: 0.4rem; font-size: 0.82rem; background: var(--color-text, #28251d); color: var(--color-bg, #FAF8F4); border: none; cursor: pointer; transition: opacity 0.18s; }
        .mp-tipjar__btn:hover:not(:disabled) { opacity: 0.82; }
        .mp-tipjar__btn:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── Create form ── */
        .mp-create-form { background: var(--color-surface, #f9f8f5); border: 1px solid oklch(from var(--color-text, #28251d) l c h / 0.09); border-radius: 0.65rem; padding: 1.6rem; display: flex; flex-direction: column; gap: 1rem; }
        .mp-create-form__field { display: flex; flex-direction: column; gap: 0.3rem; }
        .mp-create-form__field label { font-size: 0.75rem; color: var(--color-text-muted, #7a7974); }
        .mp-create-form__field input, .mp-create-form__field select, .mp-create-form__field textarea {
          border: 1px solid oklch(from var(--color-text, #28251d) l c h / 0.18);
          border-radius: 0.375rem; background: var(--color-bg, #FAF8F4);
          padding: 0.45rem 0.65rem; font-size: 0.82rem; color: var(--color-text, #28251d);
          outline: none; transition: border-color 0.18s; resize: vertical;
          font-family: var(--font-body, sans-serif);
        }
        .mp-create-form__field input:focus, .mp-create-form__field select:focus, .mp-create-form__field textarea:focus { border-color: oklch(from var(--color-text, #28251d) l c h / 0.45); }
        .mp-create-form__row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .mp-create-form__actions { display: flex; gap: 0.6rem; }

        /* ── Manage section heading row ── */
        .mp-manage-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
        .mp-manage-header h2 { font-family: var(--font-display, Georgia, serif); font-size: 1rem; font-style: italic; color: var(--color-text, #28251d); }

        /* ── Payment notice ── */
        .mp-payment-notice { background: oklch(from var(--color-text, #28251d) l c h / 0.05); border: 1px solid oklch(from var(--color-text, #28251d) l c h / 0.12); border-radius: 0.5rem; padding: 0.9rem 1.2rem; font-size: 0.85rem; color: var(--color-text, #28251d); font-weight: 500; margin-bottom: 1.5rem; }

        /* ── Divider rule ── */
        .mp-rule { height: 1px; background: oklch(from var(--color-text, #28251d) l c h / 0.08); margin: 0 clamp(1.5rem, 5vw, 5rem); }

        /* ── Empty state ── */
        .mp-empty { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 4rem 2rem; color: var(--color-text-muted, #7a7974); gap: 0.75rem; }
        .mp-empty__icon { font-size: 2rem; opacity: 0.35; }
        .mp-empty__heading { font-family: var(--font-display, Georgia, serif); font-style: italic; font-size: 1.1rem; color: var(--color-text, #28251d); }
        .mp-empty__body { font-size: 0.87rem; max-width: 38ch; line-height: 1.6; }

        /* ── Footer note ── */
        .mp-footnote {
          text-align: center;
          padding: clamp(2rem, 4vw, 3.5rem) clamp(1.5rem, 5vw, 5rem);
          font-size: clamp(0.78rem, 1.1vw, 0.87rem);
          color: oklch(from var(--color-text-muted, #7a7974) l c h / 0.7);
          font-family: var(--font-body, sans-serif);
          line-height: 1.7;
          border-top: 1px solid oklch(from var(--color-text, #28251d) l c h / 0.07);
        }
        .mp-footnote strong { color: var(--color-text, #28251d); font-weight: 500; }

        /* ── Loading skeleton ── */
        @keyframes mp-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .mp-skeleton {
          background: linear-gradient(
            90deg,
            var(--color-surface, #f9f8f5) 25%,
            var(--color-surface-dynamic, #e6e4df) 50%,
            var(--color-surface, #f9f8f5) 75%
          );
          background-size: 200% 100%;
          animation: mp-shimmer 1.5s ease-in-out infinite;
          border-radius: 0.65rem;
          height: 160px;
        }
      `}</style>

      <div className="min-h-screen" style={{ background: "var(--color-bg, #FAF8F4)", color: "var(--color-text, #28251d)" }}>
        <StarBackground />
        <Navigation />

        <main className="relative z-10">

          {/* ── HERO ─────────────────────────────────────── */}
          <section className="mp-hero" ref={heroRef} aria-label="Marketplace introduction">
            <div className="mp-hero__bg" aria-hidden="true" />
            <div className="mp-hero__rule" aria-hidden="true" />
            <div className="mp-hero__inner">
              <p className="mp-hero__eyebrow scroll-reveal">The Page Gallery — Marketplace</p>
              <h1 className="mp-hero__heading scroll-reveal">
                Work that earns<br /><em>what it's worth.</em>
              </h1>
              <p className="mp-hero__sub scroll-reveal">
                A place for writers to offer what they know — editing, feedback,
                coaching, workshops — and to receive it. Built into the journal,
                not bolted on.
              </p>
              <div className="mp-hero__cta-row scroll-reveal">
                <a href="#marketplace-main" className="mp-btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
                  Browse services
                </a>
                {isWriter && (
                  <button
                    className="mp-btn-ghost"
                    onClick={() => {
                      setTab("manage");
                      document.getElementById("marketplace-main")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    List a service
                  </button>
                )}
              </div>
            </div>
          </section>

          <div className="mp-rule" />

          {/* ── WHAT'S ON OFFER ──────────────────────────── */}
          <section className="mp-section" aria-label="What's on offer">
            <p className="mp-section-label scroll-reveal">What we offer</p>
            <h2 className="mp-section-heading scroll-reveal">Five ways writers earn here.</h2>
            <p className="mp-section-body scroll-reveal">
              None of these require an agent, a publisher, or a platform. Just
              your expertise, offered plainly, to people who need it.
            </p>
            <div className="mp-offer-grid scroll-stagger">
              {OFFER_CARDS.map((card) => (
                <article key={card.id} className="mp-offer-card scroll-reveal">
                  <span className="mp-offer-card__icon" aria-hidden="true" style={{ color: card.accent }}>
                    {card.icon}
                  </span>
                  <h3 className="mp-offer-card__label">{card.label}</h3>
                  <p className="mp-offer-card__tagline">{card.tagline}</p>
                  <p className="mp-offer-card__desc">{card.description}</p>
                  <p className="mp-offer-card__earn">
                    <span
                      className="mp-offer-card__accent-dot"
                      aria-hidden="true"
                      style={{ background: card.accent }}
                    />
                    {card.earn}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <div className="mp-rule" />

          {/* ── HOW IT WORKS ─────────────────────────────── */}
          <section className="mp-section mp-section--narrow" aria-label="How it works">
            <p className="mp-section-label scroll-reveal">How it works</p>
            <h2 className="mp-section-heading scroll-reveal">Four steps. No middleman.</h2>
            <div className="mp-hiw-grid scroll-stagger">
              {HOW_IT_WORKS_STEPS.map((step) => (
                <div key={step.n} className="mp-hiw-item scroll-reveal">
                  <p className="mp-hiw-item__n" aria-hidden="true">{step.n}</p>
                  <h3 className="mp-hiw-item__heading">{step.heading}</h3>
                  <p className="mp-hiw-item__body">{step.body}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mp-rule" />

          {/* ── BROWSE / MANAGE ──────────────────────────── */}
          <section
            className="mp-section"
            id="marketplace-main"
            aria-label="Browse and manage services"
          >
            {paymentStatus && (
              <div className="mp-payment-notice scroll-reveal" role="status">
                {paymentStatus}
              </div>
            )}

            {isWriter && (
              <div className="mp-tabs" role="tablist">
                <button
                  role="tab"
                  aria-selected={tab === "browse"}
                  className={`mp-tab${tab === "browse" ? " mp-tab--active" : ""}`}
                  onClick={() => setTab("browse")}
                >
                  Browse services
                </button>
                <button
                  role="tab"
                  aria-selected={tab === "manage"}
                  className={`mp-tab${tab === "manage" ? " mp-tab--active" : ""}`}
                  onClick={() => setTab("manage")}
                >
                  Manage my services
                </button>
              </div>
            )}

            {/* ── Manage ── */}
            {tab === "manage" && isWriter && (
              <div>
                <div className="mp-manage-header">
                  <h2>My services</h2>
                  {!showCreate && (
                    <button
                      className="mp-btn-outline-sm"
                      onClick={() => setShowCreate(true)}
                    >
                      + New service
                    </button>
                  )}
                </div>
                {showCreate && (
                  <CreateServiceForm onDone={() => setShowCreate(false)} />
                )}
                <div style={{ marginTop: "1.5rem" }}>
                  <TipJarSection />
                </div>
              </div>
            )}

            {/* ── Browse ── */}
            {tab === "browse" && (
              <div>
                {isLoading ? (
                  <div className="mp-services-grid">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="mp-skeleton" />
                    ))}
                  </div>
                ) : allServices.length === 0 ? (
                  <div className="mp-empty scroll-reveal">
                    <span className="mp-empty__icon" aria-hidden="true">◈</span>
                    <h3 className="mp-empty__heading">No services listed yet.</h3>
                    <p className="mp-empty__body">
                      Check back soon — or if you're a writer, be the first to list something.
                    </p>
                    {isWriter && (
                      <button
                        className="mp-btn-primary"
                        style={{ marginTop: "1rem" }}
                        onClick={() => setTab("manage")}
                      >
                        List a service
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="mp-services-grid scroll-stagger">
                    {allServices.map((s: any) => (
                      <ServiceCard
                        key={s.id}
                        service={s}
                        onBook={handleBook}
                        isBooking={
                          bookService.isPending &&
                          bookService.variables?.serviceId === s.id
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ── FOOTNOTE ─────────────────────────────────── */}
          <p className="mp-footnote scroll-reveal">
            <strong>The Page Gallery takes no cut right now.</strong> We're in early days.
            Payment processing is via Stripe. Writers set their own prices, keep their earnings,
            and build their own practice — here, in the same place their work lives.
          </p>

        </main>

        <Footer />
      </div>
    </>
  );
}
