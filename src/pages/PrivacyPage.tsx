import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const defaultContent = `
<section>
  <h2>1. Toplanan Veriler</h2>
  <p>Fortext olarak, hizmetlerimizi sunarken aşağıdaki kişisel verileri topluyoruz:</p>
  <ul>
    <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, e-posta adresi, telefon numarası</li>
    <li><strong>Hesap Bilgileri:</strong> Kullanıcı adı, şifre (şifrelenmiş halde)</li>
    <li><strong>Ödeme Bilgileri:</strong> Fatura adresi, vergi numarası (kredi kartı bilgileri ödeme sağlayıcısı tarafından işlenir)</li>
    <li><strong>Kullanım Verileri:</strong> API istek logları, zaman damgaları, istek sayıları</li>
    <li><strong>Teknik Veriler:</strong> IP adresi, tarayıcı türü ve versiyonu, işletim sistemi, cihaz bilgileri</li>
    <li><strong>Çerez Verileri:</strong> Oturum çerezleri, tercih çerezleri, analitik çerezleri</li>
  </ul>
</section>

<section>
  <h2>2. Verilerin Kullanım Amaçları</h2>
  <p>Toplanan veriler aşağıdaki amaçlarla kullanılmaktadır:</p>
  <ul>
    <li><strong>Hizmet Sunumu:</strong> API hizmetlerinin sağlanması ve sürekliliğinin sağlanması</li>
    <li><strong>Hesap Yönetimi:</strong> Kullanıcı hesaplarının oluşturulması, doğrulanması ve yönetilmesi</li>
    <li><strong>Faturalandırma:</strong> Ödeme işlemlerinin gerçekleştirilmesi ve fatura düzenlenmesi</li>
    <li><strong>İletişim:</strong> Önemli güncellemeler, hizmet bildirimleri ve destek talepleri</li>
    <li><strong>Güvenlik:</strong> Yetkisiz erişim ve dolandırıcılığın önlenmesi</li>
    <li><strong>İyileştirme:</strong> Hizmet kalitesinin artırılması ve yeni özelliklerin geliştirilmesi</li>
    <li><strong>Yasal Yükümlülükler:</strong> Yasal gerekliliklerin yerine getirilmesi</li>
  </ul>
</section>

<section>
  <h2>3. Verilerin Saklanması ve Güvenliği</h2>
  <p>Kişisel verilerinizin güvenliği bizim için önceliklidir:</p>
  <ul>
    <li><strong>Şifreleme:</strong> Tüm veriler AES-256 şifreleme ile korunur</li>
    <li><strong>SSL/TLS:</strong> Tüm veri transferleri SSL/TLS protokolü ile gerçekleştirilir</li>
    <li><strong>Firebase Security:</strong> Veritabanı erişimleri Firebase Security Rules ile kısıtlanmıştır</li>
    <li><strong>Erişim Kontrolü:</strong> Verilere yalnızca yetkili personel erişebilir</li>
    <li><strong>Düzenli Denetim:</strong> Güvenlik sistemleri düzenli olarak denetlenmektedir</li>
  </ul>
  <p>Şifreler hiçbir zaman düz metin olarak saklanmaz, bcrypt algoritmasıyla hashlenir.</p>
</section>

<section>
  <h2>4. Verilerin Paylaşımı</h2>
  <p>Kişisel verileriniz aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:</p>
  <ul>
    <li><strong>Ödeme Sağlayıcıları:</strong> PayTR gibi ödeme işlemcileri (yalnızca ödeme bilgileri)</li>
    <li><strong>Yasal Zorunluluklar:</strong> Mahkeme kararları veya yasal talepler doğrultusunda</li>
    <li><strong>İş Ortakları:</strong> Hizmet sağlamak için gerekli olan alt yükleniciler (gizlilik sözleşmesi kapsamında)</li>
  </ul>
  <p>Verileriniz hiçbir koşulda pazarlama amacıyla üçüncü taraflara satılmaz veya kiralanmaz.</p>
</section>

<section>
  <h2>5. Veri Saklama Süresi</h2>
  <ul>
    <li><strong>Aktif Hesaplar:</strong> Hesabınız aktif olduğu sürece verileriniz saklanır</li>
    <li><strong>Pasif Hesaplar:</strong> 2 yıl boyunca işlem yapılmayan hesaplar için bildirim gönderilir</li>
    <li><strong>Hesap Silme:</strong> Talep üzerine 30 gün içinde tüm kişisel veriler kalıcı olarak silinir</li>
    <li><strong>Fatura Kayıtları:</strong> Yasal zorunluluklar gereği 10 yıl boyunca saklanır</li>
    <li><strong>Log Kayıtları:</strong> Güvenlik amaçlı loglar 1 yıl boyunca tutulur</li>
  </ul>
</section>

<section>
  <h2>6. KVKK Kapsamındaki Haklarınız</h2>
  <p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aşağıdaki haklara sahipsiniz:</p>
  <ul>
    <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
    <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
    <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
    <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
    <li>Kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
    <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerin silinmesini isteme</li>
    <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
  </ul>
</section>

<section>
  <h2>7. Başvuru Yöntemi</h2>
  <p>KVKK kapsamındaki taleplerinizi aşağıdaki yöntemlerle iletebilirsiniz:</p>
  <ul>
    <li><strong>E-posta:</strong> kvkk@fortext.com.tr</li>
    <li><strong>Posta:</strong> [Şirket Adresi]</li>
  </ul>
  <p>Başvurularınız 30 gün içinde ücretsiz olarak sonuçlandırılacaktır. İşlemin ayrıca bir maliyet gerektirmesi halinde Kişisel Verileri Koruma Kurulu tarafından belirlenen ücret tarifesi uygulanacaktır.</p>
</section>

<section>
  <h2>8. Politika Değişiklikleri</h2>
  <p>Bu gizlilik politikası gerektiğinde güncellenebilir. Önemli değişiklikler e-posta yoluyla bildirilecektir. Politikanın en güncel halini her zaman bu sayfadan görebilirsiniz.</p>
</section>

<section>
  <h2>9. İletişim</h2>
  <p>Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:</p>
  <ul>
    <li><strong>E-posta:</strong> destek@fortext.com.tr</li>
    <li><strong>Telefon:</strong> +90 (212) 000 00 00</li>
  </ul>
</section>
`;

const PrivacyPage = () => {
  const [content, setContent] = useState(defaultContent);
  const [lastUpdate, setLastUpdate] = useState("8 Mart 2026");

  useEffect(() => {
    getDoc(doc(db, "settings", "site")).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.privacyPolicy) setContent(data.privacyPolicy);
        if (data.privacyPolicyDate) setLastUpdate(data.privacyPolicyDate);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="h-14 flex items-center px-6 border-b border-border/20">
        <Link to="/" className="text-[15px] font-semibold text-foreground">fortext</Link>
      </nav>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Gizlilik Politikası</h1>
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

export default PrivacyPage;
