import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get("plan") || "free";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Şifre en az 6 karakter olmalıdır."); return; }
    setLoading(true);
    const success = await register(name, email, password);
    setLoading(false);
    if (success) navigate("/dashboard");
    else setError("Bu e-posta zaten kayıtlı.");
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center px-4">
      <div className="orb w-96 h-96 top-10 right-1/4 opacity-5 fixed" style={{ background: "hsl(var(--muted-foreground))" }} />
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
          <h1 className="text-2xl font-semibold text-foreground mb-2">Kayıt Ol</h1>
          <p className="text-sm text-foreground/70">Ücretsiz hesap oluşturun, anında API Key alın.</p>
          {selectedPlan !== "free" && (
            <div className="mt-3 inline-flex items-center gap-2 glass-sm px-3 py-1.5">
              <span className="text-[11px] text-foreground/70">Seçilen plan:</span>
              <span className="text-[11px] font-semibold text-foreground capitalize">{selectedPlan}</span>
            </div>
          )}
        </div>

        <div className="glass p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-2">İsim</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                placeholder="Adınız Soyadınız"
              />
            </div>
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
            <div>
              <label className="block text-xs font-medium text-foreground/70 mb-2">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                placeholder="En az 6 karakter"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Hesap oluşturuluyor..." : "Ücretsiz Başla"}
            </button>
          </form>
          <p className="text-center text-xs text-foreground/50 mt-6">
            Zaten hesabınız var mı?{" "}
            <Link to="/login" className="text-primary hover:underline">Giriş Yap</Link>
          </p>
        </div>

        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 glass-sm px-4 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success))]" />
            <span className="text-[11px] text-foreground/70">Kayıt olduğunuzda 3 günde 100 ücretsiz istek hakkı kazanırsınız</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
