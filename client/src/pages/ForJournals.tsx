import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Footer } from '../components/Footer';
import { Navigation } from '../components/Navigation';

gsap.registerPlugin(ScrollTrigger);

export default function ForJournals() {
  const mainRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text animation
      gsap.from('.hero-text', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.1
      });

      // Section animations
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

  return (
    <div ref={mainRef} className="bg-[#0e0d0c] min-h-screen text-[#4a4844] font-body selection:bg-[#c9a96e] selection:text-[#0e0d0c]">
      <Navigation />
      
      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="px-6 md:px-12 max-w-4xl mx-auto mb-40">
          <div className="flex flex-col gap-4 mb-16">
            <span className="font-mono text-[9px] text-[#c9a96e] uppercase tracking-[0.3em] hero-text">
              The Critical Consciousness Engine
            </span>
            <h1 className="font-display text-5xl md:text-8xl text-[#c9a96e] leading-[1.1] hero-text">
              Institutional <br />
              Precision
            </h1>
          </div>
          
          <div className="max-w-2xl hero-text">
            <p className="text-xl md:text-2xl text-[#c9a96e] leading-relaxed italic font-display mb-12">
              "Zadie Smith’s complexity is not a performance. It is a surgical procedure. A removal of the redundant skin to expose the bone. We want to be the knife."
            </p>
            <p className="text-sm md:text-base leading-relaxed mb-8 opacity-80">
              The literary world is sick with a tumour. It has become a graveyard of interfaces that mask the terrifying void of the blank page. The Garden is a complete change to the landscape—not a submission manager, but a laboratory for the clinical observer.
            </p>
          </div>
        </section>

        {/* The System Section */}
        <SectionContainer index="01" label="The Architecture">
          <div className="grid md:grid-cols-2 gap-20 animate-section">
            <div>
              <h2 className="font-display text-4xl text-[#c9a96e] mb-8 leading-tight">A submission system that breathes.</h2>
              <p className="text-sm leading-relaxed mb-10 opacity-80">
                Most journals are buried under the weight of archaic software. We offer an all-in-one submission architecture that functions with the precision of a scalpel. This is for the work that is extremely sick with the truth. 
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-1 h-1 bg-[#c9a96e] mt-2" />
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#c9a96e] block mb-1">Zero Cost</span>
                    <p className="text-xs opacity-60">Journals do not pay anything. We remove the financial barrier to discovery.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-1 h-1 bg-[#c9a96e] mt-2" />
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#c9a96e] block mb-1">All Forms</span>
                    <p className="text-xs opacity-60">Architected for poetry, prose, short stories, and manuscripts.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border border-[#4a4844]/20 p-12 flex flex-col justify-center bg-[#0e0d0c]">
              <p className="font-display italic text-lg text-[#4a4844] leading-relaxed">
                "We are not here to facilitate 'content'. We are here to build the infrastructure for the obsessed."
              </p>
            </div>
          </div>
        </SectionContainer>

        {/* The Service Section */}
        <SectionContainer index="02" label="Custom Infrastructure">
          <div className="max-w-3xl animate-section">
            <h2 className="font-display text-4xl text-[#c9a96e] mb-10 leading-tight">Design as a moral imperative.</h2>
            <p className="text-sm leading-relaxed mb-12 opacity-80">
              For journals that require a physical presence in the digital ether, we offer two paths. You can be part of our group at no cost, or we can build a dedicated website, assisting with illustration and architectural design for a cost. 
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#4a4844]/20 border border-[#4a4844]/20">
              <div className="p-10 bg-[#0e0d0c]">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#c9a96e] block mb-4">The Group</span>
                <p className="text-xs opacity-60 leading-relaxed">Join the collective infrastructure. Free of charge. Integrated. Sterile. Precise.</p>
              </div>
              <div className="p-10 bg-[#0e0d0c]">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#c9a96e] block mb-4">Custom Build</span>
                <p className="text-xs opacity-60 leading-relaxed">Bespoke website design and illustration. At cost. We build the house you live in.</p>
              </div>
            </div>
          </div>
        </SectionContainer>

        {/* CTA Section */}
        <section className="px-6 md:px-12 py-40 text-center animate-section">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-3xl text-[#c9a96e] mb-12">Does your journal have the stomach for it?</h2>
            <a 
              href="/contact-editors" 
              className="inline-block px-14 py-5 border border-[#c9a96e] text-[#c9a96e] font-mono text-[10px] uppercase tracking-[0.4em] hover:bg-[#c9a96e] hover:text-[#0e0d0c] transition-all duration-500"
            >
              Request Access
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SectionContainer({
  children,
  index,
  label,
  bg = "bg-[#0e0d0c]"
}: {
  children: React.ReactNode;
  index: string;
  label: string;
  bg?: string;
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
