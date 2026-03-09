import { usePageMeta } from "@/hooks/usePageMeta";
import { useSiteContent } from "@/hooks/useSiteContent";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StarBackground from "@/components/StarBackground";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function GardenInfo() {
  usePageMeta({ title: "The Garden", description: "A writing space for the life before the work is finished.", canonicalPath: "/garden-info" });
  const { getContent } = useSiteContent("garden-info");

  return (
    <div className="min-h-screen bg-transparent text-foreground selection:bg-secondary selection:text-background relative">
      <StarBackground />
      <Navigation />

      <main id="main-content" className="relative z-10">
        <section className="py-24 md:py-32 px-6 md:px-12" data-testid="section-garden-info">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6 mb-20"
            >
              <h1
                className="text-4xl md:text-6xl font-display font-light tracking-normal italic"
                data-testid="garden-info-title"
              >
                {getContent("title", "The Garden")}
              </h1>
              <p className="font-serif text-xl text-white/50 leading-relaxed italic">
                {getContent("subtitle", "A writing space for the life before the work is finished.")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="space-y-8 mb-20"
            >
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-[#6b8f71]" />
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#6b8f71]">Submitting</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-light tracking-normal italic text-white/90" data-testid="text-submitting-heading">
                {getContent("submitting-title", "Submitting")}
              </h2>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                {getContent("submitting-desc", "There is no submission form. When you write in The Garden, you are already submitting. Our editors move through the same space you do, reading as the work grows. If something jumps out — a fragment, a draft, a sentence that refuses to sit still — it may be invited for publication in The Page Gallery. You don't need to prepare anything or flag anything. Just write.")}
              </p>

              <div className="py-4">
                <Link
                  href="/garden"
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-[#4a7c59] hover:bg-[#3d6a4b] text-[#f0eeea] transition-all duration-500 font-mono text-xs uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(74,124,89,0.2)] hover:shadow-[0_0_35px_rgba(74,124,89,0.35)]"
                  data-testid="link-enter-garden"
                >
                  Enter the Garden
                </Link>
              </div>

              <p className="font-serif text-lg text-white/75 leading-relaxed">
                We also publish submission calls through The Garden from time to time, when an issue is taking shape around a particular thread. These will appear in your garden when they're live.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="space-y-8 mb-20"
            >
              <h2 className="text-2xl md:text-3xl font-display font-light tracking-normal italic text-white/90">
                {getContent("about-title", "About The Garden")}
              </h2>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                {getContent("about-desc", "There is a specific gesture that every literary platform performs and nobody mentions. The gesture is this: a text field, a word count, a submit button. Sometimes there is a cover letter box. Sometimes a dropdown menu for genre. The infrastructure communicates, with the plain efficiency of a customs desk, that writing is a thing you produce elsewhere and then deposit here. The platform receives. The writer delivers. Between those two actions — the making and the handing over — is the entire creative life, and no platform has ever been interested in it. They want the parcel. They have no use for the hands.")}
              </p>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                This is the thing about The Garden: it is interested in the hands.
              </p>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                The idea is that writing's most important life happens before it is presentable, and that every tool we have built for writers — every journal, platform, app, portal — systematically ignores that life in favour of the moment it ends. The Garden exists for the life before.
              </p>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                The Garden will be free. Not free as a promotional period. Free as a founding condition — because the thing it protects, the unperformed inner life of a writer, should not require a subscription.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="space-y-8 mb-20"
            >
              <h2 className="text-2xl md:text-3xl font-display font-light tracking-normal italic text-white/90">
                {getContent("garden-gallery-title", "The Garden and The Page Gallery")}
              </h2>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                {getContent("garden-gallery-desc", "The Garden and The Page Gallery are two separate worlds with a door between them.")}
              </p>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                The Gallery is a stage. The lights are chosen. The curation is careful. Finished work stands up straight there, held in context. The Garden is everything that happens before a piece survives long enough to walk out under those lights.
              </p>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                In the Garden, each writer tends a private landscape of text: notes, drafts, fragments, proto-essays, marginalia, obsessive lists, forms that refuse to declare their genre. Pieces exist in states — seed, sprout, bloom — because most writing is not finished; it is interrupted. There are no character limits. No public metrics. No like counts, share counts, follower tallies, or trending indicators. A seed can sit for six months without the system penalising it for underperforming. The only numbers a writer sees are reflective: the topics they keep circling, the drafts they revisit, the tags that keep magnetising each other across time.
              </p>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                Connection replaces chronology. A line tagged grief, mothers, sea can quietly pull a paragraph written four months later into orbit, and the writer discovers they have been writing the same tidal thought all year without knowing it. The system can surface that pattern. It cannot have the recognition for you.
              </p>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                The Gallery is where work is exhibited. The Garden is where we, and our writers, live.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="space-y-8 mb-20"
            >
              <h2 className="text-2xl md:text-3xl font-display font-light tracking-normal italic text-white/90">
                {getContent("digital-title", "Digital Gardening")}
              </h2>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                {getContent("digital-desc", "Digital gardening, as Maggie Appleton has documented it, is the practice of maintaining a collection of evolving, interlinked notes that refuses the time-stamp logic of the feed. Where the stream shows you only the zeitgeist of the last twenty-four hours and is not designed to accumulate knowledge or mature over time, the garden grows slowly, connects by association, and treats the unfinished as a feature rather than a defect.")}
              </p>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                But digital gardening has remained, until now, largely a practice for technologists and knowledge workers — people whose primary material is information. The Garden takes the ethos and builds it for people whose primary material is language. Paragraphs, lineated fragments, essays, poems, marginalia. The difference matters. A knowledge worker's garden organises information toward eventual use. A writer's garden holds language in states of becoming, with no guarantee of use, and the absence of that guarantee is the point.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="space-y-8 mb-20"
            >
              <h2 className="text-2xl md:text-3xl font-display font-light tracking-normal italic text-white/90">
                {getContent("how-title", "How It Works")}
              </h2>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                Every design choice refuses the stream:
              </p>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                Writing as native medium. Text is the primary species. Rich-text features serve thinking: footnotes, comments to self, branching versions. The interface does not try to look like a magazine. It looks like a notebook that remembers what you wrote last winter.
              </p>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                Private, reflective metrics. No public growth dashboards. Only mirrors: you have spent ten hours this month revisiting drafts about labour; you have not returned to that October piece in eight months; this tag cluster appears every time you write about your mother.
              </p>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                Community without spectacle. Sharing is tiered — private, trusted circle, public. Responses are marginalia, not quote-tweets. Group sizes are capped. A conversation between twelve people is a conversation. A conversation between twelve hundred is a broadcast with a comments section.
              </p>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                Tools for slow thinking. A reading queue you can actually finish. Quiet hours where you can write but not browse. Automatic connection suggestions that support your pattern of attention without replacing it.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="space-y-8 mb-20"
            >
              <h2 className="text-2xl md:text-3xl font-display font-light tracking-normal italic text-white/90">
                {getContent("metric-title", "The Only Metric")}
              </h2>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                {getContent("metric-desc", "The Garden draws one line: is this generative for the person making it?")}
              </p>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                That is the only metric. Not whether it performs well. Not whether it is vulnerable on schedule. Whether it is alive for its maker.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-2xl md:text-3xl font-display font-light tracking-normal italic text-white/90">
                {getContent("what-for-title", "What The Garden Is For")}
              </h2>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                {getContent("manifesto", "This is a bet that the most important part of a creative life is the part no one sees. The years of fragments. The ideas that never became pieces. The daily rotation through mediocrity, the dogged returning, the slow accumulation of connections only you could have made because only you were paying that particular quality of attention to that particular set of obsessions for that particular duration of time. That is not the preamble to the work. That is the work.")}
              </p>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                The Page Gallery will continue to be the room where finished pieces stand in clean light. The Garden will be the terrain underneath: overgrown, uneven, full of false starts, and therefore accurate. Every feature — from private analytics to the way submissions are managed to the refusal of public engagement metrics — is an attempt to give institutional shape to something that has always been treated as private and disposable: the mind in the act of making.
              </p>
              <p className="font-serif text-lg text-white/75 leading-relaxed">
                Not a feed, but a garden. Not a brand, but a consciousness. Not a chart, but the one thing a chart was never built to measure — which is, in the end, the only thing worth building for.
              </p>
            </motion.div>

          </div>
        </section>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
