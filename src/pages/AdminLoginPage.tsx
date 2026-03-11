import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const ADMIN_EMAIL = "fortextdev@gmail.com";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if this is the admin email
      if (cred.user.email !== ADMIN_EMAIL) {
        setError("Bu hesap admin yetkisine sahip değil.");
        setLoading(false);
        return;
      }

      // Auto-set role to admin in Firestore
      const userRef = doc(db, "users", cred.user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        if (snap.data().role !== "admin") {
          await updateDoc(userRef, { role: "admin" });
        }
      }

      localStorage.setItem("fortext_admin", "true");
      localStorage.setItem("fortext_admin_uid", cred.user.uid);
      navigate("/fortext/panel");
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/invalid-login-credentials") {
        setError("Şifre hatalı. Lütfen Firebase Auth'da kayıtlı şifrenizi kullanın.");
      } else if (code === "auth/user-not-found") {
        setError("Bu e-posta ile kayıtlı hesap bulunamadı. Önce /register sayfasından kayıt olun.");
      } else {
        setError("Giriş hatası: " + (err?.message || "Bilinmeyen hata"));
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-muted/50 border border-border/30 mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-1">Admin Paneli</h1>
          <p className="text-xs text-muted-foreground">Yetkili personel girişi</p>
        </div>

        <div className="glass p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">Admin E-posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                placeholder="fortextdev@gmail.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
          <p className="text-center text-[10px] text-muted-foreground/40 mt-4">
            Kayıt olurken kullandığınız şifreyi girin.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
