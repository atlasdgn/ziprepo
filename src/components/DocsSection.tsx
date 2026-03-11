import { motion } from "framer-motion";

interface Props {
  onCopy: (text: string) => void;
}

const features = [
  { code: "GET /v1/kargo/{firma}/{no}", label: "Tek endpoint formatı" },
  { code: "status: DELIVERED / IN_TRANSIT", label: "Normalize durum kodları" },
  { code: "X-API-Key header", label: "Basit kimlik doğrulama" },
];

const responseJson = `{
  "success": true,
  "carrier": "trendyol",
  "tracking_number": "8680000012345678",
  "status": "DELIVERED",
  "status_label": "Teslim Edildi",
  "last_update": "2024-03-08T14:32:00Z",
  "events": [
    {
      "date": "2024-03-08T14:32:00Z",
      "description": "Teslim edildi",
      "location": "İstanbul / Kadıköy"
    },
    {
      "date": "2024-03-08T08:10:00Z",
      "description": "Dağıtıma çıktı",
      "location": "İstanbul / Kadıköy Şb."
    }
  ]
}`;

const DocsSection = ({ onCopy }: Props) => (
  <section id="docs" className="py-24 border-t border-border/30">
    <div className="max-w-5xl mx-auto px-8 lg:px-12">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground/50 font-semibold mb-3">Dokümantasyon</p>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-foreground mb-5">
            Basit. Tutarlı.<br />Öngörülebilir.
          </h2>
          <p className="text-[14px] leading-relaxed mb-8 text-muted-foreground/60">
            Tüm firmalar için tek bir URL formatı. Normalize edilmiş durum kodları. Webhook desteği. Kapsamlı hata mesajları.
          </p>
          <div className="flex flex-col gap-3 mb-8">
            {features.map((f) => (
              <div key={f.code} className="flex items-center gap-4">
                <span className="glass-sm px-3 py-1.5 mono text-[11px] text-foreground/60 flex-shrink-0">{f.code}</span>
                <span className="text-[13px] text-muted-foreground/60">{f.label}</span>
              </div>
            ))}
          </div>
          <a href="/docs" className="inline-flex items-center gap-2 px-[18px] py-2.5 text-[13px] font-medium text-muted-foreground bg-secondary border border-border rounded-xl hover:bg-secondary/80 transition-all">
            Tüm Dökümanı Gör
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="code-block">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/30">
            <div className="flex items-center gap-2">
              <span className="rounded-lg px-2 py-0.5 text-[11px] font-semibold mono bg-[rgba(48,209,88,0.12)] text-[#30d158]">200 OK</span>
              <span className="text-[11px] text-muted-foreground/40">GET /v1/kargo/trendyol/868...</span>
            </div>
            <button onClick={() => onCopy(responseJson)} className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              kopyala
            </button>
          </div>
          <pre className="text-[12.5px] leading-[1.7] p-5 overflow-x-auto">
{`{
  `}<span className="ck">"success"</span>{`: `}<span className="co">true</span>{`,
  `}<span className="ck">"carrier"</span>{`: `}<span className="cs">"trendyol"</span>{`,
  `}<span className="ck">"tracking_number"</span>{`: `}<span className="cs">"8680000012345678"</span>{`,
  `}<span className="ck">"status"</span>{`: `}<span className="cs">"DELIVERED"</span>{`,
  `}<span className="ck">"status_label"</span>{`: `}<span className="cs">"Teslim Edildi"</span>{`,
  `}<span className="ck">"last_update"</span>{`: `}<span className="cs">"2024-03-08T14:32:00Z"</span>{`,
  `}<span className="ck">"events"</span>{`: [
    {
      `}<span className="ck">"date"</span>{`: `}<span className="cs">"2024-03-08T14:32:00Z"</span>{`,
      `}<span className="ck">"description"</span>{`: `}<span className="cs">"Teslim edildi"</span>{`,
      `}<span className="ck">"location"</span>{`: `}<span className="cs">"İstanbul / Kadıköy"</span>{`
    },
    {
      `}<span className="ck">"date"</span>{`: `}<span className="cs">"2024-03-08T08:10:00Z"</span>{`,
      `}<span className="ck">"description"</span>{`: `}<span className="cs">"Dağıtıma çıktı"</span>{`,
      `}<span className="ck">"location"</span>{`: `}<span className="cs">"İstanbul / Kadıköy Şb."</span>{`
    }
  ]
}`}
          </pre>
        </motion.div>
      </div>
    </div>
  </section>
);

export default DocsSection;
