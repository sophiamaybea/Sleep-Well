import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "The Two Doors", href: "#two-doors" },
    { label: "Featured Works", href: "#featured" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Manifesto", href: "#manifesto" }
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 p-6 mix-blend-difference text-primary">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/">
          <a className="font-display font-medium text-2xl tracking-tight hover:opacity-70 transition-opacity italic">
            The Page Gallery Journal
          </a>
        </Link>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          {isOpen ? <X /> : <Menu />}
        </button>

        <div className="hidden lg:flex gap-8 font-mono text-xs uppercase tracking-widest">
          {menuItems.map((item, i) => (
            <a 
              key={item.label} 
              href={item.href}
              className="hover:text-white transition-colors opacity-70 hover:opacity-100"
            >
              {`0${i + 1} ${item.label}`}
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
                key={item.label} 
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="hover:text-white transition-colors opacity-70 hover:opacity-100"
              >
                {`0${i + 1} ${item.label}`}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
