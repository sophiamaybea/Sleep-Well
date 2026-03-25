import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

gsap.registerPlugin(ScrollTrigger);

interface ApplicationForm {
  journalName: string;
  contactName: string;
  email: string;
  website?: string;
  instagramHandle?: string;
  foundedYear?: string;
  genresFocus: string;
  currentSubmissionPlatform?: string;
  submissionsPerYear?: string;
  staffSize?: string;
  editorialStatement: string;
  whyTheGarden: string;
  paysContributors: boolean;
  paymentNote?: string;
  tier: string;
}

export default function ForJournals() {
  const mainRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ApplicationForm>({
    journalName: '', contactName: '', email: '', genresFocus: '',
    editorialStatement: '', whyTheGarden: '', paysContributors: false,
    tier: 'reading_room'
  });

  const mutation = useMutation({
    mutationFn: async (data: ApplicationForm) => {
      const res = await fetch('/api/journal-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Submission failed');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Application submitted!', description: 'We\'ll review and be in touch.' });
      setShowForm(false);
      setFormData({
        journalName: '', contactName: '', email: '', genresFocus: '',
        editorialStatement: '', whyTheGarden: '', paysContributors: false,
        tier: 'reading_room'
      });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to submit. Try again.', variant: 'destructive' });
    }
  });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-text', { y: 60, opacity: 0, duration: 1.2, ease: 'power4.out', stagger: 0.1 });
      const sections = gsap.utils.toArray('.animate-section');
      sections.forEach((section: any) => {
        gsap.from(section, {
          y: 40, opacity: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 85%' }
        });
      });
    }, mainRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div ref={mainRef} className="bg-[#0e0d0c] min-h-screen text-[#4a4844] font-body selection:bg-[#c9a96e] selection:text-[#0e0d0c]">
      <Navigation />
      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="px-6 md:px-12 max-w-4xl mx-auto mb-40">
          <div className="flex flex-col gap-4 mb-16">
            <span className="font-mono text-[9px] text-[#c9a96e] uppercase tracking-[0.3em] hero-text">The Garden: A Pitch to Literary Journals</span>
            <h1 className="font-display text-5xl md:text-8xl text-[#c9a96e] leading-[1.1] hero-text">This is not a<br/>better bucket for<br/>manuscripts.</h1>
            <p className="text-xl md:text-2xl text-[#c9a96e]/80 leading-relaxed italic font-display hero-text">It is a different organism entirely.</p>
          </div>
        </section>

        {/* What You Have Been Calling Submissions */}
        <SectionContainer index="I" label="WHAT YOU HAVE BEEN CALLING 'SUBMISSIONS'">
          <div className="max-w-3xl animate-section">
            <p className="text-sm leading-relaxed mb-6 opacity-80">
              You know this choreography. You post an open call. A caption on Instagram, a tweet, a line on your website. Somewhere, a writer copies your guidelines into a notes app and begins rearranging a document that had another life before you.
            </p>
            <p className="text-sm leading-relaxed mb-6 opacity-80">
              A platform—Submittable, a Google Form, an inbox—receives the file. You read from whatever happened to arrive during that window and call it discovery.
            </p>
            <p className="text-sm leading-relaxed mb-12 opacity-80">
              The system works. Which is the problem. Because what it selects for is not talent. It's stamina. Administrative stamina. You are not reading literature's best offer. You are reading what survived the infrastructure.
            </p>
            <p className="text-xl text-[#c9a96e] italic font-display">The Garden exists to change what you get to read.</p>
          </div>
        </SectionContainer>


        {/* The Garden Architecture */}
        <SectionContainer index="II" label="WHAT THE GARDEN IS">
          <div className="animate-section grid md:grid-cols-2 gap-20">
            <div>
              <h2 className="font-display text-3xl text-[#c9a96e] mb-8">A private writing environment</h2>
              <p className="text-sm leading-relaxed mb-8 opacity-80">
                The Garden is not a manuscripts repository. It's a living terrain where writers grow work in three visible states: <strong className="text-[#c9a96e]">Seed</strong> (raw), <strong className="text-[#c9a96e]">Sprout</strong> (developing), <strong className="text-[#c9a96e]">Bloom</strong> (ready). Work can live here for a year and still be published by you as a true first publication.
              </p>
            </div>
            <div className="border border-[#4a4844]/20 p-10 bg-[#0e0d0c]">
              <p className="font-display italic text-lg text-[#4a4844] leading-relaxed">
                "No one is uploading 'their book' to wait in a queue. Writers are writing, and you see the blooms."
              </p>
            </div>
          </div>
        </SectionContainer>

        {/* Discovery Mechanism */}
        <SectionContainer index="IV" label="THE DISCOVERY MECHANISM THAT DOESN'T EXIST ANYWHERE ELSE">
          <div className="max-w-3xl animate-section">
            <div className="space-y-8 mb-16">
              <div>
                <h3 className="text-[#c9a96e] text-sm mb-3">Current literary reality:</h3>
                <p className="text-xs opacity-60">Journals post calls → Writers come to journals → Journals choose from whoever arrives</p>
              </div>
              <div>
                <h3 className="text-[#c9a96e] text-sm mb-3">Garden reality:</h3>
                <p className="text-xs opacity-60">Writers write → Work matures → <strong className="text-[#c9a96e]">Journals go to the work</strong></p>
              </div>
            </div>
            <p className="text-sm leading-relaxed opacity-80">
              You browse the bloom pool: every piece a writer has marked as ready. You filter by form, length, tags. You send a publication request. The writer sees your profile and <em>then</em> decides whether to accept. The direction of power isn't reversed. It's finally balanced.
            </p>
          </div>
        </SectionContainer>

        {/* Money Section */}
        <SectionContainer index="VI" label="THE MONEY: OPTIONAL, HONEST, YOURS">
          <div className="max-w-3xl animate-section">
            <h2 className="font-display text-4xl text-[#c9a96e] mb-10">Journals do not have to pay to use the Garden.</h2>
            <p className="text-sm leading-relaxed mb-8 opacity-80">Read that again. Then once more.</p>
            <p className="text-sm leading-relaxed mb-12 opacity-80">
              Joining as a journal is free, permanently. You can run open calls, manage submissions, browse the bloom pool, send publication requests, and build issues without ever paying us anything. Money only appears if you <em>choose</em> to charge for something.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#4a4844]/20 border border-[#4a4844]/20">
              <div className="p-10 bg-[#0e0d0c]">
                <h3 className="font-mono text-[9px] uppercase tracking-widest text-[#c9a96e] block mb-4">The Reading Room</h3>
                <p className="text-lg font-display text-[#c9a96e] mb-4">Free forever</p>
                <p className="text-xs opacity-60 leading-relaxed">1 active call. 75 submissions/month. Browse all blooms. 5 publication requests/month.</p>
              </div>
              <div className="p-10 bg-[#0e0d0c]">
                <h3 className="font-mono text-[9px] uppercase tracking-widest text-[#c9a96e] block mb-4">The Press</h3>
                <p className="text-lg font-display text-[#c9a96e] mb-4">£29/month (optional)</p>
                <p className="text-xs opacity-60 leading-relaxed">5 calls. Unlimited submissions. Blind review. Custom forms.</p>
              </div>
              <div className="p-10 bg-[#0e0d0c]">
                <h3 className="font-mono text-[9px] uppercase tracking-widest text-[#c9a96e] block mb-4">The House</h3>
                <p className="text-lg font-display text-[#c9a96e] mb-4">£79/month (optional)</p>
                <p className="text-xs opacity-60 leading-relaxed">Multi-imprint. White-label exports. API access.</p>
              </div>
            </div>
          </div>
        </SectionContainer>

        {/* Application CTA */}
        <section className="px-6 md:px-12 py-40 text-center animate-section">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-3xl text-[#c9a96e] mb-12">Register Your Interest</h2>
            {!showForm ? (
              <Button
                onClick={() => setShowForm(true)}
                className="px-14 py-5 border border-[#c9a96e] text-[#c9a96e] font-mono text-[10px] uppercase tracking-[0.4em] hover:bg-[#c9a96e] hover:text-[#0e0d0c] transition-all duration-500 bg-transparent"
              >
                Apply Now
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-xl mx-auto text-left space-y-6">
                <div>
                  <label className="block font-mono text-[9px] text-[#c9a96e] uppercase tracking-widest mb-2">Journal Name *</label>
                  <input required value={formData.journalName} onChange={e => setFormData({...formData, journalName: e.target.value})} className="w-full bg-[#0e0d0c] border border-[#4a4844]/20 p-3 text-[#c9a96e] focus:border-[#c9a96e] outline-none" />
                </div>
                <div>
                  <label className="block font-mono text-[9px] text-[#c9a96e] uppercase tracking-widest mb-2">Contact Name *</label>
                  <input required value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} className="w-full bg-[#0e0d0c] border border-[#4a4844]/20 p-3 text-[#c9a96e] focus:border-[#c9a96e] outline-none" />
                </div>
                <div>
                  <label className="block font-mono text-[9px] text-[#c9a96e] uppercase tracking-widest mb-2">Email *</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#0e0d0c] border border-[#4a4844]/20 p-3 text-[#c9a96e] focus:border-[#c9a96e] outline-none" />
                </div>
                <div>
                  <label className="block font-mono text-[9px] text-[#c9a96e] uppercase tracking-widest mb-2">Genres Focus *</label>
                  <input required value={formData.genresFocus} onChange={e => setFormData({...formData, genresFocus: e.target.value})} placeholder="e.g., Poetry, Prose, Hybrid" className="w-full bg-[#0e0d0c] border border-[#4a4844]/20 p-3 text-[#c9a96e] focus:border-[#c9a96e] outline-none" />
                </div>
                <div>
                  <label className="block font-mono text-[9px] text-[#c9a96e] uppercase tracking-widest mb-2">Editorial Statement *</label>
                  <textarea required value={formData.editorialStatement} onChange={e => setFormData({...formData, editorialStatement: e.target.value})} rows={4} className="w-full bg-[#0e0d0c] border border-[#4a4844]/20 p-3 text-[#c9a96e] focus:border-[#c9a96e] outline-none" />
                </div>
                <div>
                  <label className="block font-mono text-[9px] text-[#c9a96e] uppercase tracking-widest mb-2">Why The Garden? *</label>
                  <textarea required value={formData.whyTheGarden} onChange={e => setFormData({...formData, whyTheGarden: e.target.value})} rows={4} className="w-full bg-[#0e0d0c] border border-[#4a4844]/20 p-3 text-[#c9a96e] focus:border-[#c9a96e] outline-none" />
                </div>
                <div className="flex gap-3">
                  <input type="checkbox" checked={formData.paysContributors} onChange={e => setFormData({...formData, paysContributors: e.target.checked})} className="mt-1" />
                  <label className="text-xs text-[#c9a96e]">We pay contributors</label>
                </div>
                <Button type="submit" disabled={mutation.isPending} className="w-full py-4 bg-[#c9a96e] text-[#0e0d0c] hover:bg-[#c9a96e]/80">
                  {mutation.isPending ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            )}
          </div>
        </section>

        {/* Final Statement */}
        <section className="px-6 md:px-12 max-w-3xl mx-auto mb-40 animate-section">
          <h2 className="font-display text-4xl text-[#c9a96e] mb-8 leading-tight">Final Statement</h2>
          <p className="text-sm leading-relaxed mb-6 opacity-80">
            This is not a nicer slush pile. It is not a kinder rejection machine. It is a system built on one non-negotiable belief: No writer should die unheard because the infrastructure never made a path between their private pages and the journals that would have loved them.
          </p>
          <p className="text-xl text-[#c9a96e] italic font-display">The Garden is the path.</p>
        </section>

      </main>
      <Footer />
    </div>
  );
}

function SectionContainer({
  children, index, label, bg = "bg-[#0e0d0c]"
}: {
  children: React.ReactNode; index: string; label: string; bg?: string;
}) {
  return (
    <section className={`py-40 px-6 md:px-12 ${bg} border-t border-[#4a4844]/10`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 mb-16">
          <span className="font-display text-[10px] text-[#4a4844] tracking-widest">{index}</span>
          <span className="font-mono text-[9px] text-[#c9a96e] uppercase tracking-[0.3em]">{label}</span>
        </div>
        {children}
      </div>
    </section>
  );
}
