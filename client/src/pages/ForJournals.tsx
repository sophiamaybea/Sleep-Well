import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
}

const ForJournals: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<ApplicationForm>({
    journalName: '',
    contactName: '',
    email: '',
    website: '',
    instagramHandle: '',
    foundedYear: '',
    genresFocus: '',
    currentSubmissionPlatform: '',
    submissionsPerYear: '',
    staffSize: '',
    editorialStatement: '',
    whyTheGarden: '',
    paysContributors: false,
    paymentNote: ''
  });

  const mutation = useMutation({
    mutationFn: async (data: ApplicationForm) => {
      const response = await fetch('/api/journal-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to submit application');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Received",
        description: "We'll review your journal and get back to you soon.",
      });
      setFormData({
        journalName: '',
        contactName: '',
        email: '',
        website: '',
        instagramHandle: '',
        foundedYear: '',
        genresFocus: '',
        currentSubmissionPlatform: '',
        submissionsPerYear: '',
        staffSize: '',
        editorialStatement: '',
        whyTheGarden: '',
        paysContributors: false,
        paymentNote: ''
      });
    },
    onError: () => {
      toast({
        title: "Submission Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    }
  });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.fade-in').forEach((el: any) => {
        gsap.from(el, {
          opacity: 0,
          y: 50,
          duration: 1,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-transparent text-white relative overflow-hidden garden-bg">
      <Navigation />

      <main className="relative z-10">
        {/* I. WHAT YOU HAVE BEEN CALLING SUBMISSIONS */}
        <section className="min-h-screen flex flex-col justify-center px-6 md:px-[12vw] py-24 fade-in">
          <div className="max-w-4xl">
            <span className="font-sans text-[0.7rem] tracking-[0.18em] uppercase text-white/40 mb-4 block">Section I</span>
            <h1 className="text-4xl md:text-6xl font-display mb-8 leading-tight">
              This is not a better bucket for manuscripts.<br />It is a different organism entirely.
            </h1>
            <div className="space-y-6 text-lg leading-relaxed text-white/80">
              <p>You know this choreography. You post an open call. A platform receives the file. You read from whatever happened to arrive during that window and call it discovery.</p>
              <p>The system works. Which is the problem. Because what it selects for is not talent. It is stamina.</p>
              <p className="font-display border-l border-white/20 pl-6 text-white/70 italic">You are not reading literature's best offer. You are reading what survived the infrastructure.</p>
            </div>
          </div>
        </section>

        {/* VI. THE PART WHERE EVERYONE PRETENDS MONEY DOESN'T EXIST */}
        <section className="min-h-screen flex flex-col justify-center px-6 md:px-[12vw] py-24 border-y border-white/10 fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-16 items-start">
            <div className="space-y-8">
              <span className="font-sans text-[0.7rem] tracking-[0.18em] uppercase text-white/40 mb-4 block">Section VI</span>
              <h2 className="text-3xl md:text-5xl font-display">The labour no one pays for.</h2>
              <div className="space-y-6 text-lg text-white/80">
                <p>You run a journal the way other people run small religions: unpaid, devout, and slightly deranged. The hours go into the inbox. The money, when it appears, goes to the printer, the domain registrar, the platform that charges you for the privilege of reading other people's grief.</p>
                <p>The Garden does not fix that. It does something meaner and more precise: it removes the infrastructural excuse.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                  <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
                    <h3 className="text-xs uppercase tracking-widest text-white/50 mb-2">Channel I</h3>
                    <p className="font-display text-white/85">Reading fees without the tithe. You set a fee. You keep 85%.</p>
                  </div>
                  <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
                    <h3 className="text-xs uppercase tracking-widest text-white/50 mb-2">Channel II</h3>
                    <p className="font-display text-white/85">Donations without the cult. You keep 90%.</p>
                  </div>
                  <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
                    <h3 className="text-xs uppercase tracking-widest text-white/50 mb-2">Channel III</h3>
                    <p className="font-display text-white/85">Workshops without admin hell. You keep 85%.</p>
                  </div>
                  <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
                    <h3 className="text-xs uppercase tracking-widest text-white/50 mb-2">Channel IV</h3>
                    <p className="font-display text-white/85">Digital issues as quiet engine. You keep 80%.</p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="font-sans text-sm text-white/60 border-l border-white/15 pl-8 space-y-4">
              <p>We built the Garden because we ran a journal and watched it eat every spare hour. The only people getting paid were the platforms that called our work a "use case."</p>
              <div className="p-4 rounded-xl border border-dashed border-white/20 bg-white/[0.03]">
                <p className="font-medium mb-2 text-white/80">Example Annual Flow:</p>
                <div className="flex justify-between text-xs mb-1"><span>Reading Fees</span><span>£850</span></div>
                <div className="flex justify-between text-xs mb-1"><span>Workshops</span><span>£1,339</span></div>
                <div className="flex justify-between text-xs mb-1"><span>Donations</span><span>£810</span></div>
                <div className="border-t border-white/20 pt-2 flex justify-between font-bold"><span>Total</span><span>£2,999</span></div>
              </div>
            </aside>
          </div>
        </section>

        {/* VII. TIERS WITHOUT STRINGS ATTACHED */}
        <section className="py-24 px-6 md:px-[12vw] fade-in">
          <div className="max-w-3xl space-y-8">
            <span className="font-sans text-[0.7rem] tracking-[0.18em] uppercase text-white/40 mb-4 block">Section VII</span>
            <h2 className="text-3xl md:text-5xl font-display">Staying small, staying serious.</h2>
            <div className="space-y-6 text-lg text-white/80">
              <p>The default state of the Garden is simple: journals using shared tools, not revenue targets. Every journal begins in the Reading Room, and many will never need to leave it.</p>
              <p className="font-medium text-emerald-400">The Reading Room — Free, Forever.</p>
              <p>One active open call. 75 submissions per month. 3 staff logins. Full bloom pool access. 5 publication requests per month. All money tools ready if you choose to flick them on.</p>
              <p>You can remain a completely non-monetised, volunteer-run journal indefinitely. If you decide the labour deserves more than a moral glow, you move sideways into convenience.</p>
            </div>
          </div>
        </section>

        {/* XII. FINAL STATEMENT */}
        <section className="min-h-[60vh] flex items-center px-6 md:px-[12vw] py-24 fade-in">
          <div className="max-w-4xl">
            <h2 className="text-4xl md:text-6xl font-display italic mb-12">No writer should die unheard because the infrastructure never made a path between their private pages and the journals that would have loved them.</h2>
            <p className="text-xl font-display">The Garden is the path.</p>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-24 px-6 md:px-[12vw] border-t border-white/10 fade-in">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-display mb-4">Apply to join.</h2>
            <p className="text-white/60 mb-12">We are onboarding journals in waves to ensure the garden grows balanced. Tell us about your project.</p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="journalName">Journal Name</Label>
                  <Input
                    id="journalName"
                    required
                    value={formData.journalName}
                    onChange={e => setFormData({...formData, journalName: e.target.value})}
                    className="bg-transparent border-white/20 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Person</Label>
                  <Input
                    id="contactName"
                    required
                    value={formData.contactName}
                    onChange={e => setFormData({...formData, contactName: e.target.value})}
                    className="bg-transparent border-white/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="bg-transparent border-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={e => setFormData({...formData, website: e.target.value})}
                    className="bg-transparent border-white/20"
                    placeholder="https://"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="instagramHandle">Instagram</Label>
                  <Input
                    id="instagramHandle"
                    value={formData.instagramHandle}
                    onChange={e => setFormData({...formData, instagramHandle: e.target.value})}
                    className="bg-transparent border-white/20"
                    placeholder="@handle"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Founded</Label>
                  <Input
                    id="foundedYear"
                    value={formData.foundedYear}
                    onChange={e => setFormData({...formData, foundedYear: e.target.value})}
                    className="bg-transparent border-white/20"
                    placeholder="Year"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staffSize">Staff Size</Label>
                  <Input
                    id="staffSize"
                    value={formData.staffSize}
                    onChange={e => setFormData({...formData, staffSize: e.target.value})}
                    className="bg-transparent border-white/20"
                    placeholder="e.g. 3 editors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="genresFocus">Genres & Aesthetic Focus</Label>
                <Textarea
                  id="genresFocus"
                  required
                  placeholder="e.g. Experimental prose, hybrid forms, ecological poetry..."
                  value={formData.genresFocus}
                  onChange={e => setFormData({...formData, genresFocus: e.target.value})}
                  className="bg-transparent border-white/20 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whyTheGarden">Why The Garden?</Label>
                <Textarea
                  id="whyTheGarden"
                  required
                  placeholder="What drew you here? What are you hoping to find?"
                  value={formData.whyTheGarden}
                  onChange={e => setFormData({...formData, whyTheGarden: e.target.value})}
                  className="bg-transparent border-white/20 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editorialStatement">Editorial Philosophy</Label>
                <Textarea
                  id="editorialStatement"
                  required
                  placeholder="What are you looking for that you aren't finding?"
                  value={formData.editorialStatement}
                  onChange={e => setFormData({...formData, editorialStatement: e.target.value})}
                  className="bg-transparent border-white/20 min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="currentSubmissionPlatform">Current Submission Platform</Label>
                  <Input
                    id="currentSubmissionPlatform"
                    value={formData.currentSubmissionPlatform}
                    onChange={e => setFormData({...formData, currentSubmissionPlatform: e.target.value})}
                    className="bg-transparent border-white/20"
                    placeholder="e.g. Submittable, email, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="submissionsPerYear">Submissions Per Year</Label>
                  <Input
                    id="submissionsPerYear"
                    value={formData.submissionsPerYear}
                    onChange={e => setFormData({...formData, submissionsPerYear: e.target.value})}
                    className="bg-transparent border-white/20"
                    placeholder="Approximate number"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="paysContributors"
                  checked={formData.paysContributors}
                  onChange={e => setFormData({...formData, paysContributors: e.target.checked})}
                  className="w-4 h-4 accent-emerald-500"
                />
                <Label htmlFor="paysContributors" className="cursor-pointer">We currently pay contributors</Label>
              </div>

              {formData.paysContributors && (
                <div className="space-y-2">
                  <Label htmlFor="paymentNote">Payment Details</Label>
                  <Input
                    id="paymentNote"
                    value={formData.paymentNote}
                    onChange={e => setFormData({...formData, paymentNote: e.target.value})}
                    className="bg-transparent border-white/20"
                    placeholder="e.g. $50 per accepted piece"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-[#335B3B] text-white hover:bg-[#2a4d32] transition-all duration-300 py-6 text-lg"
              >
                {mutation.isPending ? 'Sending...' : 'Send Application'}
              </Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ForJournals;
