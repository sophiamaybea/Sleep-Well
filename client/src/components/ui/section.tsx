import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  fullHeight?: boolean;
}

export function Section({ children, className, id, fullHeight = true }: SectionProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0.95, 1, 1, 0.95]);

  return (
    <motion.section
      ref={ref}
      id={id}
      style={{ opacity, scale, position: "relative" }}
      className={cn(
        "relative w-full flex flex-col justify-center items-center px-6 py-24 md:px-12 lg:px-24 overflow-hidden",
        fullHeight && "min-h-screen",
        className
      )}
    >
      <div className="max-w-7xl w-full mx-auto relative z-10">
        {children}
      </div>
    </motion.section>
  );
}
