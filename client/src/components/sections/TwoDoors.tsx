import { Section } from "@/components/ui/section";
import { content } from "@/data";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function TwoDoors() {
  return (
    <Section id="two-doors" className="bg-transparent text-primary">
      <div className="space-y-16 max-w-7xl w-full mx-auto">
        <div className="text-center space-y-4">
          <span className="font-mono text-xs tracking-[0.2em] opacity-60 block uppercase">
            01 — Choose Your Path
          </span>
          <h2 className="text-4xl md:text-6xl font-display italic font-light">
            {content.twoDoors.title}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-16">
          {content.twoDoors.doors.map((door, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg -z-10" />
              
              <div className="space-y-8 p-8 border border-white/5 rounded-lg h-full flex flex-col hover:border-white/20 transition-colors bg-background/40 backdrop-blur-md">
                <div className="space-y-2">
                  <span className="font-mono text-xs tracking-widest text-secondary uppercase block">
                    {door.subtitle}
                  </span>
                  <h3 className="text-3xl md:text-4xl font-display font-normal">
                    {door.title}
                  </h3>
                </div>

                <p className="text-lg opacity-80 leading-relaxed font-serif">
                  {door.description}
                </p>

                <ul className="space-y-4 flex-grow">
                  {door.points.map((point, i) => (
                    <li key={i} className="flex gap-4 items-start text-sm opacity-70 font-mono">
                      <span className="text-secondary opacity-50">✦</span>
                      {point}
                    </li>
                  ))}
                </ul>

                <a 
                  href={door.href}
                  className="inline-block w-full py-4 text-center border border-white/10 hover:bg-white hover:text-background transition-all font-mono text-xs uppercase tracking-widest mt-8"
                >
                  {door.cta} &rarr;
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
