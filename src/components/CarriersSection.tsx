import { motion } from "framer-motion";
import { useState } from "react";

const carriersWithLogo = [
  { name: "PTT", logo: "/carriers/ptt.png" },
  { name: "Yurtiçi Kargo", logo: "/carriers/yurtici.gif" },
  { name: "Aras Kargo", logo: "/carriers/aras.jpg" },
  { name: "DHL", logo: "/carriers/dhl.png" },
  { name: "MNG Kargo", logo: "/carriers/mng.png" },
  { name: "UPS", logo: "/carriers/ups.png" },
  { name: "Aliexpress", logo: "/carriers/aliexpress.png" },
  { name: "Trendyol", logo: "/carriers/trendyol.png" },
  { name: "Turkish Cargo", logo: "/carriers/thy.png" },
];

const extraCarriers = [
  "Sürat Kargo", "HepsiJET", "Kargoist", "AGT Kurye",
  "Kolay Gelsin", "Horoz Lojistik", "By Express",
  "KargomSende", "Sendeo",
];

const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const CarriersSection = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [showExtra, setShowExtra] = useState(false);

  const copyName = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopied(name);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <section id="carriers" className="py-24 border-t border-border/30">
      <div className="max-w-5xl mx-auto px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground/50 font-semibold mb-3">Desteklenen Firmalar</p>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">18 firmaya tek endpoint.</h2>
          </div>
          <p className="text-[14px] max-w-sm text-muted-foreground/60">
            Yurt içi, uluslararası, e-ticaret — tüm kargo firmalarını tek bir entegrasyonla kapsayın.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
        >
          {carriersWithLogo.map((c) => (
            <button
              key={c.name}
              onClick={() => copyName(c.name)}
              className="group relative glass-sm p-4 flex flex-col items-center justify-center gap-3 hover:bg-foreground/[0.04] transition-all cursor-pointer"
            >
              <CopyIcon />
              <div className="h-10 flex items-center justify-center">
                <img
                  src={c.logo}
                  alt={c.name}
                  className="max-h-10 max-w-[80px] object-contain grayscale opacity-60 group-hover:opacity-90 group-hover:grayscale-0 transition-all"
                />
              </div>
              <span className="text-[10px] text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors">
                {copied === c.name ? "Kopyalandı!" : c.name}
              </span>
            </button>
          ))}

          {/* +daha fazla button */}
          <button
            onClick={() => setShowExtra(!showExtra)}
            className="glass-sm p-4 flex flex-col items-center justify-center gap-3 hover:bg-foreground/[0.04] transition-all cursor-pointer"
          >
            <div className="h-10 flex items-center justify-center">
              <span className="text-xl text-muted-foreground/30">+9</span>
            </div>
            <span className="text-[10px] text-muted-foreground/40">daha fazla</span>
          </button>
        </motion.div>

        {showExtra && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 flex flex-wrap gap-2"
          >
            {extraCarriers.map((c) => (
              <button
                key={c}
                onClick={() => copyName(c)}
                className="group relative rounded-[14px] px-4 py-2 text-[11.5px] bg-secondary border border-border text-muted-foreground/50 hover:text-muted-foreground hover:border-border/80 transition-colors"
              >
                {copied === c ? "Kopyalandı!" : c}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CarriersSection;
