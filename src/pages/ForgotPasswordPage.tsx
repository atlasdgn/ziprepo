import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, setDoc, getDoc } from "firebase/firestore";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [foundUser, setFoundUser] = useState<{id: string; name: string; email: string} | null>(null);

  const generateToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  const handleFindUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const usersQuery = query(collection(db, "users"), where("email", "==", email));
      const snapshot = await getDocs(usersQuery);
      
      if (snapshot.empty) {
        setError("Bu e-posta adresi ile kayitli kullanici bulunamadi.");
        setLoading(false);
        return;
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      setFoundUser({ id: userDoc.id, name: userData.name || "", email: email });
      setShowPasswordInput(true);
      setLoading(false);
    } catch (err) {
      setError("Bir hata olustu.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!currentPassword || currentPassword.length < 6) {
      setError("Mevcut sifrenizi girmelisiniz.");
      return;
    }

    if (!foundUser) return;
    setLoading(true);

    try {
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      // Token'i kaydet - mevcut sifreyi de kaydet
      await setDoc(doc(db, "passwordResetTokens", token), {
        userId: foundUser.id,
        email: email,
        oldPassword: currentPassword,
        expiresAt: expiresAt,
        createdAt: new Date().toISOString()
      });

      const smtpDoc = await getDoc(doc(db, "settings", "smtp"));
      const resetUrl = `${window.location.origin}/reset-password?token=${token}`;

      // HTML mail sablonu
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;background-color:#111111;border-radius:16px;border:1px solid #222;">
          <tr>
            <td style="padding:40px 32px;text-align:center;">
              <div style="font-size:24px;font-weight:700;color:#ffffff;margin-bottom:8px;">fortext</div>
              <div style="font-size:12px;color:#666;text-transform:uppercase;letter-spacing:2px;">Kargo Takip API</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              <div style="background:linear-gradient(135deg,#1a1a1a,#0d0d0d);border-radius:12px;padding:32px;border:1px solid #222;">
                <h1 style="color:#ffffff;font-size:20px;margin:0 0 16px;font-weight:600;">Sifre Sifirlama</h1>
                <p style="color:#999;font-size:14px;line-height:1.6;margin:0 0 24px;">
                  Merhaba <strong style="color:#fff;">${foundUser.name || "Degerli Kullanici"}</strong>,<br><br>
                  Hesabiniz icin sifre sifirlama talebi aldik. Asagidaki butona tiklayarak yeni sifrenizi belirleyebilirsiniz.
                </p>
                <a href="${resetUrl}" style="display:inline-block;background-color:#ffffff;color:#000000;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:14px;">
                  Sifremi Sifirla
                </a>
                <p style="color:#666;font-size:12px;margin:24px 0 0;line-height:1.5;">
                  Bu baglanti <strong style="color:#999;">30 dakika</strong> gecerlidir.<br>
                  Eger bu talebi siz yapmadiysan, bu e-postayi gormezden gelebilirsiniz.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              <p style="color:#444;font-size:11px;text-align:center;margin:0;">
                Buton calismiyorsa bu linki kopyalayin:<br>
                <a href="${resetUrl}" style="color:#666;word-break:break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #222;text-align:center;">
              <p style="color:#444;font-size:11px;margin:0;">
                &copy; ${new Date().getFullYear()} Fortext. Tum haklari saklidir.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      // Mail gonder (SMTP varsa)
      if (smtpDoc.exists()) {
        const smtpData = smtpDoc.data();
        if (smtpData?.host && smtpData?.user) {
          try {
            const response = await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: email,
                subject: "Sifre Sifirlama - Fortext",
                text: `Sifre sifirlama linkiniz: ${resetUrl}`,
                html: emailHtml,
                smtp: {
                  host: smtpData.host,
                  port: smtpData.port || '587',
                  user: smtpData.user,
                  pass: smtpData.pass,
                  from: smtpData.from || smtpData.user,
                  secure: smtpData.secure !== false
                }
              })
            });
            
            if (!response.ok) {
              const errData = await response.json();
              console.error("Email send failed:", errData);
              setError("Mail gonderilemedi: " + (errData.error || "Bilinmeyen hata"));
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Email API error:", e);
            setError("Mail servisi ile baglanti kurulamadi.");
            setLoading(false);
            return;
          }
        } else {
          setError("SMTP ayarlari yapilandirilmamis. Lutfen yonetici ile iletisime gecin.");
          setLoading(false);
          return;
        }
      } else {
        setError("Mail ayarlari bulunamadi.");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError("Bir hata olustu. Lutfen tekrar deneyin.");
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background grid-bg flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="glass p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--success))]/10 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="hsl(var(--success))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">E-posta Gönderildi!</h2>
            <p className="text-sm text-foreground/70 mb-6">
              Şifre sıfırlama bağlantısı <strong className="text-foreground">{email}</strong> adresine gönderildi. 
              Lütfen gelen kutunuzu ve spam klasörünüzü kontrol edin.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Giriş Sayfasına Dön
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center px-4">
      <div className="orb w-96 h-96 top-10 left-1/4 opacity-5 fixed" style={{ background: "hsl(var(--muted-foreground))" }} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <span className="text-lg font-semibold text-foreground">fortext</span>
          </Link>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Şifremi Unuttum</h1>
          <p className="text-sm text-foreground/70">E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.</p>
        </div>

        <div className="glass p-8">
          {!showPasswordInput ? (
            <form onSubmit={handleFindUser} className="space-y-5">
              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-2">E-posta</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                  placeholder="ornek@email.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Kontrol ediliyor..." : "Devam Et"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="rounded-xl bg-primary/5 border border-primary/10 px-4 py-3">
                <p className="text-xs text-foreground/50 mb-1">Hesap bulundu</p>
                <p className="text-sm font-medium text-foreground">{foundUser?.email}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-2">Mevcut Sifreniz</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                  placeholder="Mevcut sifrenizi girin"
                />
                <p className="text-[10px] text-foreground/40 mt-2">Guvenlik icin mevcut sifrenizi dogrulamaniz gerekiyor.</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Gonderiliyor..." : "Sifirlama Baglantisi Gonder"}
              </button>
              <button
                type="button"
                onClick={() => { setShowPasswordInput(false); setError(""); }}
                className="w-full text-xs text-foreground/50 hover:text-foreground"
              >
                Geri Don
              </button>
            </form>
          )}
          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-foreground/50">
              Şifrenizi hatırladınız mı?{" "}
              <Link to="/login" className="text-primary hover:underline">Giriş Yap</Link>
            </p>
            <p className="text-xs text-foreground/50">
              Hesabınız yok mu?{" "}
              <Link to="/register" className="text-primary hover:underline">Kayıt Ol</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
