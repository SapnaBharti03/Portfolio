import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteBranding } from "@/hooks/useSiteBranding";

import { usePortfolioContext } from "@/contexts/PortfolioContext";

const links = [
  { label: "Home", href: "#home", always: true },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Services", href: "#services" },
  { label: "Experience", href: "#experience" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact", always: true },
];

function useVisibleNavLinks() {
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const portfolio = usePortfolioContext();

  useEffect(() => {
    const sync = () => {
      const next: Record<string, boolean> = {};
      for (const link of links) {
        if (link.always) {
          next[link.href] = true;
          continue;
        }
        const id = link.href.slice(1);
        next[link.href] = !!document.getElementById(id);
      }
      setVisible(next);
    };

    sync();
    if (portfolio?.loading) return;
    const id = window.requestAnimationFrame(sync);
    return () => window.cancelAnimationFrame(id);
  }, [portfolio?.loading]);

  return links.filter((link) => visible[link.href] !== false);
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navLinks = useVisibleNavLinks();
  const { name, initial } = useSiteBranding();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "py-3 backdrop-blur-xl bg-background/70 border-b border-border" : "py-5 bg-transparent"
      }`}
    >
      <nav className="container flex items-center justify-between">
        <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo("#home"); }} className="flex items-center gap-2 group">
          <span className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center font-display font-bold text-primary-foreground shadow-glow">
            {initial}
          </span>
          <span className="font-display font-semibold text-lg tracking-tight hidden sm:block">
            {name}
          </span>
        </a>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((l) => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md"
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden lg:block">
          <Button variant="hero" size="sm" onClick={() => scrollTo("#contact")}>Hire Me</Button>
        </div>

        <button
          aria-label="Toggle menu"
          className="lg:hidden p-2 rounded-md hover:bg-secondary"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-1">
              {navLinks.map((l) => (
                <button
                  key={l.href}
                  onClick={() => scrollTo(l.href)}
                  className="text-left px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  {l.label}
                </button>
              ))}
              <Button variant="hero" className="mt-2" onClick={() => scrollTo("#contact")}>Hire Me</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}