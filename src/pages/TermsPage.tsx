import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const defaultContent = `
<section>
  <h2>1. Hizmet Tanımı</h2>
  <p>Fortext, kargo takip bilgilerini birleştiren bir REST API servisidir. Kullanıcılar, kayıt olduktan sonra aldıkları API anahtarı ile hizmetten yararlanabilir.</p>
  <p>API servisi, birden fazla kargo firmasının takip sistemlerini tek bir noktadan sorgulamanıza olanak tanır. Hizmet 7/24 erişilebilir olmayı hedefler ancak planlı bakım çalışmaları önceden duyurulur.</p>
</section>

<section>
  <h2>2. Hesap Sorumlulukları</h2>
  <p>Fortext hizmetlerini kullanırken aşağıdaki sorumlulukları kabul etmiş sayılırsınız:</p>
  <ul>
    <li><strong>API Anahtarı Güvenliği:</strong> API anahtarınızın güvenliğinden tamamen siz sorumlusunuz. Anahtarınızı güvenli bir şekilde saklayın ve üçüncü kişilerle paylaşmayın.</li>
    <li><strong>Hesap Aktiviteleri:</strong> Hesabınız üzerinden yapılan tüm işlemlerden siz sorumlusunuz. Yetkisiz erişim şüphesi durumunda derhal API anahtarınızı yenileyin.</li>
    <li><strong>Bilgi Güvenliği:</strong> Hesap bilgilerinizi üçüncü kişilerle paylaşmamanız gerekmektedir.</li>
    <li><strong>Bildirim Yükümlülüğü:</strong> Şüpheli bir etkinlik fark ettiğinizde derhal destek ekibimize bildirmeniz gerekir.</li>
    <li><strong>Güncel Bilgi:</strong> Hesap bilgilerinizi güncel tutmakla yükümlüsünüz.</li>
  </ul>
</section>

<section>
  <h2>3. Kullanım Sınırları ve Rate Limiting</h2>
  <p>Her plan için belirlenen istek limitleri geçerlidir:</p>
  <ul>
    <li><strong>Free Plan:</strong> 100 kredi (kayıt sırasında verilir)</li>
    <li><strong>Pro Plan:</strong> 100.000 kredi / 3 ay</li>
    <li><strong>Enterprise Plan:</strong> Sınırsız kullanım</li>
  </ul>
  <p>Limit aşımlarında API "429 Too Many Requests" hatası döndürür. Rate limiting uygulanmaktadır: dakikada maksimum 60 istek. Kötüye kullanım tespit edildiğinde hesap uyarılmadan askıya alınabilir.</p>
</section>

<section>
  <h2>4. Yasaklanan Kullanımlar</h2>
  <p>Aşağıdaki kullanımlar kesinlikle yasaktır ve tespit edildiğinde hesabınız kalıcı olarak kapatılabilir:</p>
  <ul>
    <li><strong>Saldırı Amaçlı Kullanım:</strong> API'yi DDoS, brute-force veya benzeri saldırılar için kullanmak</li>
    <li><strong>Sahte Kayıt:</strong> Sahte veya yanıltıcı bilgi ile kayıt olmak</li>
    <li><strong>Yetkisiz Paylaşım:</strong> API anahtarını izinsiz üçüncü taraflarla paylaşmak veya satmak</li>
    <li><strong>Ters Mühendislik:</strong> API'nin çalışma mantığını tersine mühendislik ile çözmeye çalışmak</li>
    <li><strong>Kopyalama:</strong> Hizmeti kopyalama veya rakip ürün geliştirme girişimleri</li>
    <li><strong>Otomatik Toplu Sorgulama:</strong> Meşru kullanım dışında otomatik toplu sorgu yapmak</li>
    <li><strong>Yasa Dışı Kullanım:</strong> API'yi yasa dışı faaliyetler için kullanmak</li>
  </ul>
</section>

<section>
  <h2>5. Ödeme, Faturalama ve İptal</h2>
  <p>Ödeme ve faturalama ile ilgili koşullar:</p>
  <ul>
    <li><strong>Faturalandırma:</strong> Ücretli planlar 3 aylık dönemler halinde faturalandırılır.</li>
    <li><strong>Ödeme Yöntemleri:</strong> Kredi kartı ve EFT/Havale ile ödeme kabul edilmektedir.</li>
    <li><strong>İptal:</strong> İptal talebi bir sonraki fatura döneminde geçerli olur. Mevcut dönem için iade yapılmaz.</li>
    <li><strong>Geri Ödeme:</strong> Geri ödeme, yalnızca teknik sorunlar nedeniyle hizmet verilememesi durumunda değerlendirilir.</li>
    <li><strong>KDV:</strong> Tüm fiyatlara %18 KDV dahildir.</li>
    <li><strong>Fatura:</strong> Faturalar dashboard üzerinden PDF olarak indirilebilir.</li>
  </ul>
</section>

<section>
  <h2>6. Hizmet Seviyesi ve Sorumluluk Sınırlaması</h2>
  <p>Fortext, hizmet kalitesi konusunda aşağıdaki taahhütleri verir:</p>
  <ul>
    <li><strong>Uptime Hedefi:</strong> %99.5 erişilebilirlik hedeflenir (yalnızca Pro ve üzeri planlar için)</li>
    <li><strong>Garanti Yoktur:</strong> API'nin kesintisiz veya hatasız çalışacağını garanti etmez</li>
    <li><strong>Veri Doğruluğu:</strong> Kargo firmalarından alınan verilerin doğruluğundan sorumlu değiliz</li>
    <li><strong>Dolaylı Zararlar:</strong> Hizmet kaynaklı doğrudan veya dolaylı zararlardan sorumlu tutulamaz</li>
    <li><strong>Üçüncü Taraf:</strong> Kargo firmalarının sistemlerindeki kesinti veya hatalardan sorumlu değiliz</li>
  </ul>
</section>

<section>
  <h2>7. Fikri Mülkiyet</h2>
  <p>Fortext API ve tüm ilgili içerikler (belgeler, tasarım, kod) Fortext Yazılım'ın fikri mülkiyetidir. API kullanımı, fikri mülkiyet haklarının devri anlamına gelmez. Kullanıcılar yalnızca belirtilen amaçlar doğrultusunda kullanım hakkına sahiptir.</p>
</section>

<section>
  <h2>8. Değişiklikler ve Bildirimler</h2>
  <p>Bu koşullar önceden bildirimde bulunarak değiştirilebilir. Önemli değişiklikler e-posta yoluyla bildirilir. Değişiklikler yayınlandıktan 30 gün sonra geçerli olur. Hizmeti kullanmaya devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.</p>
</section>

<section>
  <h2>9. Hesap Sonlandırma</h2>
  <p>Fortext, aşağıdaki durumlarda hesabınızı önceden bildirmeksizin sonlandırabilir:</p>
  <ul>
    <li>Kullanım koşullarının ihlali</li>
    <li>Yasadışı faaliyetlerde kullanım</li>
    <li>Ödeme yükümlülüklerinin yerine getirilmemesi</li>
    <li>90 gün boyunca hesap aktivitesi olmaması (free planlar için)</li>
  </ul>
</section>

<section>
  <h2>10. Uygulanacak Hukuk ve Yetki</h2>
  <p>Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir. Tüketici hakları saklıdır.</p>
</section>

<section>
  <h2>11. İletişim</h2>
  <p>Kullanım koşulları hakkında sorularınız için:</p>
  <ul>
    <li><strong>E-posta:</strong> destek@fortext.com.tr</li>
    <li><strong>Adres:</strong> İstanbul, Türkiye</li>
  </ul>
</section>
`;

const TermsPage = () => {
  const [content, setContent] = useState(defaultContent);
  const [lastUpdate, setLastUpdate] = useState("10 Mart 2026");

  useEffect(() => {
    getDoc(doc(db, "settings", "site")).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.termsOfService) setContent(data.termsOfService);
        if (data.termsDate) setLastUpdate(data.termsDate);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="h-14 flex items-center px-6 border-b border-border/20">
        <Link to="/" className="text-[15px] font-semibold text-foreground">fortext</Link>
      </nav>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Kullanım Koşulları</h1>
        <p className="text-xs text-foreground/40 mb-10">Son güncelleme: {lastUpdate}</p>

        <div 
          className="policy-content space-y-8 text-[13px] text-foreground/70 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </motion.div>

      <style>{`
        .policy-content section { margin-bottom: 2rem; }
        .policy-content h2 { font-size: 1rem; font-weight: 600; color: hsl(var(--foreground)); margin-bottom: 0.75rem; }
        .policy-content p { margin-bottom: 0.75rem; color: hsl(var(--foreground) / 0.55); }
        .policy-content ul { list-style: disc; padding-left: 1.5rem; margin-top: 0.5rem; }
        .policy-content li { margin-bottom: 0.5rem; color: hsl(var(--foreground) / 0.55); }
        .policy-content strong { color: hsl(var(--foreground) / 0.75); }
      `}</style>
    </div>
  );
};

export default TermsPage;
