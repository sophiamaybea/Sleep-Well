import { useState, useEffect, useCallback } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Leaf,
  Shield,
  Menu,
  X,
  Printer,
  ArrowLeft,
  Home,
} from "lucide-react";

const STORAGE_KEY = "garden-guide-chapter";

const defaultChapters = [
  { number: 1, title: "Welcome" },
  { number: 2, title: "Finding Your Way Around" },
  { number: 3, title: "Your Garden — The Five Rooms" },
  { number: 4, title: "Understanding the Botanical Language" },
  { number: 5, title: "Writing Your First Piece" },
  { number: 6, title: "Exploring and Reading" },
  { number: 7, title: "Daily Prompts and Practice" },
  { number: 8, title: "Quick Reference Card" },
];

function ChapterCard({ chapter, ContentComponent }: { chapter: { number: number; title: string }; ContentComponent: React.ComponentType }) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      data-testid={`chapter-card-${chapter.number}`}
      className={`border border-[#6b8f71]/30 bg-[#6b8f71]/[0.02] chapter-card-glow ${
        isVisible ? 'chapter-card-reveal' : 'opacity-0'
      }`}
    >
      <div className="border-b border-[#6b8f71]/20 px-6 md:px-10 py-6">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#6b8f71]">
          Chapter {chapter.number}
        </span>
        <h1 className="font-display text-3xl md:text-4xl text-white/95 font-light mt-2">
          {chapter.title}
        </h1>
      </div>
      <div className="px-6 md:px-10 py-8 md:py-10">
        <ContentComponent />
      </div>
    </div>
  );
}

function DontWorryBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-testid="callout-dont-worry"
      className="my-8 border-2 border-[#c9a84c]/40 bg-[#c9a84c]/[0.06] p-6 md:p-8"
    >
      <div className="flex items-start gap-3 mb-3">
        <Shield className="w-5 h-5 text-[#c9a84c] mt-0.5 shrink-0" />
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#c9a84c]">
          Don't Worry
        </span>
      </div>
      <div className="text-white/75 text-lg leading-relaxed font-sans">
        {children}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block font-mono text-[11px] tracking-[0.2em] uppercase text-[#6b8f71] mb-1">
      {children}
    </span>
  );
}

function Term({ name, plain }: { name: string; plain: string }) {
  return (
    <span>
      <strong className="text-[#c9a84c]">{name}</strong>{" "}
      <span className="text-white/60">({plain})</span>
    </span>
  );
}

function Chapter1() {
  const { getContent } = useSiteContent("garden-guide");
  return (
    <>
      <p className="text-xl text-white/80 leading-relaxed">
        {getContent("ch1-p1", "Welcome to The Page Gallery Journal. We're glad you're here.")}
      </p>
      <p className="text-lg text-white/70 leading-relaxed mt-4">
        {getContent("ch1-p2", "This is a place where your writing can grow at its own pace — like a garden. You plant something small, you tend to it, and when it's ready, you share it with others. There's no rush, no pressure, and no one looking over your shoulder.")}
      </p>
      <p className="text-lg text-white/70 leading-relaxed mt-4">
        Throughout this site, you'll notice we use the language of gardens and
        growing things. A first draft is called a <Term name="Seed" plain="a brand-new idea, just planted" />.
        When you're working on it, it becomes a <Term name="Sprout" plain="something growing, still being shaped" />.
        When you're ready to share, it becomes a <Term name="Bloom" plain="something you've opened up for others to read" />.
      </p>
      <p className="text-lg text-white/70 leading-relaxed mt-4">
        {getContent("ch1-p3", "This guide will walk you through everything, step by step. You can come back to it any time — it will remember where you left off.")}
      </p>
      <DontWorryBox>
        Nothing you write here is public until <strong>you</strong> decide.
        Your words are yours. You choose when — and whether — anyone else gets
        to read them. If you're not sure about something, just leave it as it
        is. You can always come back later.
      </DontWorryBox>
    </>
  );
}

function Chapter2() {
  const { getContent } = useSiteContent("garden-guide");
  return (
    <>
      <p className="text-lg text-white/70 leading-relaxed">
        {getContent("ch2-intro", "At the very top of every page, you'll see a menu bar. Here's what each item does:")}
      </p>
      <div className="space-y-6 mt-6">
        <div className="border-l-2 border-[#6b8f71]/40 pl-5">
          <SectionLabel>HOME</SectionLabel>
          <p className="text-lg text-white/70 leading-relaxed">
            {getContent("ch2-home", "Takes you back to the front page of the site. You can always click this to start over.")}
          </p>
        </div>
        <div className="border-l-2 border-[#6b8f71]/40 pl-5">
          <SectionLabel>THE JOURNAL</SectionLabel>
          <p className="text-lg text-white/70 leading-relaxed">
            {getContent("ch2-journal", "This is where published work lives — the writing that editors have chosen to feature. Think of it like a magazine. You can read poetry, fiction, essays, and more here.")}
          </p>
        </div>
        <div className="border-l-2 border-[#6b8f71]/40 pl-5">
          <SectionLabel>MY GARDEN</SectionLabel>
          <p className="text-lg text-white/70 leading-relaxed">
            {getContent("ch2-garden", "Your private workspace. This is where you write, practice, read others' work, and manage everything you've created. More on this in the next chapter.")}
          </p>
        </div>
        <div className="border-l-2 border-[#6b8f71]/40 pl-5">
          <SectionLabel>STUDIO</SectionLabel>
          <p className="text-lg text-white/70 leading-relaxed">
            {getContent("ch2-studio", "This is for editors only — you don't need to worry about it. If you don't see it in your menu, that's perfectly normal.")}
          </p>
        </div>
        <div className="border-l-2 border-[#6b8f71]/40 pl-5">
          <SectionLabel>ABOUT</SectionLabel>
          <p className="text-lg text-white/70 leading-relaxed">
            {getContent("ch2-about", "Information about The Page Gallery Journal — who we are and what we're doing here.")}
          </p>
        </div>
      </div>
      <div className="mt-8 p-5 bg-white/[0.02] border border-white/[0.06]">
        <SectionLabel>The User Menu</SectionLabel>
        <p className="text-lg text-white/70 leading-relaxed mt-2">
          {getContent("ch2-user-menu", "In the top-right corner, you'll see your name or a small icon. Click it to find your profile, your settings, and the button to sign out.")}
        </p>
      </div>
      <div className="mt-4 p-5 bg-white/[0.02] border border-white/[0.06]">
        <SectionLabel>Light / Dark Mode</SectionLabel>
        <p className="text-lg text-white/70 leading-relaxed mt-2">
          {getContent("ch2-light-dark", "There's a small toggle that lets you switch between a dark background and a light one. Use whichever is easier on your eyes.")}
        </p>
      </div>
      <div className="mt-4 p-5 bg-white/[0.02] border border-white/[0.06]">
        <SectionLabel>Customise Accessibility</SectionLabel>
        <p className="text-lg text-white/70 leading-relaxed mt-2">
          {getContent("ch2-accessibility", "Look for the \"Customise Accessibility\" button — this lets you adjust text sizes, contrast, and other settings to make the site more comfortable for you.")}
        </p>
      </div>
    </>
  );
}

function Chapter3() {
  const { getContent } = useSiteContent("garden-guide");
  const rooms = [
    {
      id: "soil",
      name: getContent("ch3-room-soil-name", "The Soil"),
      plain: getContent("ch3-room-soil-plain", "your private writing desk"),
      desc: getContent("ch3-room-soil-desc", "This is where you write. Only you can see what's here. Think of it as your notebook — open it, write something, close it, and come back whenever you like."),
    },
    {
      id: "reading-room",
      name: getContent("ch3-room-reading-room-name", "Reading Room"),
      plain: getContent("ch3-room-reading-room-plain", "a place to read and be inspired"),
      desc: getContent("ch3-room-reading-room-desc", "Here you'll find writing shared by other writers in the community. You'll also find daily nudges and letters to keep you inspired."),
    },
    {
      id: "nutrients",
      name: getContent("ch3-room-nutrients-name", "Nutrients"),
      plain: getContent("ch3-room-nutrients-plain", "practice tools to help you grow"),
      desc: getContent("ch3-room-nutrients-desc", "This room is full of ways to practise your craft. You'll find Freewrite (a timed writing exercise), the Growth Journal (a place to reflect on your progress), Circles (writing groups you can join), and The Compost Pile (a collection of abandoned fragments that other writers have shared — you might find something inspiring there)."),
    },
    {
      id: "noticing",
      name: getContent("ch3-room-noticing-name", "Noticing"),
      plain: getContent("ch3-room-noticing-plain", "100 creative prompts"),
      desc: getContent("ch3-room-noticing-desc", "One hundred writing prompts, arranged in groups of 25. You can browse them, pick one that speaks to you, and write directly into it. No pressure to use them all — even one is a great start."),
    },
    {
      id: "greenhouse",
      name: getContent("ch3-room-greenhouse-name", "Greenhouse"),
      plain: getContent("ch3-room-greenhouse-plain", "courses and editorial feedback"),
      desc: getContent("ch3-room-greenhouse-desc", "This is where you'll find structured courses and the opportunity to receive feedback from experienced editors. Think of it as a gentle classroom where your writing can grow stronger."),
    },
  ];

  return (
    <>
      <p className="text-lg text-white/70 leading-relaxed">
        When you click <strong className="text-white/90">MY GARDEN</strong> in the
        menu at the top, you'll arrive at your personal workspace. It's
        organised into five tabs — think of them as five rooms in your garden,
        each with a different purpose.
      </p>
      <div className="space-y-6 mt-8">
        {rooms.map((room, i) => (
          <div
            key={room.id}
            data-testid={`room-${i}`}
            className="border border-[#6b8f71]/30 p-6 bg-[#6b8f71]/[0.03]"
          >
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-[#6b8f71]" />
              <Term name={room.name} plain={room.plain} />
            </div>
            <p className="text-lg text-white/70 leading-relaxed">{room.desc}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function Chapter4() {
  const { getContent } = useSiteContent("garden-guide");
  return (
    <>
      <p className="text-lg text-white/70 leading-relaxed">
        {getContent("ch4-intro", "We use two sets of words to describe your writing on this site. Don't worry — once you see them explained, they'll make perfect sense.")}
      </p>

      <div className="mt-8">
        <h3 className="font-display text-2xl text-white/90 font-light mb-4">
          {getContent("ch4-stages-title", "Growth Stages")}
        </h3>
        <p className="text-lg text-white/60 leading-relaxed mb-6">
          These describe <em>how finished</em> your piece is — like the life
          cycle of a plant.
        </p>
        <div className="space-y-4">
          {[
            { name: "Seed", plain: "first draft, just planted", desc: getContent("ch4-stage-Seed", "Your idea has just been put on the page. It's completely private — no one else can see it.") },
            { name: "Sprout", plain: "growing, being edited", desc: getContent("ch4-stage-Sprout", "You're working on it, shaping it, making it better. Still private — still just for you.") },
            { name: "Bloom", plain: "shared with the community", desc: getContent("ch4-stage-Bloom", "You've decided to let others read it. Community members can now find it and enjoy your work.") },
            { name: "Dormant", plain: "tucked away for later", desc: getContent("ch4-stage-Dormant", "You've archived this piece. It's not gone — it's just resting. You can wake it up any time.") },
          ].map((stage, i) => (
            <div key={stage.name} data-testid={`stage-${i}`} className="border-l-2 border-[#c9a84c]/40 pl-5">
              <Term name={stage.name} plain={stage.plain} />
              <p className="text-lg text-white/70 leading-relaxed mt-1">{stage.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h3 className="font-display text-2xl text-white/90 font-light mb-4">
          {getContent("ch4-layers-title", "Creative Layers")}
        </h3>
        <p className="text-lg text-white/60 leading-relaxed mb-6">
          These describe <em>where</em> your writing lives — like different
          areas of a real garden.
        </p>
        <div className="space-y-4">
          {[
            { name: "Soil", plain: "your private desk", desc: getContent("ch4-layer-Soil", "No one sees this but you. It's where you do your writing.") },
            { name: "Garden", plain: "shared with the community", desc: getContent("ch4-layer-Garden", "When you bloom a piece, it appears here for other writers to read and appreciate.") },
            { name: "Commons", plain: "public spaces for everyone", desc: getContent("ch4-layer-Commons", "Open areas where the whole community gathers — prompts, discussions, shared resources.") },
            { name: "Gallery", plain: "editor-selected published work", desc: getContent("ch4-layer-Gallery", "This is The Journal itself. Editors choose work from the Garden and publish it here for everyone to read.") },
            { name: "Nursery", plain: "courses and editorial guidance", desc: getContent("ch4-layer-Nursery", "A sheltered space for learning, with courses and feedback to help your writing grow stronger.") },
          ].map((layer, i) => (
            <div key={layer.name} data-testid={`layer-${i}`} className="border-l-2 border-[#6b8f71]/40 pl-5">
              <Term name={layer.name} plain={layer.plain} />
              <p className="text-lg text-white/70 leading-relaxed mt-1">{layer.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <DontWorryBox>
        Moving a piece from Seed to Bloom does <strong>not</strong> automatically
        publish it in The Journal. Editors discover work in the Garden, but only
        select pieces make it to the Gallery. You are always in control of what
        you share.
      </DontWorryBox>
    </>
  );
}

function Chapter5() {
  const { getContent } = useSiteContent("garden-guide");
  const steps = [
    getContent("ch5-step-1", "Click MY GARDEN in the menu at the top of the page."),
    getContent("ch5-step-2", "You'll land on The Soil tab — your private writing desk."),
    getContent("ch5-step-3", "Click the button that says START WRITING (or look for the + button)."),
    getContent("ch5-step-4", "Choose what kind of writing this is: Poetry, Fiction, Essay, Fragment, or Other. Pick whichever feels right — you can change it later."),
    getContent("ch5-step-5", "Start writing. Your work saves automatically as you type, so you don't need to worry about losing anything."),
    getContent("ch5-step-6", "Your piece starts as a Seed (a private draft). No one else can see it."),
    getContent("ch5-step-7", "When you're happy with it, you can change its stage to Sprout (still private, but you're signalling to yourself that it's growing). When you're ready for others to read it, change it to Bloom."),
  ];

  return (
    <>
      <p className="text-lg text-white/70 leading-relaxed">
        {getContent("ch5-intro", "Here's exactly what to do when you want to write something new.")}
      </p>
      <div className="mt-8 space-y-4">
        {steps.map((step, i) => (
          <div key={i} data-testid={`step-${i}`} className="flex gap-4 items-start">
            <span className="shrink-0 w-8 h-8 flex items-center justify-center border border-[#6b8f71]/40 text-[#6b8f71] font-mono text-sm">
              {i + 1}
            </span>
            <p className="text-lg text-white/70 leading-relaxed pt-1">{step}</p>
          </div>
        ))}
      </div>
      <DontWorryBox>
        You cannot accidentally publish anything. Changing to Bloom means
        community members can read your work, but it takes an editor to put it
        in The Journal. Your writing only appears in the published magazine if
        an editor specifically selects it.
      </DontWorryBox>
    </>
  );
}

function Chapter6() {
  const { getContent } = useSiteContent("garden-guide");
  return (
    <>
      <p className="text-lg text-white/70 leading-relaxed">
        {getContent("ch6-intro", "There are a few different places to read on this site. Here's the difference between them:")}
      </p>
      <div className="space-y-6 mt-8">
        <div className="border border-[#6b8f71]/30 p-6 bg-[#6b8f71]/[0.03]">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-[#6b8f71]" />
            <SectionLabel>Reading Room (inside your Garden)</SectionLabel>
          </div>
          <p className="text-lg text-white/70 leading-relaxed">
            {getContent("ch6-reading-room", "This is a curated space with letters, daily nudges, and writing shared by other community members. Think of it as a cosy corner where the community gathers.")}
          </p>
        </div>
        <div className="border border-[#6b8f71]/30 p-6 bg-[#6b8f71]/[0.03]">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-[#6b8f71]" />
            <SectionLabel>The Journal (in the top menu)</SectionLabel>
          </div>
          <p className="text-lg text-white/70 leading-relaxed">
            {getContent("ch6-journal", "This is the published magazine. Work here has been selected by editors. You can browse by type — Poetry, Fiction, Essay, Fragment, or Other — and search for specific pieces. You can also filter by length if you only have a few minutes to read.")}
          </p>
        </div>
      </div>
    </>
  );
}

function Chapter7() {
  const { getContent } = useSiteContent("garden-guide");
  return (
    <>
      <p className="text-lg text-white/70 leading-relaxed">
        {getContent("ch7-intro", "Sometimes the hardest part is knowing where to start. We've built a few tools to help with that.")}
      </p>
      <div className="space-y-8 mt-8">
        <div>
          <h3 className="font-display text-xl text-white/90 font-light mb-3">
            {getContent("ch7-today-title", "Today's Prompt")}
          </h3>
          <p className="text-lg text-white/70 leading-relaxed">
            Every day, a new writing prompt appears on your Soil page. Look for
            the <strong className="text-white/90">WRITE FROM THIS PROMPT</strong> button to
            jump straight in. If you'd like to see what came before, click{" "}
            <strong className="text-white/90">Previous Prompts</strong> to browse
            the archive.
          </p>
        </div>
        <div>
          <h3 className="font-display text-xl text-white/90 font-light mb-3">
            {getContent("ch7-noticing-title", "Noticing")}
          </h3>
          <p className="text-lg text-white/70 leading-relaxed">
            {getContent("ch7-noticing-desc", "One hundred creative prompts, arranged in groups of 25. These aren't ordinary prompts — they're invitations to notice the world around you. Pick one, sit with it, and see what comes. You can write directly into any prompt.")}
          </p>
        </div>
        <div>
          <h3 className="font-display text-xl text-white/90 font-light mb-3">
            {getContent("ch7-calls-title", "Open Calls")}
          </h3>
          <p className="text-lg text-white/70 leading-relaxed">
            {getContent("ch7-calls-desc", "From time to time, editors put out themed calls for submissions. These have a specific topic and a deadline. It's a lovely way to challenge yourself and to see your writing alongside others who responded to the same idea.")}
          </p>
        </div>
      </div>
    </>
  );
}

function Chapter8() {
  const { getContent } = useSiteContent("garden-guide");
  return (
    <div className="garden-guide-reference">
      <div className="flex items-center justify-between mb-8">
        <p className="text-lg text-white/70 leading-relaxed">
          {getContent("ch8-intro", "Keep this card handy. You can print it using the button below.")}
        </p>
        <button
          data-testid="button-print"
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 border border-[#c9a84c]/40 text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors font-mono text-xs tracking-wider uppercase print:hidden"
        >
          <Printer className="w-4 h-4" />
          Print This Card
        </button>
      </div>

      <div className="space-y-8">
        <div className="border border-[#6b8f71]/30 p-6">
          <h3 className="font-display text-xl text-white/90 font-light mb-4">
            {getContent("ch8-where-title", "Where Things Are")}
          </h3>
          <div className="space-y-2 text-lg text-white/70">
            <p><strong className="text-white/90">HOME</strong> — The front page</p>
            <p><strong className="text-white/90">THE JOURNAL</strong> — Published work, selected by editors</p>
            <p><strong className="text-white/90">MY GARDEN</strong> — Your private workspace (Soil, Reading Room, Nutrients, Noticing, Greenhouse)</p>
            <p><strong className="text-white/90">STUDIO</strong> — Editors only</p>
            <p><strong className="text-white/90">ABOUT</strong> — About the journal</p>
          </div>
        </div>

        <div className="border border-[#6b8f71]/30 p-6">
          <h3 className="font-display text-xl text-white/90 font-light mb-4">
            {getContent("ch8-glossary-title", "Glossary")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-lg text-white/70">
            <p><strong className="text-[#c9a84c]">Seed</strong> — Private first draft</p>
            <p><strong className="text-[#c9a84c]">Sprout</strong> — Still private, being edited</p>
            <p><strong className="text-[#c9a84c]">Bloom</strong> — Shared with the community</p>
            <p><strong className="text-[#c9a84c]">Dormant</strong> — Archived for later</p>
            <p><strong className="text-[#c9a84c]">Soil</strong> — Your private desk</p>
            <p><strong className="text-[#c9a84c]">Garden</strong> — Community reading space</p>
            <p><strong className="text-[#c9a84c]">Commons</strong> — Public shared areas</p>
            <p><strong className="text-[#c9a84c]">Gallery</strong> — Editor-published work</p>
            <p><strong className="text-[#c9a84c]">Nursery</strong> — Courses and guidance</p>
          </div>
        </div>

        <div className="border border-[#6b8f71]/30 p-6">
          <h3 className="font-display text-xl text-white/90 font-light mb-4">
            {getContent("ch8-click-title", "What Do I Click To...")}
          </h3>
          <div className="space-y-4 text-lg text-white/70">
            <div className="border-b border-white/[0.06] pb-3">
              <p className="text-white/90 font-medium">Write something new?</p>
              <p>Click MY GARDEN → you'll be on The Soil tab → click START WRITING.</p>
            </div>
            <div className="border-b border-white/[0.06] pb-3">
              <p className="text-white/90 font-medium">Read other people's work?</p>
              <p>Click THE JOURNAL in the top menu to read published work, or go to MY GARDEN → Reading Room for community writing.</p>
            </div>
            <div className="border-b border-white/[0.06] pb-3">
              <p className="text-white/90 font-medium">Find a writing prompt?</p>
              <p>Go to MY GARDEN → look for Today's Prompt on The Soil page, or click the Noticing tab for 100 prompts.</p>
            </div>
            <div className="border-b border-white/[0.06] pb-3">
              <p className="text-white/90 font-medium">Let others read my writing?</p>
              <p>Open your piece and change its stage from Seed to Bloom. Community members will then be able to find and read it.</p>
            </div>
            <div>
              <p className="text-white/90 font-medium">Archive something?</p>
              <p>Open your piece and change its stage to Dormant. It won't be deleted — just tucked away until you're ready to return to it.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const chapterComponents = [
  Chapter1,
  Chapter2,
  Chapter3,
  Chapter4,
  Chapter5,
  Chapter6,
  Chapter7,
  Chapter8,
];

export default function GardenGuide() {
  usePageMeta({
    title: "Garden Guide — The Page Gallery Journal",
    description:
      "A step-by-step walkthrough for new writers on The Page Gallery Journal. Learn how to write, share, and explore at your own pace.",
    canonicalPath: "/garden-guide",
  });

  const { getContent } = useSiteContent("garden-guide");

  const chapters = defaultChapters.map((ch) => ({
    ...ch,
    title: getContent(`ch${ch.number}-title`, ch.title),
  }));

  const [currentChapter, setCurrentChapter] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const num = parseInt(saved, 10);
        if (num >= 0 && num < defaultChapters.length) return num;
      }
    } catch {}
    return 0;
  });

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(currentChapter));
    } catch {}
  }, [currentChapter]);

  const goTo = useCallback((index: number) => {
    setCurrentChapter(index);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const ChapterContent = chapterComponents[currentChapter];
  const chapter = chapters[currentChapter];
  const progress = ((currentChapter + 1) / chapters.length) * 100;

  return (
    <div className="min-h-screen text-foreground relative" style={{ backgroundColor: "#060d06" }}>
      <header className="border-b border-white/[0.06] print:hidden" style={{ backgroundColor: "#060d06" }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            data-testid="link-home"
            className="flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors font-mono text-[11px] tracking-[0.15em] uppercase"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <span className="font-display text-lg text-white/70 font-light tracking-wide">
            {getContent("header-title", "Garden Guide")}
          </span>
          <Link
            href="/garden"
            data-testid="link-back-to-garden"
            className="flex items-center gap-2 text-[#c9a84c] hover:text-[#c9a84c]/80 transition-colors font-mono text-[11px] tracking-[0.15em] uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            My Garden
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        <div
          data-testid="progress-bar"
          className="sticky top-0 z-40 border-b border-white/[0.06] print:hidden"
          style={{ backgroundColor: "rgba(6, 13, 6, 0.95)", backdropFilter: "blur(8px)" }}
        >
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-white/40">
              Chapter {chapter.number} of {chapters.length}
            </span>
          </div>
          <div className="h-[2px] bg-white/[0.06]">
            <motion.div
              className="h-full bg-[#6b8f71]"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="flex gap-12">
            <aside className="hidden lg:block w-64 shrink-0">
              <nav
                data-testid="chapter-sidebar"
                className="sticky top-24 space-y-1"
              >
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/30 mb-4 px-3">
                  Chapters
                </p>
                {chapters.map((ch, i) => (
                  <button
                    key={ch.number}
                    data-testid={`sidebar-chapter-${ch.number}`}
                    onClick={() => goTo(i)}
                    className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-start gap-3 ${
                      i === currentChapter
                        ? "bg-[#6b8f71]/10 text-white/90 border-l-2 border-[#6b8f71]"
                        : "text-white/50 hover:text-white/70 hover:bg-white/[0.02] border-l-2 border-transparent"
                    }`}
                  >
                    <span className="font-mono text-[10px] mt-0.5 shrink-0 text-white/30">
                      {String(ch.number).padStart(2, "0")}
                    </span>
                    <span className="font-sans leading-snug">{ch.title}</span>
                  </button>
                ))}
              </nav>
            </aside>

            <div className="flex-1 min-w-0">
              <button
                data-testid="button-mobile-menu"
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden mb-6 flex items-center gap-2 px-3 py-2 border border-white/[0.1] text-white/60 hover:text-white/80 transition-colors font-mono text-[11px] tracking-[0.15em] uppercase print:hidden"
              >
                {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                Chapters
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.nav
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="lg:hidden mb-8 overflow-hidden border border-white/[0.06] bg-[#060d06]/90 backdrop-blur-sm print:hidden"
                  >
                    <div className="p-4 space-y-1">
                      {chapters.map((ch, i) => (
                        <button
                          key={ch.number}
                          data-testid={`mobile-chapter-${ch.number}`}
                          onClick={() => goTo(i)}
                          className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-start gap-3 ${
                            i === currentChapter
                              ? "bg-[#6b8f71]/10 text-white/90"
                              : "text-white/50"
                          }`}
                        >
                          <span className="font-mono text-[10px] mt-0.5 shrink-0 text-white/30">
                            {String(ch.number).padStart(2, "0")}
                          </span>
                          <span className="font-sans leading-snug">{ch.title}</span>
                        </button>
                      ))}
                    </div>
                  </motion.nav>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.article
                  key={currentChapter}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ChapterCard chapter={chapter} ContentComponent={ChapterContent} />
                </motion.article>
              </AnimatePresence>

              <div
                data-testid="chapter-navigation"
                className="flex items-center justify-between mt-10 print:hidden"
              >
                <button
                  data-testid="button-previous"
                  onClick={() => goTo(currentChapter - 1)}
                  disabled={currentChapter === 0}
                  className={`flex items-center gap-2 px-5 py-3 border transition-colors font-mono text-[11px] tracking-[0.15em] uppercase ${
                    currentChapter === 0
                      ? "border-white/[0.06] text-white/20 cursor-not-allowed"
                      : "border-[#6b8f71]/40 text-[#6b8f71] hover:bg-[#6b8f71]/10"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  data-testid="button-next"
                  onClick={() => goTo(currentChapter + 1)}
                  disabled={currentChapter === chapters.length - 1}
                  className={`flex items-center gap-2 px-5 py-3 border transition-colors font-mono text-[11px] tracking-[0.15em] uppercase ${
                    currentChapter === chapters.length - 1
                      ? "border-white/[0.06] text-white/20 cursor-not-allowed"
                      : "border-[#c9a84c]/40 text-[#c9a84c] hover:bg-[#c9a84c]/10"
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] print:hidden" style={{ backgroundColor: "#060d06" }}>
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/30">
            {getContent("footer-text", "The Page Gallery Journal")}
          </span>
          <div className="flex items-center gap-6">
            <Link href="/" data-testid="link-footer-home" className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/40 hover:text-white/60 transition-colors">
              Home
            </Link>
            <Link href="/garden" data-testid="link-footer-garden" className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/40 hover:text-white/60 transition-colors">
              My Garden
            </Link>
            <Link href="/about" data-testid="link-footer-about" className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/40 hover:text-white/60 transition-colors">
              About
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
