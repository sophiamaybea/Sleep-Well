import { motion, useScroll, useTransform, useSpring, useMotionTemplate } from "framer-motion";
import { useRef } from "react";

export default function BookAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const smoothScroll = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });

  // 1. SCROLL RANGES
  // 0.0 - 0.3: Book is closed, static or slightly breathing
  // 0.3 - 0.6: Book opens (transitions from closed shape to open shape)
  // 0.6 - 0.8: Text emerges
  // 0.8 - 1.0: Fade out / Scroll away

  const bookY = useTransform(smoothScroll, [0, 0.2], [0, 50]);
  const bookScale = useTransform(smoothScroll, [0, 0.4], [0.8, 1.2]);
  
  // Opacity Crossfade
  const opacityClosed = useTransform(smoothScroll, [0.25, 0.35], [1, 0]);
  const opacityOpen = useTransform(smoothScroll, [0.25, 0.35], [0, 1]);
  const openBookScale = useTransform(smoothScroll, [0.3, 0.6], [0.8, 1]);
  
  // Text Reveal
  const textOpacity = useTransform(smoothScroll, [0.5, 0.7], [0, 1]);
  const textY = useTransform(smoothScroll, [0.5, 0.7], [20, 0]);
  const textBlur = useTransform(smoothScroll, [0.5, 0.7], ["10px", "0px"]);

  // --- SVG PATHS ---
  // A vertical closed book
  const closedBookPath = `
    M 220 100 
    L 280 100 
    Q 290 100 290 110 
    L 290 390 
    Q 290 400 280 400 
    L 220 400 
    Q 210 400 210 390 
    L 210 110 
    Q 210 100 220 100 Z
    M 230 100 L 230 400
  `; // Spine detail

  // An open book (two pages)
  const openBookPathLeft = `
    M 250 400 
    Q 150 420 50 380 
    L 50 120 
    Q 150 160 250 140 
    Z
  `;
  const openBookPathRight = `
    M 250 400 
    Q 350 420 450 380 
    L 450 120 
    Q 350 160 250 140 
    Z
  `;
  const spineOpen = `M 250 140 L 250 400`;

  // "Inky" Lines (Lines of text on the page)
  const textLinesLeft = [
    "M 70 180 Q 150 200 230 190",
    "M 70 210 Q 150 230 230 220",
    "M 70 240 Q 150 260 230 250",
    "M 70 270 Q 150 290 180 280"
  ];
  const textLinesRight = [
    "M 270 190 Q 350 210 430 180",
    "M 270 220 Q 350 240 430 210",
    "M 270 250 Q 350 270 430 240",
    "M 270 280 Q 350 300 380 270"
  ];

  return (
    <div ref={containerRef} className="h-[350vh] w-full relative mb-[-50vh]">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden pointer-events-none">
        
        {/* Main Book SVG Container */}
        <motion.div 
          style={{ y: bookY, scale: bookScale }}
          className="relative w-[500px] h-[500px] flex items-center justify-center"
        >
          <svg viewBox="0 0 500 500" className="absolute w-full h-full overflow-visible drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <defs>
              <filter id="ink-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* --- CLOSED STATE --- */}
            <motion.g style={{ opacity: opacityClosed }}>
              <motion.path 
                d={closedBookPath}
                fill="transparent"
                stroke="#ede9e3"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#ink-glow)"
                strokeDasharray="3 4" // Dashed "starry" look
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              {/* Some decorative "stars" on the cover */}
              <motion.circle cx="250" cy="200" r="1.5" fill="#fff" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, repeat: Infinity }} />
              <motion.circle cx="250" cy="250" r="1" fill="#fff" animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
              <motion.circle cx="250" cy="300" r="1.5" fill="#fff" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 4, repeat: Infinity }} />
            </motion.g>

            {/* --- OPEN STATE --- */}
            <motion.g style={{ opacity: opacityOpen, scale: openBookScale, originX: 0.5, originY: 0.5 }}>
              {/* Pages Outline */}
              <path d={openBookPathLeft} fill="transparent" stroke="#ede9e3" strokeWidth="2" filter="url(#ink-glow)" strokeDasharray="500" strokeDashoffset="0" />
              <path d={openBookPathRight} fill="transparent" stroke="#ede9e3" strokeWidth="2" filter="url(#ink-glow)" strokeDasharray="500" strokeDashoffset="0" />
              <path d={spineOpen} fill="transparent" stroke="#ede9e3" strokeWidth="2" filter="url(#ink-glow)" strokeDasharray="2 4" />

              {/* Emerging Text Lines (Scribbles) */}
              {textLinesLeft.map((d, i) => (
                <motion.path 
                  key={`l-${i}`} 
                  d={d} 
                  fill="transparent" 
                  stroke="#ede9e3" 
                  strokeWidth="1.5" 
                  strokeDasharray="2 4" 
                  opacity="0.4"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                />
              ))}
              {textLinesRight.map((d, i) => (
                <motion.path 
                  key={`r-${i}`} 
                  d={d} 
                  fill="transparent" 
                  stroke="#ede9e3" 
                  strokeWidth="1.5" 
                  strokeDasharray="2 4" 
                  opacity="0.4"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ delay: 0.8 + (i * 0.1), duration: 1 }}
                />
              ))}
              
              {/* Magic Particles emitting from center */}
              <motion.circle cx="250" cy="250" r="30" fill="transparent" stroke="#fff" strokeWidth="0.5" opacity="0.1" animate={{ scale: [0.8, 1.5], opacity: [0.1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
            </motion.g>
          </svg>

          {/* THE TITLE REVEAL */}
          <motion.div 
            style={{ opacity: textOpacity, y: textY, filter: useMotionTemplate`blur(${textBlur})` }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-[800px]"
          >
            <h1 className="font-display text-6xl md:text-8xl tracking-widest text-white mix-blend-overlay drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]">
              THE PAGE<br/>GALLERY
            </h1>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          style={{ opacity: useTransform(smoothScroll, [0, 0.1], [1, 0]) }}
          className="absolute bottom-24 font-mono text-[10px] tracking-[0.3em] opacity-40 animate-pulse"
        >
          SCROLL TO OPEN
        </motion.div>
      </div>
    </div>
  );
}
