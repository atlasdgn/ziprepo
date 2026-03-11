import { useState } from "react";
import { motion } from "framer-motion";

const planOptions = [
  { key: "free", name: "Free", price: "₺0", popular: false },
  { key: "pro", name: "Pro", price: "₺499/ay", popular: true },
  { key: "enterprise", name: "Enterprise", price: "Özel", popular: false },
];

const ApiKeySection = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("free");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <section id="apikey" className="py-28 border-t border-border/20">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground/40 font-semibold mb-3">Hemen Başla</p>
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-foreground mb-5">API Key'inizi<br />hemen alın.</h2>
            <p className="text-[14px] leading-relaxed mb-10 text-muted-foreground/50">
              Ücretsiz plandan başlayın — günlük 100 istek, kredi kartı gerektirmez.
            </p>
            <div className="flex flex-col gap-5">
              {[
                { title: "Anında Aktivasyon", desc: "Formunuzu gönderdikten saniyeler sonra API Key'iniz aktif." },
                { title: "Ücretsiz Plan", desc: "Günlük 100 istek ile test edin, hazır olduğunuzda yükseltin." },
                { title: "99.9% Uptime", desc: "Yüksek erişilebilirlik altyapısı ile kesintisiz servis." },
              ].map((p) => (
                <div key={p.title} className="flex gap-4">
                  <div className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center bg-primary/10">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="hsl(195,100%,75%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground/80 mb-0.5">{p.title}</p>
                    <p className="text-[12.5px] leading-relaxed text-muted-foreground/45">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl border border-border/20 bg-foreground/[0.02] p-8 lg:p-10">
            {!submitted ? (
              <>
                <h3 className="text-[17px] font-semibold text-foreground mb-6">API Key Talebi</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-muted-foreground/50 mb-1.5 font-medium">Ad</label>
                      <input type="text" placeholder="Ahmet" required className="w-full bg-foreground/[0.03] border border-border/20 rounded-xl px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/25 outline-none focus:border-foreground/20 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[11px] text-muted-foreground/50 mb-1.5 font-medium">Soyad</label>
                      <input type="text" placeholder="Yılmaz" required className="w-full bg-foreground/[0.03] border border-border/20 rounded-xl px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/25 outline-none focus:border-foreground/20 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-muted-foreground/50 mb-1.5 font-medium">E-posta</label>
                    <input type="email" placeholder="ahmet@sirket.com" required className="w-full bg-foreground/[0.03] border border-border/20 rounded-xl px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/25 outline-none focus:border-foreground/20 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-muted-foreground/50 mb-1.5 font-medium">Şirket <span className="text-muted-foreground/25">(opsiyonel)</span></label>
                    <input type="text" placeholder="Şirket Adı" className="w-full bg-foreground/[0.03] border border-border/20 rounded-xl px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/25 outline-none focus:border-foreground/20 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-muted-foreground/50 mb-1.5 font-medium">Plan</label>
                    <div className="flex flex-col gap-2">
                      {planOptions.map((p) => (
                        <label key={p.key} className={`flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${selectedPlan === p.key ? "border-foreground/15 bg-foreground/[0.04]" : "border-border/15 bg-transparent hover:bg-foreground/[0.02]"}`}>
                          <input type="radio" name="plan" value={p.key} checked={selectedPlan === p.key} onChange={() => setSelectedPlan(p.key)} className="w-3.5 h-3.5 accent-primary" />
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-[13px] font-medium text-foreground/80">{p.name}</span>
                            <span className="text-[11px] text-muted-foreground/40">{p.price}</span>
                          </div>
                          {p.popular && <span className="rounded-full px-2.5 py-0.5 text-[9px] font-semibold mono bg-primary/10 text-[hsl(195,100%,75%)]">Popüler</span>}
                        </label>
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 py-3 text-[13px] font-semibold text-background bg-foreground rounded-xl hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-60 mt-2">
                    {loading ? "Gönderiliyor..." : "API Key Talep Et"}
                    {!loading && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-muted-foreground/35">
                    Göndererek <a href="#" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors underline underline-offset-2">Kullanım Şartları</a>'nı kabul edersiniz.
                  </p>
                </form>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-8 gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(48,209,88,0.08)", border: "1px solid rgba(48,209,88,0.15)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#30d158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-foreground mb-2">Talebiniz Alındı</p>
                  <p className="text-[13px] text-muted-foreground/50">API anahtarınız birkaç dakika içinde e-postanıza gönderilecek.</p>
                </div>
                <div className="rounded-xl border border-border/15 bg-foreground/[0.02] p-4 w-full text-left">
                  <p className="text-[10px] text-muted-foreground/35 mb-2 uppercase tracking-widest">Örnek API Key</p>
                  <code className="text-[12px] text-foreground/50 mono">ftx_live_••••••••••••••••••••••••</code>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ApiKeySection;
