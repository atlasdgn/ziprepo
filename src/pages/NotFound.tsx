import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center px-4">
      <div className="orb w-64 h-64 top-1/3 left-1/3 opacity-10 fixed" style={{ background: "hsl(var(--warning))" }} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Cat illustration with CSS */}
        <div className="mb-8 inline-block">
          <div className="relative">
            <div className="text-[120px] leading-none select-none">🐱</div>
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute -top-2 -right-2 text-3xl"
            >
              ❓
            </motion.div>
          </div>
        </div>

        <h1 className="text-6xl font-bold gtext mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-2">Sayfa Bulunamadı</p>
        <p className="text-sm text-muted-foreground/60 mb-8">
          Bu kedi bile aradığın sayfayı bulamadı.<br />
          <code className="text-xs mono glass-sm px-2 py-0.5 mt-2 inline-block text-foreground/50">{location.pathname}</code>
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-background bg-foreground rounded-xl hover:opacity-90 transition-opacity active:scale-[0.97]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/><polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2"/></svg>
            Ana Sayfa
          </Link>
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-muted-foreground bg-secondary border border-border rounded-xl hover:bg-secondary/80 transition-all"
          >
            Dokümantasyon
          </Link>
        </div>

        <div className="mt-12 flex justify-center gap-6 text-2xl opacity-50">
          <motion.span animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}>🐾</motion.span>
          <motion.span animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}>🐾</motion.span>
          <motion.span animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }}>🐾</motion.span>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
