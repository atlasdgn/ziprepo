import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
    <path d="M20 6L9 17l-5-5" stroke="hsl(var(--success))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const plans = [
  {
    name: "Free",
    price: "0 TL",
    period: "",
    desc: "Test ve bireysel projeler",
    features: ["100 ucretsiz kredi", "18 kargo firmasi", "JSON yanitlar", "Topluluk destegi", "Kayit aninda aktif"],
    highlight: false,
    cta: "Ucretsiz Basla",
    plan: "free",
  },
  {
    name: "Pro",
    price: "500 TL",
    period: "/ 3 ay",
    desc: "Buyuyen uygulamalar ve startuplar",
    features: ["100.000 kredi", "+3 gunluk bonus kredi", "Oncelikli destek", "Fatura desteigi", "3 aylik abonelik"],
    highlight: true,
    cta: "Pro'ya Gec",
    plan: "pro",
  },
  {
    name: "Enterprise",
    price: "Ozel",
    period: "",
    desc: "Yuksek hacimli kurumsal entegrasyonlar",
    features: ["Sinirsiz kredi", "Ozel SLA anlasmasi", "Dedicated destek hatti", "Ozel entegrasyon destegi", "Ozel fiyatlandirma"],
    highlight: false,
    cta: "Bize Yazin",
    plan: "enterprise",
  },
];

const PricingSection = () => (
  <section id="pricing" className="py-24 border-t border-border/30">
    <div className="max-w-5xl mx-auto px-8 lg:px-12">
      <div className="text-center mb-14">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground/50 font-semibold mb-3">Fiyatlandirma</p>
        <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-foreground mb-4">Sade fiyatlar, gizli ucret yok.</h2>
        <p className="text-[14px] max-w-md mx-auto text-muted-foreground/55">Ucretsiz baslayin, buyudukce yukseltin. Istediginiz zaman iptal edebilirsiniz.</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`glass p-8 flex flex-col relative ${plan.highlight ? "!bg-foreground/[0.06] !border-foreground/[0.18]" : ""}`}
          >
            {plan.highlight && (
              <>
                <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-primary/[0.06] to-transparent pointer-events-none" />
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-lg px-3 py-1 text-[10px] font-semibold mono bg-primary/15 text-[hsl(195,100%,75%)]">Populer</span>
                </div>
              </>
            )}
            <div className="mb-6 relative">
              <p className="text-[12px] font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">{plan.name}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-foreground">{plan.price}</span>
                {plan.period && <span className="text-[13px] text-muted-foreground/55">{plan.period}</span>}
              </div>
              <p className="text-[13px] text-muted-foreground/60 mt-2">{plan.desc}</p>
            </div>
            <div className="border-t border-border/30 pt-6 mb-8 flex flex-col gap-3 flex-1 relative">
              {plan.features.map((f) => (
                <div key={f} className={`flex items-center gap-3 text-[13px] ${plan.highlight ? "text-foreground/60" : "text-muted-foreground/50"}`}>
                  <CheckIcon />
                  {f}
                </div>
              ))}
            </div>
            <Link
              to={plan.plan === "enterprise" ? "mailto:api@fortext.com.tr" : plan.plan === "pro" ? "/payment?plan=pro" : `/register?plan=${plan.plan}`}
              className={`flex items-center justify-center py-2.5 text-[13px] font-semibold rounded-xl transition-all relative ${
                plan.highlight
                  ? "bg-foreground text-background hover:opacity-90"
                  : "bg-secondary border border-border text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              {plan.cta}
            </Link>
          </motion.div>
        ))}
      </div>
      <div className="text-center mt-8">
        <p className="text-[11px] text-muted-foreground/40">
          Kredi kullanim sirasi: Once ucretsiz 100 kredi kullanilir, bittikten sonra Pro krediler devreye girer.
        </p>
      </div>
    </div>
  </section>
);

export default PricingSection;
