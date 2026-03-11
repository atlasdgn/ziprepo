import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const defaultContent = `
<section>
  <h2>1. Çerez Nedir?</h2>
  <p>Çerezler (cookies), web sitelerinin tarayıcınıza kaydettiği küçük metin dosyalarıdır. Siteyi ziyaret ettiğinizde tercihlerinizi hatırlamak, kullanım deneyiminizi iyileştirmek ve site performansını analiz etmek için kullanılır.</p>
  <p>Çerezler, kişisel verilerinize erişim sağlamaz ve bilgisayarınıza zarar vermez. Çoğu modern web sitesi çerez kullanmaktadır.</p>
</section>

<section>
  <h2>2. Kullandığımız Çerez Türleri</h2>
  <p>Fortext web sitesinde aşağıdaki çerez türlerini kullanmaktayız:</p>
  
  <h3>2.1 Zorunlu Çerezler</h3>
  <p>Bu çerezler web sitesinin temel işlevlerinin çalışması için gereklidir. Oturum yönetimi, kimlik doğrulama ve güvenlik işlemleri için kullanılır. Bu çerezler olmadan giriş yapamaz veya API anahtarınıza erişemezsiniz.</p>
  <ul>
    <li><strong>session_token:</strong> Oturum kimliği (oturum süresince)</li>
    <li><strong>auth_state:</strong> Kimlik doğrulama durumu (oturum süresince)</li>
    <li><strong>csrf_token:</strong> Güvenlik token'ı (oturum süresince)</li>
  </ul>

  <h3>2.2 İşlevsel Çerezler</h3>
  <p>Tercih çerezleri, dil seçimi ve tema ayarları gibi kişiselleştirme tercihlerinizi saklar.</p>
  <ul>
    <li><strong>theme_preference:</strong> Aydınlık/karanlık tema tercihi (1 yıl)</li>
    <li><strong>language:</strong> Dil tercihi (1 yıl)</li>
    <li><strong>sidebar_state:</strong> Kenar çubuğu durumu (30 gün)</li>
  </ul>

  <h3>2.3 Analitik Çerezler</h3>
  <p>Site kullanım istatistiklerini toplamak için kullanılır. Bu veriler anonim olarak işlenir ve kimliğinizi belirlememize olanak tanımaz.</p>
  <ul>
    <li><strong>Firebase Analytics:</strong> Sayfa görüntülemeleri, tıklamalar, oturum süresi</li>
    <li><strong>Performans İzleme:</strong> Sayfa yüklenme süreleri, API yanıt süreleri</li>
  </ul>
</section>

<section>
  <h2>3. Üçüncü Taraf Çerezleri</h2>
  <p>Bazı hizmetler için üçüncü taraf sağlayıcılar kullanmaktayız:</p>
  <ul>
    <li><strong>Firebase (Google):</strong> Kimlik doğrulama ve analitik hizmetleri için. Google'ın gizlilik politikası geçerlidir.</li>
    <li><strong>PayTR:</strong> Ödeme işlemleri sırasında kullanılır. Yalnızca ödeme sayfasında aktiftir.</li>
  </ul>
  <p>Üçüncü taraf çerezleri, ilgili şirketlerin gizlilik politikalarına tabidir.</p>
</section>

<section>
  <h2>4. Çerez Yönetimi</h2>
  <p>Çerezleri aşağıdaki yöntemlerle yönetebilirsiniz:</p>
  
  <h3>Tarayıcı Ayarları</h3>
  <p>Tüm modern tarayıcılar çerez yönetimi için seçenekler sunar:</p>
  <ul>
    <li><strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik → Çerezler ve diğer site verileri</li>
    <li><strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve Site Verileri</li>
    <li><strong>Safari:</strong> Tercihler → Gizlilik → Çerezler ve web sitesi verileri</li>
    <li><strong>Edge:</strong> Ayarlar → Çerezler ve site izinleri</li>
  </ul>

  <h3>Önemli Uyarı</h3>
  <p>Zorunlu çerezleri engellerseniz:</p>
  <ul>
    <li>Hesabınıza giriş yapamayabilirsiniz</li>
    <li>Dashboard özelliklerini kullanamazsınız</li>
    <li>Ödeme işlemlerini tamamlayamazsınız</li>
  </ul>
</section>

<section>
  <h2>5. Çerez Onayı</h2>
  <p>Sitemizi ilk kez ziyaret ettiğinizde çerez kullanımı hakkında bilgilendirilirsiniz. Siteyi kullanmaya devam ederek çerez politikamızı kabul etmiş sayılırsınız.</p>
  <p>Zorunlu olmayan çerezler için açık onayınız alınır. Onayınızı istediğiniz zaman geri çekebilirsiniz.</p>
</section>

<section>
  <h2>6. Veri Güvenliği</h2>
  <p>Çerez verilerinizin güvenliği için:</p>
  <ul>
    <li>Tüm çerezler şifrelenmiş bağlantılar üzerinden iletilir (HTTPS)</li>
    <li>Hassas bilgiler çerezlerde saklanmaz</li>
    <li>Oturum çerezleri düzenli olarak yenilenir</li>
    <li>Güvenlik açıkları sürekli izlenir</li>
  </ul>
</section>

<section>
  <h2>7. Politika Değişiklikleri</h2>
  <p>Bu çerez politikası gerektiğinde güncellenebilir. Önemli değişiklikler web sitesinde duyurulacaktır. Güncel politikayı bu sayfadan takip edebilirsiniz.</p>
</section>

<section>
  <h2>8. İletişim</h2>
  <p>Çerez politikamız hakkında sorularınız için:</p>
  <ul>
    <li><strong>E-posta:</strong> destek@fortext.com.tr</li>
    <li><strong>Adres:</strong> İstanbul, Türkiye</li>
  </ul>
</section>
`;

const CookiePolicyPage = () => {
  const [content, setContent] = useState(defaultContent);
  const [lastUpdate, setLastUpdate] = useState("10 Mart 2026");

  useEffect(() => {
    getDoc(doc(db, "settings", "site")).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.cookiePolicy) setContent(data.cookiePolicy);
        if (data.cookiePolicyDate) setLastUpdate(data.cookiePolicyDate);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="h-14 flex items-center px-6 border-b border-border/20">
        <Link to="/" className="text-[15px] font-semibold text-foreground">fortext</Link>
      </nav>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Çerez Politikası</h1>
        <p className="text-xs text-foreground/40 mb-10">Son güncelleme: {lastUpdate}</p>

        <div 
          className="policy-content space-y-8 text-[13px] text-foreground/70 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </motion.div>

      <style>{`
        .policy-content section { margin-bottom: 2rem; }
        .policy-content h2 { font-size: 1rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 0.75rem; }
        .policy-content h3 { font-size: 0.875rem; font-weight: 600; color: hsl(var(--foreground) / 0.8); margin: 1rem 0 0.5rem 0; }
        .policy-content p { margin-bottom: 0.75rem; color: hsl(var(--foreground) / 0.55); }
        .policy-content ul { list-style: disc; padding-left: 1.5rem; margin-top: 0.5rem; }
        .policy-content li { margin-bottom: 0.5rem; color: hsl(var(--foreground) / 0.55); }
        .policy-content strong { color: hsl(var(--foreground) / 0.75); }
      `}</style>
    </div>
  );
};

export default CookiePolicyPage;
