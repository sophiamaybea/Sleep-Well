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
  tier: string;
}

export default function ForJournals() {
  const mainRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
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
    paymentNote: '',
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
      toast({
        title: 'Application submitted!',
        description: "We've received your inquiry and will be in touch soon.",
      });
      setShowForm(false);
      setFormData({
        journalName: '', contactName: '', email: '', website: '',
        instagramHandle: '', foundedYear: '', genresFocus: '',
        currentSubmissionPlatform: '', submissionsPerYear: '',
        staffSize: '', editorialStatement: '', whyTheGarden: '',
        paysContributors: false, paymentNote: '', tier: 'reading_room'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to submit. Please check your connection and try again.',
        variant: 'destructive'
      });
    }
  });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-text', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.1
      });

      const sections = gsap.utils.toArray('.animate-section');
      sections.forEach((section: any) => {
        gsap.from(section, {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
          }
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
            <span className="font-mono text-[9px] text-[#c9a96e] uppercase tracking-[0.3em] hero-text">
              The Garden: A Pitch to Literary Journals
            </span>
            <h1 className="font-display text-5xl md:text-8xl text-[#c9a96e] leading-[1.1] hero-text">
              This is not a<br/>better bucket for<br/>manuscripts.
            </h1>
            <p className="text-xl md:text-2xl text-[#c9a96e]/80 leading-relaxed italic font-display hero-text">
              It is a different organism entirely.
            </p>
          </div>
        </section>

        {/* Section I */}
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
            <p className="text-xl text-[#c9a96e] italic font-display">
              The Garden exists to change what you get to read.
            </p>
          </div>
        </SectionContainer>

        {/* Section II */}
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

        {/* Section IV */}
        <SectionContainer index="IV" label="THE DISCOVERY MECHANISM">
          <div className="max-w-3xl animate-section">
            <div className="space-y-8 mb-16">
              <div>
                <h3 className="text-[#c9a96e] text-sm mb-3 font-mono uppercase tracking-widest">Current literary reality:</h3>
                <p className="text-xs opacity-60 font-mono">Journals post calls → Writers come to journals → Journals choose from whoever arrives</p>
              </div>
              <div>
                <h3 className="text-[#c9a96e] text-sm mb-3 font-mono uppercase tracking-widest">Garden reality:</h3>
                <p className="text-xs opacity-60 font-mono">Writers write → Work matures → <strong className="text-[#c9a96e]">Journals go to the work</strong></p>
              </div>
            </div>
            <p className="text-sm leading-relaxed opacity-80">
              You browse the bloom pool: every piece a writer has marked as ready. You filter by form, length, tags. You send a publication request. The writer sees your profile and <em>then</em> decides whether to accept. The direction of power isn't reversed. It's finally balanced.
            </p>
          </div>
        </SectionContainer>

        {/* Section VI */}
        <SectionContainer index="VI" label="THE TIERS: OPTIONAL, HONEST, YOURS">
          <div className="max-w-3xl animate-section">
            <h2 className="font-display text-4xl text-[#c9a96e] mb-10">Journals do not have to pay to use the Garden.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#4a4844]/20 border border-[#4a4844]/20">
              <div className="p-10 bg-[#0e0d0c]">
                <h3 className="font-mono text-[9px] uppercase tracking-widest text-[#c9a96e] block mb-4">The Reading Room</h3>
                <p className="text-lg font-display text-[#c9a96e] mb-4">Free forever</p>
                <p className="text-xs opacity-60 leading-relaxed">1 active call. 75 submissions/month. Browse all blooms. 5 publication requests/month.</p>
              </div>
              <div className="p-10 bg-[#0e0d0c]">
                <h3 className="font-mono text-[9px] uppercase tracking-widest text-[#c9a96e] block mb-4">The Press</h3>
                <p className="text-lg font-display text-[#c9a96e] mb-4">£29/month</p>
                <p className="text-xs opacity-60 leading-relaxed">5 calls. Unlimited submissions. Blind review. Custom forms.</p>
              </div>
              <div className="p-10 bg-[#0e0d0c]">
                <h3 className="font-mono text-[9px] uppercase tracking-widest text-[#c9a96e] block mb-4">The House</h3>
                <p className="text-lg font-display text-[#c9a96e] mb-4">£79/month</p>
                <p className="text-xs opacity-60 leading-relaxed">Multi-imprint. White-label exports. API access.</p>
              </div>
            </div>
          </div>
        </SectionContainer>

        {/* Inquiry Form */}
        <section className="px-6 md:px-12 py-40 border-t border-[#4a4844]/10 bg-[#0e0d0c]" id="inquiry-form">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-20">
              <span className="font-mono text-[9px] text-[#c9a96e] uppercase tracking-[0.4em] mb-4 block">Join the Waitlist</span>
              <h2 className="font-display text-4xl md:text-6xl text-[#c9a96e]">Register Your Journal</h2>
            </div>

            {!showForm ? (
              <div className="text-center">
                <Button 
                  onClick={() => setShowForm(true)}
                  className="px-14 py-6 border border-[#c9a96e] text-[#c9a96e] font-mono text-[10px] uppercase tracking-[0.4em] hover:bg-[#c9a96e] hover:text-[#0e0d0c] transition-all duration-500 bg-transparent"
                >
                  Open Inquiry Form
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-16 animate-section">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <h3 className="font-mono text-[10px] text-[#4a4844] uppercase tracking-widest border-b border-[#4a4844]/20 pb-2">Identity</h3>
                    <div className="space-y-6">
                      <FormGroup label="Journal Name *">
                        <input required value={formData.journalName} onChange={e => setFormData({...formData, journalName: e.target.value})} className="form-input" />
                      </FormGroup>
                      <FormGroup label="Website">
                        <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://..." className="form-input" />
                      </FormGroup>
                      <FormGroup label="Instagram Handle">
                        <input value={formData.instagramHandle} onChange={e => setFormData({...formData, instagramHandle: e.target.value})} placeholder="@yourjournal" className="form-input" />
                      </FormGroup>
                      <FormGroup label="Founded Year">
                        <input value={formData.foundedYear} onChange={e => setFormData({...formData, foundedYear: e.target.value})} placeholder="e.g. 2024" className="form-input" />
                      </FormGroup>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="font-mono text-[10px] text-[#4a4844] uppercase tracking-widest border-b border-[#4a4844]/20 pb-2">Contact</h3>
                    <div className="space-y-6">
                      <FormGroup label="Contact Name *">
                        <input required value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} className="form-input" />
                      </FormGroup>
                      <FormGroup label="Professional Email *">
                        <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="form-input" />
                      </FormGroup>
                      <FormGroup label="Staff Size">
                        <input value={formData.staffSize} onChange={e => setFormData({...formData, staffSize: e.target.value})} placeholder="e.g. 3 editors" className="form-input" />
                      </FormGroup>
                    </div>
                  </div>
                </div>

                {/* Editorial Details */}
                <div className="space-y-8">
                  <h3 className="font-mono text-[10px] text-[#4a4844] uppercase tracking-widest border-b border-[#4a4844]/20 pb-2">Editorial</h3>
                  <div className="grid md:grid-cols-2 gap-12">
                    <FormGroup label="Primary Genres Focus *">
                      <input required value={formData.genresFocus} onChange={e => setFormData({...formData, genresFocus: e.target.value})} placeholder="e.g. Poetry, Experimental Fiction" className="form-input" />
                    </FormGroup>
                    <FormGroup label="Current Submission Platform">
                      <input value={formData.currentSubmissionPlatform} onChange={e => setFormData({...formData, currentSubmissionPlatform: e.target.value})} placeholder="e.g. Submittable, Email" className="form-input" />
                    </FormGroup>
                    <FormGroup label="Submissions Per Year">
                      <input value={formData.submissionsPerYear} onChange={e => setFormData({...formData, submissionsPerYear: e.target.value})} placeholder="e.g. ~500" className="form-input" />
                    </FormGroup>
                  </div>
                  
                  <div className="space-y-12 mt-12">
                    <FormGroup label="Editorial Statement *" sublabel="What are you looking for in the work you publish?">
                      <textarea required value={formData.editorialStatement} onChange={e => setFormData({...formData, editorialStatement: e.target.value})} rows={5} className="form-textarea" />
                    </FormGroup>
                    <FormGroup label="Why The Garden? *" sublabel="How do you hope a living writing environment will change your process?">
                      <textarea required value={formData.whyTheGarden} onChange={e => setFormData({...formData, whyTheGarden: e.target.value})} rows={5} className="form-textarea" />
                    </FormGroup>
                  </div>
                </div>

                {/* Logistics */}
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <h3 className="font-mono text-[10px] text-[#4a4844] uppercase tracking-widest border-b border-[#4a4844]/20 pb-2">Logistics</h3>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setFormData({...formData, paysContributors: !formData.paysContributors})}>
                        <div className={`w-5 h-5 border border-[#c9a96e] flex items-center justify-center transition-colors ${formData.paysContributors ? 'bg-[#c9a96e]' : 'bg-transparent'}`}>
                          {formData.paysContributors && <div className="w-2 h-2 bg-[#0e0d0c]" />}
                        </div>
                        <span className="text-xs text-[#c9a96e] uppercase tracking-widest">We pay contributors</span>
                      </div>
                      
                      {formData.paysContributors && (
                        <FormGroup label="Payment Details" sublabel="Briefly describe your payment structure.">
                          <input value={formData.paymentNote} onChange={e => setFormData({...formData, paymentNote: e.target.value})} placeholder="e.g. £20 per poem" className="form-input" />
                        </FormGroup>
                      )}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="font-mono text-[10px] text-[#4a4844] uppercase tracking-widest border-b border-[#4a4844]/20 pb-2">Interest Tier</h3>
                    <FormGroup label="Select Potential Tier">
                      <select 
                        value={formData.tier} 
                        onChange={e => setFormData({...formData, tier: e.target.value})}
                        className="w-full bg-[#0e0d0c] border border-[#4a4844]/20 p-3 text-[#c9a96e] focus:border-[#c9a96e] outline-none font-mono text-xs uppercase tracking-widest appearance-none cursor-pointer"
                      >
                        <option value="reading_room">The Reading Room (Free)</option>
                        <option value="press">The Press (£29/mo)</option>
                        <option value="house">The House (£79/mo)</option>
                      </select>
                    </FormGroup>
                  </div>
                </div>

                <div className="pt-12">
                  <Button 
                    type="submit" 
                    disabled={mutation.isPending} 
                    className="w-full py-8 bg-[#c9a96e] text-[#0e0d0c] font-mono text-[11px] uppercase tracking-[0.5em] hover:bg-[#d4b985] transition-colors disabled:opacity-50"
                  >
                    {mutation.isPending ? 'Planting Inquiry...' : 'Submit Register of Interest'}
                  </Button>
                  <p className="text-[9px] text-center mt-6 opacity-40 uppercase tracking-widest font-mono">
                    Submitting an inquiry does not constitute a contract or financial commitment.
                  </p>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Section VII */}
        <section className="px-6 md:px-12 max-w-3xl mx-auto mb-40 animate-section">
          <h2 className="font-display text-4xl text-[#c9a96e] mb-8 leading-tight italic">
            "This is not a nicer slush pile. It is a system built on one non-negotiable belief: No writer should die unheard because the infrastructure never made a path between their private pages and the journals that would have loved them."
          </h2>
          <p className="text-xl text-[#c9a96e] font-display text-right">— The Garden</p>
        </section>
      </main>
      <Footer />

      {/* Internal Styles for Form */}
      <style>{`
        .form-input {
          width: 100%;
          background: #0e0d0c;
          border: 1px solid rgba(74, 72, 68, 0.2);
          padding: 0.85rem;
          color: #c9a96e;
          outline: none;
          transition: border-color 0.3s ease;
          font-size: 0.85rem;
        }
        .form-input:focus {
          border-color: #c9a96e;
        }
        .form-textarea {
          width: 100%;
          background: #0e0d0c;
          border: 1px solid rgba(74, 72, 68, 0.2);
          padding: 1rem;
          color: #c9a96e;
          outline: none;
          transition: border-color 0.3s ease;
          font-size: 0.85rem;
          line-height: 1.6;
          resize: vertical;
        }
        .form-textarea:focus {
          border-color: #c9a96e;
        }
        ::placeholder {
          color: rgba(201, 169, 110, 0.3);
        }
      `}</style>
    </div>
  );
}

function FormGroup({ label, sublabel, children }: { label: string; sublabel?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block font-mono text-[9px] text-[#c9a96e] uppercase tracking-[0.2em]">{label}</label>
      {sublabel && <p className="text-[10px] text-[#4a4844] italic mb-2">{sublabel}</p>}
      {children}
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
