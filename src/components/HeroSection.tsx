import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

interface Props {
  onCopy: (text: string) => void;
}

const HeroSection = ({ onCopy }: Props) => {
  const curlCommand = `curl "https://api.fortext.com.tr/v1/kargo/trendyol/8680000012345678" \\
  -H "X-API-Key: ftx_live_xxxxxxxxxxxxxxxxxxxxxxxx"`;

  return (
    <section className="relative min-h-[90vh] flex items-center grid-bg overflow-hidden">
      <div className="orb w-96 h-96 top-10 left-1/4 opacity-20" style={{ background: "hsl(211,100%,50%)" }} />
      <div className="orb w-64 h-64 bottom-32 right-1/4 opacity-10" style={{ background: "hsl(195,100%,75%)" }} />
      <div className="orb w-48 h-48 top-1/3 right-10 opacity-[0.08]" style={{ background: "hsl(250,70%,55%)" }} />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-8 lg:px-12 py-24 lg:py-32">
        <div className="max-w-3xl">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 glass-sm px-4 py-2 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(145,65%,50%)] animate-pulse flex-shrink-0" />
            <span className="text-[12px] text-muted-foreground font-medium tracking-wide">18 kargo firması · Tek API · Anında entegrasyon</span>
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible" className="text-5xl lg:text-7xl font-semibold leading-tight tracking-tight mb-6">
            <span className="gtext">Türkiye'nin kargo<br />takip altyapısı.</span>
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible" className="text-[16px] lg:text-[18px] leading-relaxed mb-10 max-w-2xl text-muted-foreground">
            PTT'den DHL'e, Trendyol'dan Aliexpress'e — 18 kargo firmasının gerçek zamanlı takip verisine tek bir{" "}
            <span className="text-foreground/70">REST endpoint</span> ile erişin.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row gap-3 mb-16">
            <a href="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3 text-[14px] font-semibold text-background bg-foreground rounded-xl hover:opacity-90 transition-opacity active:scale-[0.97]">
              Ücretsiz Başla
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <a href="/docs" className="inline-flex items-center justify-center gap-2 px-6 py-3 text-[14px] font-medium text-muted-foreground bg-secondary border border-border rounded-xl hover:bg-secondary/80 transition-all">
              Dokümantasyonu Gör
            </a>
          </motion.div>

          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground/50 font-semibold mb-3">Örnek istek</p>
            <div className="code-block max-w-2xl">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/30">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-foreground/8" />
                  <span className="w-3 h-3 rounded-full bg-foreground/8" />
                  <span className="w-3 h-3 rounded-full bg-foreground/8" />
                </div>
                <button onClick={() => onCopy(curlCommand)} className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  kopyala
                </button>
              </div>
              <pre className="text-[12.5px] leading-[1.7] p-5 overflow-x-auto">
{`curl `}<span className="cs">{`"https://api.fortext.com.tr/v1/kargo/trendyol/8680000012345678"`}</span>{` \\
  -H `}<span className="cs">{`"X-API-Key: `}<span className="cv">ftx_live_xxxxxxxxxxxxxxxxxxxxxxxx</span>{`"`}</span>{`

`}<span className="co">// Yanıt</span>{`
{
  `}<span className="ck">"status"</span>{`: `}<span className="cs">"DELIVERED"</span>{`,
  `}<span className="ck">"status_label"</span>{`: `}<span className="cs">"Teslim Edildi"</span>{`,
  `}<span className="ck">"last_update"</span>{`: `}<span className="cs">"2024-03-08T14:32:00Z"</span>{`,
  `}<span className="ck">"events"</span>{`: [...]
}`}
              </pre>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
