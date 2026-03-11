import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { href: "#carriers", label: "Firmalar" },
  { href: "#docs", label: "Docs" },
  { href: "#pricing", label: "Fiyatlar" },
];

const Logo = () => (
  <a href="/" className="flex items-center gap-2.5 group">
    <span className="text-[15px] font-semibold text-foreground tracking-[-0.02em]">fortext</span>
  </a>
);

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-30 h-14 flex items-center px-6 lg:px-10 transition-all duration-300 ${scrolled ? "bg-background/80 border-b border-border/20 backdrop-blur-2xl" : "bg-transparent"}`} style={{ WebkitBackdropFilter: scrolled ? "saturate(180%) blur(20px)" : undefined }}>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-muted-foreground/50 hover:text-foreground transition-colors mr-3">
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 9L11 12L7 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        <Logo />
        <div className="hidden md:flex items-center gap-0.5 ml-10">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="px-3.5 py-2 rounded-lg text-[13px] text-muted-foreground/70 hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          {user ? (
            <Link to="/dashboard" className="hidden md:inline-flex items-center gap-2 px-4 py-[7px] text-[12px] font-semibold text-background bg-foreground rounded-[10px] hover:opacity-90 transition-opacity active:scale-[0.97]">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden md:inline-flex items-center gap-2 px-4 py-[7px] text-[12px] font-medium text-muted-foreground/70 hover:text-foreground transition-colors">
                Giriş Yap
              </Link>
              <Link to="/register" className="hidden md:inline-flex items-center gap-2 px-4 py-[7px] text-[12px] font-semibold text-background bg-foreground rounded-[10px] hover:opacity-90 transition-opacity active:scale-[0.97]">
                API Key Al
              </Link>
            </>
          )}
          
        </div>
      </nav>

      {/* Fullscreen mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl flex flex-col md:hidden"
          >
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-6 flex-shrink-0">
              <Logo />
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground/50 hover:text-foreground transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 flex flex-col justify-center px-8 -mt-14">
              <nav className="space-y-1">
                {[
                  { href: "#carriers", label: "Desteklenen Firmalar" },
                  { href: "#docs", label: "Dokümantasyon" },
                  { href: "#pricing", label: "Fiyatlandırma" },
                ].map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                    className="block py-4 text-2xl font-semibold text-foreground/80 hover:text-foreground transition-colors border-b border-border/10"
                  >
                    {l.label}
                  </motion.a>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-10 space-y-3"
              >
                {user ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block text-center py-3.5 text-[14px] font-semibold text-background bg-foreground rounded-2xl"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="block text-center py-3.5 text-[14px] font-semibold text-background bg-foreground rounded-2xl"
                    >
                      Ücretsiz Başla
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block text-center py-3.5 text-[14px] font-medium text-muted-foreground/70 border border-border/20 rounded-2xl"
                    >
                      Giriş Yap
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
