import { useState } from "react";

const sections = [
  { id: "overview", label: "Genel Bakış" },
  { id: "auth", label: "Kimlik Doğrulama" },
  { id: "endpoints", label: "Endpointler" },
  { id: "tracking", label: "Kargo Takip" },
  { id: "responses", label: "Yanıt Formatı" },
  { id: "errors", label: "Hata Kodları" },
  { id: "webhooks", label: "Webhooks" },
  { id: "rate-limits", label: "Rate Limiting" },
];

const carriers = [
  "ptt", "mng", "aras", "yurtici", "surat", "ups", "aliexpress", "trendyol",
  "hepsijet", "kargoist", "agt", "kolaygelsin", "horoz", "byexpress",
  "thy", "dhl", "kargomsende", "sendeo",
];

const errorCodes = [
  { code: "200", desc: "Başarılı", color: "#30d158" },
  { code: "400", desc: "Geçersiz istek parametresi", color: "#ff9f0a" },
  { code: "401", desc: "Geçersiz veya eksik API Key", color: "#ff453a" },
  { code: "404", desc: "Kargo bulunamadı", color: "#ff9f0a" },
  { code: "429", desc: "Rate limit aşıldı", color: "#ff453a" },
  { code: "500", desc: "Sunucu hatası", color: "#ff453a" },
];

const DocsPage = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [copiedText, setCopiedText] = useState("");

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const CopyBtn = ({ text }: { text: string }) => (
    <button
      onClick={() => copy(text)}
      className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground transition-colors flex items-center gap-1.5"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      {copiedText === text ? "kopyalandı" : "kopyala"}
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Docs page sidebar (right-side TOC on desktop) */}
      <div className="max-w-6xl mx-auto px-8 lg:px-12 py-16">
        <div className="flex gap-16">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground mb-3">API Dokümantasyonu</h1>
            <p className="text-[15px] text-muted-foreground/60 mb-12">Fortext Kargo API entegrasyonu için ihtiyacınız olan her şey.</p>

            {/* Overview */}
            <section id="overview" className="mb-16">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Genel Bakış</h2>
              <p className="text-[14px] leading-relaxed text-muted-foreground/70 mb-4">
                Fortext Kargo API, Türkiye'deki 18 kargo firmasının takip verilerine tek bir REST API üzerinden erişmenizi sağlar. Tüm firmalar için normalize edilmiş JSON yanıtları döner.
              </p>
              <div className="glass-sm p-4 mb-4">
                <p className="text-[12px] mono text-muted-foreground/50 mb-1">Base URL</p>
                <div className="flex items-center justify-between">
                  <code className="text-[13px] mono text-foreground/80">https://api.fortext.com.tr/v1</code>
                  <CopyBtn text="https://api.fortext.com.tr/v1" />
                </div>
              </div>
              <p className="text-[13px] text-muted-foreground/50">Tüm istekler HTTPS üzerinden yapılmalıdır. HTTP istekleri otomatik olarak yönlendirilir.</p>
            </section>

            {/* Auth */}
            <section id="auth" className="mb-16">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Kimlik Doğrulama</h2>
              <p className="text-[14px] leading-relaxed text-muted-foreground/70 mb-4">
                API isteklerinizi <code className="glass-sm px-1.5 py-0.5 text-[12px] mono text-foreground/70">X-API-Key</code> header'ı ile kimlik doğrulamanız gerekir.
              </p>
              <div className="code-block mb-4">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border/30">
                  <span className="text-[11px] text-muted-foreground/40 mono">Header</span>
                  <CopyBtn text='X-API-Key: ftx_live_xxxxxxxxxxxxxxxxxxxxxxxx' />
                </div>
                <pre className="p-5 text-[12.5px] leading-[1.7]">
{`X-API-Key: `}<span className="cv">ftx_live_xxxxxxxxxxxxxxxxxxxxxxxx</span>
                </pre>
              </div>
              <div className="glass-sm p-4 border-l-2 border-[hsl(var(--warning))]">
                <p className="text-[13px] text-muted-foreground/60"><strong className="text-foreground/70">Önemli:</strong> API Key'inizi asla istemci tarafı (frontend) kodunda kullanmayın. Sunucu tarafında saklayın.</p>
              </div>
            </section>

            {/* Endpoints */}
            <section id="endpoints" className="mb-16">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Endpointler</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-3 pr-4 text-muted-foreground/50 font-semibold">Method</th>
                      <th className="text-left py-3 pr-4 text-muted-foreground/50 font-semibold">Endpoint</th>
                      <th className="text-left py-3 text-muted-foreground/50 font-semibold">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/20">
                      <td className="py-3 pr-4"><span className="rounded-md px-2 py-0.5 text-[11px] font-semibold mono bg-[rgba(48,209,88,0.12)] text-[#30d158]">GET</span></td>
                      <td className="py-3 pr-4 mono text-foreground/60">/v1/kargo/{"{firma}"}/{"{takip_no}"}</td>
                      <td className="py-3 text-muted-foreground/60">Kargo durumunu sorgula</td>
                    </tr>
                    <tr className="border-b border-border/20">
                      <td className="py-3 pr-4"><span className="rounded-md px-2 py-0.5 text-[11px] font-semibold mono bg-[rgba(48,209,88,0.12)] text-[#30d158]">GET</span></td>
                      <td className="py-3 pr-4 mono text-foreground/60">/v1/carriers</td>
                      <td className="py-3 text-muted-foreground/60">Desteklenen firmaları listele</td>
                    </tr>
                    <tr className="border-b border-border/20">
                      <td className="py-3 pr-4"><span className="rounded-md px-2 py-0.5 text-[11px] font-semibold mono bg-[rgba(100,160,255,0.12)] text-[#64a0ff]">POST</span></td>
                      <td className="py-3 pr-4 mono text-foreground/60">/v1/webhooks</td>
                      <td className="py-3 text-muted-foreground/60">Webhook oluştur (Pro+)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Tracking */}
            <section id="tracking" className="mb-16">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Kargo Takip</h2>
              <p className="text-[14px] leading-relaxed text-muted-foreground/70 mb-4">Kargo takip sorgusu yapmak için firma kodu ve takip numarasını URL'e ekleyin.</p>

              <div className="code-block mb-6">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border/30">
                  <span className="text-[11px] text-muted-foreground/40 mono">Örnek İstek</span>
                  <CopyBtn text={`curl "https://api.fortext.com.tr/v1/kargo/trendyol/8680000012345678" \\\n  -H "X-API-Key: ftx_live_xxxxxxxxxxxxxxxxxxxxxxxx"`} />
                </div>
                <pre className="p-5 text-[12.5px] leading-[1.7]">
{`curl `}<span className="cs">"https://api.fortext.com.tr/v1/kargo/trendyol/8680000012345678"</span>{` \\
  -H `}<span className="cs">"X-API-Key: <span className="cv">ftx_live_xxxxxxxxxxxxxxxxxxxxxxxx</span>"</span>
                </pre>
              </div>

              <p className="text-[13px] text-muted-foreground/50 mb-3 font-medium">Desteklenen firma kodları:</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {carriers.map((c) => (
                  <span key={c} className="rounded-md px-2 py-1 text-[11px] mono bg-secondary border border-border text-muted-foreground/50">{c}</span>
                ))}
              </div>
            </section>

            {/* Response Format */}
            <section id="responses" className="mb-16">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Yanıt Formatı</h2>
              <p className="text-[14px] leading-relaxed text-muted-foreground/70 mb-4">Tüm firmalar için aynı JSON yapısı döner. Durum kodları normalize edilmiştir.</p>

              <div className="code-block mb-6">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/30">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg px-2 py-0.5 text-[11px] font-semibold mono bg-[rgba(48,209,88,0.12)] text-[#30d158]">200 OK</span>
                  </div>
                  <CopyBtn text={`{\n  "success": true,\n  "carrier": "trendyol",\n  "tracking_number": "8680000012345678",\n  "status": "DELIVERED",\n  "status_label": "Teslim Edildi",\n  "last_update": "2024-03-08T14:32:00Z",\n  "estimated_delivery": null,\n  "events": [\n    {\n      "date": "2024-03-08T14:32:00Z",\n      "status": "DELIVERED",\n      "description": "Teslim edildi",\n      "location": "İstanbul / Kadıköy"\n    }\n  ]\n}`} />
                </div>
                <pre className="p-5 text-[12.5px] leading-[1.7]">
{`{
  `}<span className="ck">"success"</span>{`: `}<span className="co">true</span>{`,
  `}<span className="ck">"carrier"</span>{`: `}<span className="cs">"trendyol"</span>{`,
  `}<span className="ck">"tracking_number"</span>{`: `}<span className="cs">"8680000012345678"</span>{`,
  `}<span className="ck">"status"</span>{`: `}<span className="cs">"DELIVERED"</span>{`,
  `}<span className="ck">"status_label"</span>{`: `}<span className="cs">"Teslim Edildi"</span>{`,
  `}<span className="ck">"last_update"</span>{`: `}<span className="cs">"2024-03-08T14:32:00Z"</span>{`,
  `}<span className="ck">"estimated_delivery"</span>{`: `}<span className="co">null</span>{`,
  `}<span className="ck">"events"</span>{`: [
    {
      `}<span className="ck">"date"</span>{`: `}<span className="cs">"2024-03-08T14:32:00Z"</span>{`,
      `}<span className="ck">"status"</span>{`: `}<span className="cs">"DELIVERED"</span>{`,
      `}<span className="ck">"description"</span>{`: `}<span className="cs">"Teslim edildi"</span>{`,
      `}<span className="ck">"location"</span>{`: `}<span className="cs">"İstanbul / Kadıköy"</span>{`
    }
  ]
}`}
                </pre>
              </div>

              <h3 className="text-[15px] font-semibold text-foreground mb-3">Durum Kodları</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { code: "PENDING", label: "Bilgi bekleniyor" },
                  { code: "IN_TRANSIT", label: "Yolda" },
                  { code: "OUT_FOR_DELIVERY", label: "Dağıtımda" },
                  { code: "DELIVERED", label: "Teslim edildi" },
                  { code: "RETURNED", label: "İade edildi" },
                  { code: "FAILED", label: "Teslim edilemedi" },
                ].map((s) => (
                  <div key={s.code} className="glass-sm px-3 py-2.5">
                    <code className="text-[11px] mono text-foreground/60 block mb-0.5">{s.code}</code>
                    <span className="text-[11px] text-muted-foreground/50">{s.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Errors */}
            <section id="errors" className="mb-16">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Hata Kodları</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-3 pr-4 text-muted-foreground/50 font-semibold">Kod</th>
                      <th className="text-left py-3 text-muted-foreground/50 font-semibold">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorCodes.map((e) => (
                      <tr key={e.code} className="border-b border-border/20">
                        <td className="py-3 pr-4">
                          <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold mono" style={{ background: `${e.color}15`, color: e.color }}>{e.code}</span>
                        </td>
                        <td className="py-3 text-muted-foreground/60">{e.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Webhooks */}
            <section id="webhooks" className="mb-16">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Webhooks</h2>
              <div className="glass-sm p-4 border-l-2 border-primary/50 mb-4">
                <p className="text-[13px] text-muted-foreground/60"><strong className="text-foreground/70">Pro & Enterprise:</strong> Webhook özelliği sadece Pro ve Enterprise planlarda kullanılabilir.</p>
              </div>
              <p className="text-[14px] leading-relaxed text-muted-foreground/70 mb-4">
                Kargo durumu değiştiğinde belirlediğiniz URL'e otomatik POST isteği gönderilir.
              </p>
              <div className="code-block">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border/30">
                  <span className="text-[11px] text-muted-foreground/40 mono">Webhook Payload</span>
                </div>
                <pre className="p-5 text-[12.5px] leading-[1.7]">
{`{
  `}<span className="ck">"event"</span>{`: `}<span className="cs">"tracking.updated"</span>{`,
  `}<span className="ck">"carrier"</span>{`: `}<span className="cs">"yurtici"</span>{`,
  `}<span className="ck">"tracking_number"</span>{`: `}<span className="cs">"123456789"</span>{`,
  `}<span className="ck">"old_status"</span>{`: `}<span className="cs">"IN_TRANSIT"</span>{`,
  `}<span className="ck">"new_status"</span>{`: `}<span className="cs">"DELIVERED"</span>{`,
  `}<span className="ck">"timestamp"</span>{`: `}<span className="cs">"2024-03-08T14:32:00Z"</span>{`
}`}
                </pre>
              </div>
            </section>

            {/* Rate Limits */}
            <section id="rate-limits" className="mb-16">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Rate Limiting</h2>
              <p className="text-[14px] leading-relaxed text-muted-foreground/70 mb-4">
                Rate limit bilgileri her yanıtın header'larında döner.
              </p>
              <div className="code-block mb-6">
                <div className="px-5 py-3 border-b border-border/30">
                  <span className="text-[11px] text-muted-foreground/40 mono">Response Headers</span>
                </div>
                <pre className="p-5 text-[12.5px] leading-[1.7]">
{`X-RateLimit-Limit: `}<span className="cv">100</span>{`
X-RateLimit-Remaining: `}<span className="cv">87</span>{`
X-RateLimit-Reset: `}<span className="cv">1709902320</span>
                </pre>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-3 pr-4 text-muted-foreground/50 font-semibold">Plan</th>
                      <th className="text-left py-3 pr-4 text-muted-foreground/50 font-semibold">Günlük</th>
                      <th className="text-left py-3 text-muted-foreground/50 font-semibold">Dakika</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/20">
                      <td className="py-3 pr-4 text-foreground/70">Free</td>
                      <td className="py-3 pr-4 text-muted-foreground/60">100</td>
                      <td className="py-3 text-muted-foreground/60">10</td>
                    </tr>
                    <tr className="border-b border-border/20">
                      <td className="py-3 pr-4 text-foreground/70">Pro</td>
                      <td className="py-3 pr-4 text-muted-foreground/60">100.000</td>
                      <td className="py-3 text-muted-foreground/60">300</td>
                    </tr>
                    <tr className="border-b border-border/20">
                      <td className="py-3 pr-4 text-foreground/70">Enterprise</td>
                      <td className="py-3 pr-4 text-muted-foreground/60">Sınırsız</td>
                      <td className="py-3 text-muted-foreground/60">Özel</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right TOC (desktop only) */}
          <div className="hidden lg:block w-48 flex-shrink-0">
            <div className="sticky top-8">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground/40 font-semibold mb-4">İçindekiler</p>
              <nav className="flex flex-col gap-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={() => setActiveSection(s.id)}
                    className={`text-[12.5px] px-3 py-1.5 rounded-lg transition-colors ${
                      activeSection === s.id
                        ? "text-foreground bg-foreground/[0.06]"
                        : "text-muted-foreground/50 hover:text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
