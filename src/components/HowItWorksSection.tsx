import { motion } from "framer-motion";

const steps = [
  { num: "01", title: "API Key Alın", desc: "Hesap oluşturun, birkaç saniyede API anahtarınızı alın. Kredi kartı zorunlu değil." },
  { num: "02", title: "İsteği Yapın", desc: "URL'e kargo firması ve takip numarasını ekleyin. Standart HTTP GET isteği." },
  { num: "03", title: "JSON Alın", desc: "Normalize edilmiş JSON yanıtı. Tüm firmalar için aynı format, aynı durum kodları." },
];

const HowItWorksSection = () => (
  <section className="py-24 border-t border-border/30">
    <div className="max-w-5xl mx-auto px-8 lg:px-12">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground/50 font-semibold mb-3">Nasıl Çalışır</p>
      <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-foreground mb-16">3 adımda entegre edin.</h2>
      <div className="grid lg:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className="glass p-8 group hover:bg-foreground/[0.06] transition-colors"
          >
            <div className="text-[11px] font-semibold mono text-muted-foreground/30 mb-5 tracking-widest">{s.num}</div>
            <h3 className="text-[18px] font-semibold text-foreground mb-3">{s.title}</h3>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground/60">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
