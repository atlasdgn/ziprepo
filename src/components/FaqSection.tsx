import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  { q: "API key ne kadar sürede aktif olur?", a: "Hesap oluşturduktan sonra API Key'iniz anında aktif olur. Dashboard üzerinden hemen kullanmaya başlayabilirsiniz." },
  { q: "Ücretsiz plan ne kadar süre geçerli?", a: "Ücretsiz plan süresiz olarak geçerlidir. Günlük 100 istek ve dakikada 10 istek limiti ile istediğiniz kadar kullanabilirsiniz." },
  { q: "Kargo numarası bulunamazsa ne olur?", a: "404 hata kodu ile birlikte açıklayıcı bir hata mesajı döner. Her kargo firması için farklı formatlarda numara desteklenir; dokümantasyondan kontrol edebilirsiniz." },
  { q: "Webhook nasıl çalışır?", a: "Pro ve Enterprise planlarda kargo durumu değiştiğinde belirlediğiniz URL'e otomatik POST isteği gönderilir. Panel üzerinden webhook URL'inizi ayarlayabilirsiniz." },
  { q: "Hangi programlama dilleri destekleniyor?", a: "API standart HTTP üzerinden çalışır; REST isteği yapabilen her dil ve framework ile entegre edebilirsiniz. PHP, Node.js, Python, Go, Java, Swift ve daha fazlası." },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 border-t border-border/30">
      <div className="max-w-3xl mx-auto px-8 lg:px-12">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground/50 font-semibold mb-3">SSS</p>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-12">Sıkça sorulan sorular.</h2>
        {faqs.map((faq, i) => (
          <div key={i} className="border-t border-border/30 py-6">
            <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="flex items-center justify-between w-full text-left gap-4">
              <span className="text-[15px] font-medium text-foreground/75 hover:text-foreground transition-colors">{faq.q}</span>
              <motion.svg
                animate={{ rotate: openIndex === i ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 text-muted-foreground/40"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-[13.5px] leading-relaxed text-muted-foreground/60 pt-4">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FaqSection;
