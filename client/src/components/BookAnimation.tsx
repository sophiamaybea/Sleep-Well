import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";

export default function BookAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const smoothScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 20 });

  // Scribbly Closed Book Paths (approximate)
  const closedBookPath = "M 180 100 Q 170 150 175 300 Q 180 400 250 420 Q 320 400 325 300 Q 330 150 320 100 Q 250 80 180 100 M 185 110 Q 250 90 315 110 M 180 100 Q 160 100 160 300 Q 160 400 175 420";
  
  // Scribbly Open Book Paths
  const leftPagePath = "M 250 420 Q 150 400 50 350 Q 40 150 50 100 Q 150 150 250 180";
  const rightPagePath = "M 250 420 Q 350 400 450 350 Q 460 150 450 100 Q 350 150 250 180";
  const spinePath = "M 250 180 Q 250 300 250 420";

  // Transforms
  const openProgress = useTransform(smoothScroll, [0, 0.2], [0, 1]);
  const bookScale = useTransform(smoothScroll, [0, 0.2], [1, 1.5]);
  const bookY = useTransform(smoothScroll, [0, 0.2], [0, 100]);
  const opacityClosed = useTransform(smoothScroll, [0, 0.1], [1, 0]);
  const opacityOpen = useTransform(smoothScroll, [0.05, 0.2], [0, 1]);
  
  const textOpacity = useTransform(smoothScroll, [0.15, 0.3], [0, 1]);
  const textY = useTransform(smoothScroll, [0.15, 0.3], [50, 0]);
  const textScale = useTransform(smoothScroll, [0.15, 0.3], [0.8, 1]);

  return (
    <div ref={containerRef} className="h-[200vh] w-full relative mb-[-100vh]">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Book Container */}
        <motion.div 
          style={{ scale: bookScale, y: bookY }}
          className="relative w-[500px] h-[500px] flex items-center justify-center"
        >
            {/* "Drawn by stars" effect: The strokes are dashed and glowing */}
            <svg viewBox="0 0 500 500" className="absolute w-full h-full overflow-visible">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Closed Book State */}
              <motion.g style={{ opacity: opacityClosed }}>
                 <motion.path
                   d={closedBookPath}
                   fill="transparent"
                   stroke="#ede9e3"
                   strokeWidth="2"
                   strokeLinecap="round"
                   strokeLinejoin="round"
                   filter="url(#glow)"
                   initial={{ pathLength: 0 }}
                   animate={{ pathLength: 1 }}
                   transition={{ duration: 2, ease: "easeInOut" }}
                   // The "Stars" effect on the line
                   strokeDasharray="4 6" 
                 />
                 {/* Floating Particles/Stars near the book */}
                 <motion.circle cx="175" cy="100" r="2" fill="#fff" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
                 <motion.circle cx="325" cy="300" r="1.5" fill="#fff" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
                 <motion.circle cx="250" cy="420" r="2" fill="#fff" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.5, repeat: Infinity }} />
              </motion.g>

              {/* Open Book State */}
              <motion.g style={{ opacity: opacityOpen }}>
                 <motion.path d={leftPagePath} fill="transparent" stroke="#ede9e3" strokeWidth="2" filter="url(#glow)" strokeDasharray="2 4" />
                 <motion.path d={rightPagePath} fill="transparent" stroke="#ede9e3" strokeWidth="2" filter="url(#glow)" strokeDasharray="2 4" />
                 <motion.path d={spinePath} fill="transparent" stroke="#ede9e3" strokeWidth="2" filter="url(#glow)" strokeDasharray="2 4" />
                 
                 {/* "Words" emerging as lines */}
                 <motion.line x1="100" y1="200" x2="200" y2="200" stroke="#ede9e3" strokeWidth="1" strokeDasharray="1 3" opacity="0.5" />
                 <motion.line x1="100" y1="220" x2="180" y2="220" stroke="#ede9e3" strokeWidth="1" strokeDasharray="1 3" opacity="0.5" />
                 <motion.line x1="300" y1="200" x2="400" y2="200" stroke="#ede9e3" strokeWidth="1" strokeDasharray="1 3" opacity="0.5" />
                 <motion.line x1="320" y1="220" x2="400" y2="220" stroke="#ede9e3" strokeWidth="1" strokeDasharray="1 3" opacity="0.5" />
              </motion.g>
            </svg>

            {/* The Text Emerging */}
            <motion.div 
              style={{ opacity: textOpacity, y: textY, scale: textScale }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pt-24"
            >
              <h1 className="font-display text-5xl md:text-7xl tracking-widest text-white mix-blend-screen drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                THE PAGE<br/>GALLERY
              </h1>
            </motion.div>
        </motion.div>

        <motion.div 
          style={{ opacity: useTransform(smoothScroll, [0, 0.1], [1, 0]) }}
          className="absolute bottom-12 font-mono text-xs tracking-widest opacity-50"
        >
          SCROLL TO OPEN
        </motion.div>
      </div>
    </div>
  );
}
