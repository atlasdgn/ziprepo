const FooterCta = () => (
  <section className="py-28 border-t border-border/30 relative overflow-hidden">
    <div className="orb w-80 h-80 left-1/2 -translate-x-1/2 top-0 opacity-15" style={{ background: "hsl(211,100%,50%)" }} />
    <div className="relative z-10 max-w-2xl mx-auto px-8 text-center">
      <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-foreground mb-5">Entegrasyona başlamaya hazır mısınız?</h2>
      <p className="text-[15px] text-muted-foreground/55 mb-10">Ücretsiz plan ile başlayın. Kredi kartı gerekmez.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 text-[14px] font-semibold text-background bg-foreground rounded-xl hover:opacity-90 transition-opacity active:scale-[0.97]">
          Ücretsiz Başla
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
        <a href="/docs" className="inline-flex items-center gap-2 px-8 py-3.5 text-[14px] font-medium text-muted-foreground bg-secondary border border-border rounded-xl hover:bg-secondary/80 transition-all">
          Dokümantasyonu Gör
        </a>
      </div>
    </div>
  </section>
);

export default FooterCta;
