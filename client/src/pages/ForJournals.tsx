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
  const weatherRef = useRef<HTMLDivElement>(null);
  const heroRainRef = useRef<HTMLDivElement>(null);
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
      // Fade in sections
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

      // Weather transition logic based on scroll
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const progress = self.progress;
          // Weather gradient opacity shift
          if (weatherRef.current) {
            const eased = progress * progress * (3 - 2 * progress);
            weatherRef.current.style.opacity = (0.12 + eased * 0.72).toString();
          }
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div ref={containerRef} className=\"min-h-screen text-[#f5f0e8] bg-[#040609] relative overflow-hidden\">
      {/* Weather & Background Layers */}
      <div className=\"fixed inset-[-10vh] pointer-events-none z-[-1] opacity-10 bg-[linear-gradient(rgba(211,232,244,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(211,232,244,0.16)_1px,transparent_1px)] bg-[size:2px_40px,40px_2px] animate-[rainShift_22s_linear_infinite]\" />
      <div ref={weatherRef} className=\"fixed inset-[-10vh] pointer-events-none z-[-1] opacity-0 transition-opacity duration-1000 bg-[radial-gradient(circle_at_10%_0%,rgba(116,165,214,0.25),transparent_55%),radial-gradient(circle_at_90%_100%,rgba(94,163,138,0.35),transparent_60%)]\" />
      
      <Navigation />

      <main className=\"relative z-10\">
        {/* I. WHAT YOU HAVE BEEN CALLING SUBMISSIONS */}
        <section className=\"min-h-screen flex flex-col justify-center px-[12vw] py-24 fade-in\">
          <div className=\"max-w-4xl\">
            <span className=\"font-sans text-[0.7rem] tracking-[0.18em] uppercase text-[#f5f0e8]/40 mb-4 block\">Section I</span>
            <h1 className=\"text-4xl md:text-6xl font-serif mb-8 leading-tight italic\">This is not a better bucket for manuscripts.<br/>It is a different organism entirely.</h1>
            <div className=\"space-y-6 text-lg leading-relaxed\">
              <p>You know this choreography. You post an open call. A platform receives the file. You read from whatever happened to arrive during that window and call it discovery.</p>
              <p>The system works. Which is the problem. Because what it selects for is not talent. It’s stamina.</p>
              <p className=\"font-serif italic border-l border-[#f5f0e8]/20 pl-6\">You are not reading literature’s best offer. You are reading what survived the infrastructure.</p>
            </div>
          </div>
        </section>

        {/* VI. THE PART WHERE EVERYONE PRETENDS MONEY DOESN’T EXIST */}
        <section className=\"min-h-screen flex flex-col justify-center px-[12vw] py-24 bg-gradient-to-b from-transparent to-[#0e1724]/40 border-y border-[#f5f0e8]/10 fade-in\">
          <div className=\"grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-16 items-start\">
            <div className=\"space-y-8\">
              <span className=\"font-sans text-[0.7rem] tracking-[0.18em] uppercase text-[#f5f0e8]/40 mb-4 block\">Section VI</span>
              <h2 className=\"text-3xl md:text-5xl font-serif\">The labour no one pays for.</h2>
              <div className=\"space-y-6 text-lg\">
                <p>You run a journal the way other people run small religions: unpaid, devout, and slightly deranged. The hours go into the inbox. The money, when it appears, goes to the printer, the domain registrar, the platform that charges you for the privilege of reading other people’s grief.</p>
                <p>The Garden does not fix that. It does something meaner and more precise: it removes the infrastructural excuse.</p>
                
                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6 mt-12\">
                  <div className=\"p-6 rounded-2xl border border-[#f5f0e8]/20 bg-[#091019]/80 shadow-2xl\">
                    <h3 className=\"text-base uppercase tracking-widest text-[#f5f0e8]/60 mb-2\">Channel I</h3>
                    <p className=\"font-serif\">Reading fees without the tithe. You set a fee. You keep 85%.</p>
                  </div>
                  <div className=\"p-6 rounded-2xl border border-[#f5f0e8]/20 bg-[#091019]/80 shadow-2xl\">
                    <h3 className=\"text-base uppercase tracking-widest text-[#f5f0e8]/60 mb-2\">Channel II</h3>
                    <p className=\"font-serif\">Donations without the cult. You keep 90%.</p>
                  </div>
                  <div className=\"p-6 rounded-2xl border border-[#f5f0e8]/20 bg-[#091019]/80 shadow-2xl\">
                    <h3 className=\"text-base uppercase tracking-widest text-[#f5f0e8]/60 mb-2\">Channel III</h3>
                    <p className=\"font-serif\">Workshops without admin hell. You keep 85%.</p>
                  </div>
                  <div className=\"p-6 rounded-2xl border border-[#f5f0e8]/20 bg-[#091019]/80 shadow-2xl\">
                    <h3 className=\"text-base uppercase tracking-widest text-[#f5f0e8]/60 mb-2\">Channel IV</h3>
                    <p className=\"font-serif\">Digital issues as quiet engine. You keep 80%.</p>
                  </div>
                </div>
              </div>
            </div>
            <aside className=\"font-sans text-sm text-[#f5f0e8]/70 border-l border-[#f5f0e8]/20 pl-8 space-y-4\">
              <p>We built the Garden because we ran a journal and watched it eat every spare hour. The only people getting paid were the platforms that called our work a “use case.”</p>
              <div className=\"p-4 rounded-xl border border-dashed border-[#f5f0e8]/30 bg-[#091019]/50\">
                <p className=\"font-medium mb-2\">Example Annual Flow:</p>
                <div className=\"flex justify-between text-xs mb-1\"><span>Reading Fees</span><span>£850</span></div>
                <div className=\"flex justify-between text-xs mb-1\"><span>Workshops</span><span>£1,339</span></div>
                <div className=\"flex justify-between text-xs mb-1\"><span>Donations</span><span>£810</span></div>
                <div className=\"border-t border-[#f5f0e8]/20 pt-2 flex justify-between font-bold\"><span>Total</span><span>£2,999</span></div>
              </div>
            </aside>
          </div>
        </section>

        {/* VII. TIERS WITHOUT STRINGS ATTACHED */}
        <section className=\"py-24 px-[12vw] fade-in\">
          <div className=\"max-w-3xl space-y-8\">
            <span className=\"font-sans text-[0.7rem] tracking-[0.18em] uppercase text-[#f5f0e8]/40 mb-4 block\">Section VII</span>
            <h2 className=\"text-3xl md:text-5xl font-serif\">Staying small, staying serious.</h2>
            <div className=\"space-y-6 text-lg\">
              <p>The default state of the Garden is simple: journals using shared tools, not revenue targets. Every journal begins in the Reading Room, and many will never need to leave it.</p>
              <p className=\"font-medium text-[#5ea38a]\">The Reading Room — Free, Forever.</p>
              <p>One active open call. 75 submissions/month. 3 staff logins. Full bloom pool access. 5 publication requests/month. All money tools ready if you choose to flick them on.</p>
              <p>You can remain a completely non-monetised, volunteer-run journal indefinitely. If you decide the labour deserves more than a moral glow, you move sideways into convenience.</p>
            </div>
          </div>
        </section>

        {/* XII. FINAL STATEMENT */}
        <section className=\"min-h-[60vh] flex items-center px-[12vw] py-24 fade-in\">
          <div className=\"max-w-4xl\">
            <h2 className=\"text-4xl md:text-6xl font-serif italic mb-12\">No writer should die unheard because the infrastructure never made a path between their private pages and the journals that would have loved them.</h2>
            <p className=\"text-xl font-serif\">The Garden is the path.</p>
          </div>
        </section>

        {/* Application Form */}
        <section className=\"py-24 px-[12vw] bg-[#091019]/50 border-t border-[#f5f0e8]/10 fade-in\">
          <div className=\"max-w-2xl\">
            <h2 className=\"text-3xl font-serif mb-4\">Apply to join.</h2>
            <p className=\"text-[#f5f0e8]/60 mb-12\">We're onboarding journals in waves to ensure the garden grows balanced. Tell us about your project.</p>
            
            <form onSubmit={handleSubmit} className=\"space-y-8\">
              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-8\">
                <div className=\"space-y-2\">
                  <Label htmlFor=\"journalName\">Journal Name</Label>
                  <Input 
                    id=\"journalName\"
                    required
                    value={formData.journalName}
                    onChange={e => setFormData({...formData, journalName: e.target.value})}
                    className=\"bg-transparent border-[#f5f0e8]/20 focus:border-[#5ea38a]\"
                  />
                </div>
                <div className=\"space-y-2\">
                  <Label htmlFor=\"contactName\">Contact Person</Label>
                  <Input 
                    id=\"contactName\"
                    required
                    value={formData.contactName}
                    onChange={e => setFormData({...formData, contactName: e.target.value})}
                    className=\"bg-transparent border-[#f5f0e8]/20\"
                  />
                </div>
              </div>

              <div className=\"space-y-2\">
                <Label htmlFor=\"email\">Email</Label>
                <Input 
                  id=\"email\"
                  type=\"email\"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className=\"bg-transparent border-[#f5f0e8]/20\"
                />
              </div>

              <div className=\"space-y-2\">
                <Label htmlFor=\"genresFocus\">Genres & Aesthetic Focus</Label>
                <Textarea 
                  id=\"genresFocus\"
                  required
                  placeholder=\"e.g. Experimental prose, hybrid forms, ecological poetry...\"
                  value={formData.genresFocus}
                  onChange={e => setFormData({...formData, genresFocus: e.target.value})}
                  className=\"bg-transparent border-[#f5f0e8]/20 min-h-[100px]\"
                />
              </div>

              <div className=\"space-y-2\">
                <Label htmlFor=\"editorialStatement\">Editorial Philosophy</Label>
                <Textarea 
                  id=\"editorialStatement\"
                  required
                  placeholder=\"What are you looking for that you aren't finding?\"
                  value={formData.editorialStatement}
                  onChange={e => setFormData({...formData, editorialStatement: e.target.value})}
                  className=\"bg-transparent border-[#f5f0e8]/20 min-h-[120px]\"
                />
              </div>

              <Button 
                type=\"submit\" 
                disabled={mutation.isPending}
                className=\"w-full bg-[#f5f0e8] text-[#040609] hover:bg-[#5ea38a] hover:text-white transition-all duration-300 py-6 text-lg\"
              >
                {mutation.isPending ? 'Sending...' : 'Send Application'}
              </Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
      
      <style jsx global>{`
        @keyframes rainShift {
          from { transform: translateY(-40px); }
          to { transform: translateY(40px); }
        }
      `}</style>
    </div>
  );
};

export default ForJournals;
