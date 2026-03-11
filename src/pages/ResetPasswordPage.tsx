import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [tokenData, setTokenData] = useState<{ email: string; userId: string; oldPassword: string } | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const tokenDoc = await getDoc(doc(db, "passwordResetTokens", token));
        if (!tokenDoc.exists()) {
          setLoading(false);
          return;
        }

        const data = tokenDoc.data();
        const expiresAt = new Date(data.expiresAt);
        
        if (expiresAt < new Date()) {
          await deleteDoc(doc(db, "passwordResetTokens", token));
          setLoading(false);
          return;
        }

        setTokenData({
          email: data.email,
          userId: data.userId,
          oldPassword: data.oldPassword
        });
        setValidToken(true);
        setLoading(false);
      } catch (e) {
        console.error("Token verification error:", e);
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Sifre en az 6 karakter olmalidir.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Sifreler eslesmiyor.");
      return;
    }

    if (!tokenData) return;

    setSubmitting(true);

    try {
      // Eski sifre ile giris yap
      const userCredential = await signInWithEmailAndPassword(auth, tokenData.email, tokenData.oldPassword);
      
      // Yeni sifreyi ayarla
      await updatePassword(userCredential.user, password);
      
      // Token'i sil
      if (token) {
        await deleteDoc(doc(db, "passwordResetTokens", token));
      }

      // Cikis yap
      await auth.signOut();

      setSuccess(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Token gecersiz veya suresi dolmus. Lutfen yeni bir sifre sifirlama istegi gonderin.");
      } else if (err.code === "auth/requires-recent-login") {
        setError("Guvenlik nedeniyle tekrar giris yapmaniz gerekiyor.");
      } else {
        setError("Bir hata olustu: " + (err.message || "Lutfen tekrar deneyin."));
      }
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background grid-bg flex items-center justify-center">
        <div className="text-foreground/50">Doğrulanıyor...</div>
      </div>
    );
  }

  if (!token || !validToken) {
    return (
      <div className="min-h-screen bg-background grid-bg flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="glass p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="hsl(var(--destructive))" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Geçersiz veya Süresi Dolmuş Bağlantı</h2>
            <p className="text-sm text-foreground/70 mb-6">
              Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Şifre sıfırlama bağlantıları 30 dakika geçerlidir.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Yeni Bağlantı İste
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

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
            <h2 className="text-xl font-semibold text-foreground mb-2">Şifreniz Değiştirildi!</h2>
            <p className="text-sm text-foreground/70 mb-6">
              Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Giriş Yap
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
          <h1 className="text-2xl font-semibold text-foreground mb-2">Yeni Şifre Belirle</h1>
          <p className="text-sm text-foreground/70">
            <strong className="text-foreground">{tokenData?.email}</strong> hesabı için yeni şifre belirleyin.
          </p>
        </div>

        <div className="glass p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-2">Yeni Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                placeholder="En az 6 karakter"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-2">Şifre Tekrar</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                placeholder="Şifrenizi tekrar girin"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? "Değiştiriliyor..." : "Şifremi Değiştir"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
