import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    "Process",
    "Rhythm", 
    "Overclock",
    "Blue Light",
    "Layers",
    "Tips"
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 p-6 mix-blend-difference text-primary">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/">
          <a className="font-display font-bold text-xl tracking-tighter hover:opacity-70 transition-opacity">
            SLEEP WELL CREATIVES
          </a>
        </Link>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          {isOpen ? <X /> : <Menu />}
        </button>

        <div className="hidden lg:flex gap-8 font-mono text-sm uppercase tracking-widest">
          {menuItems.map((item, i) => (
            <a 
              key={item} 
              href={`#section-${i + 1}`}
              className="hover:text-white transition-colors opacity-70 hover:opacity-100"
            >
              {`0${i + 1} ${item}`}
            </a>
          ))}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-full left-0 w-full bg-background border-b border-primary/20 p-8 lg:hidden"
        >
          <div className="flex flex-col gap-6 font-mono text-lg uppercase">
            {menuItems.map((item, i) => (
              <a 
                key={item} 
                href={`#section-${i + 1}`}
                onClick={() => setIsOpen(false)}
                className="hover:text-white transition-colors opacity-70 hover:opacity-100"
              >
                {`0${i + 1} ${item}`}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
