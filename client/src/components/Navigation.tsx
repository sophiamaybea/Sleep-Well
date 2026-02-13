import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, PenLine } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems: { label: string; href: string; isPage?: boolean }[] = [
    { label: "The Two Doors", href: "#two-doors" },
    { label: "Read the Journal", href: "/gallery", isPage: true },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Manifesto", href: "#manifesto" }
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <Link href="/" className="relative group">
            <span className="font-display font-medium text-2xl tracking-tight italic mix-blend-difference text-white">
              The Page Gallery Journal
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
          </Link>

          <div className={`hidden lg:flex items-center gap-8 font-mono text-xs uppercase tracking-widest transition-all duration-500 ${scrolled ? 'bg-white/5 backdrop-blur-md px-8 py-3 rounded-full border border-white/10' : ''}`}>
            {menuItems.map((item) =>
              item.isPage ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-white/70 hover:text-white transition-colors relative group"
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-1/2 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full group-hover:left-0" />
                </Link>
              ) : (
                <a 
                  key={item.label} 
                  href={item.href}
                  className="text-white/70 hover:text-white transition-colors relative group"
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-1/2 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full group-hover:left-0" />
                </a>
              )
            )}
            <span className="w-[1px] h-4 bg-white/10" />
            {!isLoading && (
              isAuthenticated ? (
                <>
                  <Link href="/garden" className="text-white/70 hover:text-white transition-colors flex items-center gap-2" data-testid="nav-garden">
                    <PenLine size={14} />
                    My Garden
                  </Link>
                  <a href="/api/logout" className="text-white/70 hover:text-white transition-colors flex items-center gap-2" data-testid="nav-logout">
                    <LogOut size={14} />
                    Logout
                  </a>
                </>
              ) : (
                <a href="/api/login" className="text-white/70 hover:text-white transition-colors flex items-center gap-2" data-testid="nav-login">
                  <User size={14} />
                  Sign In
                </a>
              )
            )}
          </div>

          <button 
            onClick={() => setIsOpen(true)}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors mix-blend-difference"
          >
            <Menu />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#0b101a]/95 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 p-2 text-white/50 hover:text-white transition-colors"
            >
              <X size={32} />
            </button>

            <div className="flex flex-col gap-8 text-center">
              {menuItems.map((item, i) =>
                item.isPage ? (
                  <motion.div
                    key={item.label}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="font-display text-4xl text-white/80 hover:text-white italic hover:scale-105 transition-transform"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ) : (
                <motion.a 
                  key={item.label} 
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="font-display text-4xl text-white/80 hover:text-white italic hover:scale-105 transition-transform"
                >
                  {item.label}
                </motion.a>
                )
              )}
              <div className="w-12 h-[1px] bg-white/10 mx-auto my-4" />
              {!isLoading && (
                isAuthenticated ? (
                  <>
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                      <Link href="/garden" onClick={() => setIsOpen(false)} className="font-display text-4xl text-white/80 hover:text-white italic hover:scale-105 transition-transform">
                        My Garden
                      </Link>
                    </motion.div>
                    <motion.a 
                      href="/api/logout"
                      initial={{ y: 20, opacity: 0 }} 
                      animate={{ y: 0, opacity: 1 }} 
                      transition={{ delay: 0.6 }}
                      className="font-mono text-sm text-white/40 hover:text-white uppercase tracking-widest"
                    >
                      Logout
                    </motion.a>
                  </>
                ) : (
                  <motion.a 
                    href="/api/login"
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.5 }}
                    className="font-display text-4xl text-white/80 hover:text-white italic hover:scale-105 transition-transform"
                  >
                    Sign In
                  </motion.a>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
