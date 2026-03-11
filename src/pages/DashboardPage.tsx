import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

interface RequestLog {
  id: string;
  endpoint: string;
  status: number;
  timestamp: string;
  carrier?: string;
}

type Tab = "overview" | "usage" | "billing" | "settings";

const SidebarMenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground/50">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 9L11 12L7 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const generateApiKey = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "ftx_live_";
  for (let i = 0; i < 24; i++) key += chars[Math.floor(Math.random() * chars.length)];
  return key;
};

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentRequests, setRecentRequests] = useState<RequestLog[]>([]);
  const [usageData, setUsageData] = useState<{ time: string; requests: number }[]>([]);
  const [resettingKey, setResettingKey] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    
    // Requests koleksiyonunu dinle - basit sorgu
    const q = query(
      collection(db, "requests"),
      where("userId", "==", user.id)
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const logs: RequestLog[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        logs.push({
          id: d.id,
          endpoint: data.endpoint || "",
          status: data.status || 200,
          timestamp: data.timestamp || "",
          carrier: data.carrier || "",
        });
      });
      
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentRequests(logs.slice(0, 20));

      const hourMap: Record<string, number> = {};
      logs.forEach((l) => {
        try {
          const h = new Date(l.timestamp).getHours();
          const key = `${String(h).padStart(2, "0")}:00`;
          hourMap[key] = (hourMap[key] || 0) + 1;
        } catch {}
      });
      const chartData = Object.entries(hourMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([time, requests]) => ({ time, requests }));
      setUsageData(chartData);
    }, () => {
      // Hata durumunda sessizce devam et
      setRecentRequests([]);
      setUsageData([]);
    });
    
    return () => unsub();
  }, [user]);

  if (!user) return null;

  const copyKey = () => {
    navigator.clipboard.writeText(user.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetApiKey = async () => {
    if (!confirm("API Key sıfırlanacak, eski key geçersiz olacak. Emin misiniz?")) return;
    setResettingKey(true);
    try {
      const newKey = generateApiKey();
      await updateDoc(doc(db, "users", user.id), { apiKey: newKey });
    } catch (err) {
      console.error("Key reset error:", err);
    }
    setResettingKey(false);
  };

  // Kredi hesaplama - once free, sonra pro
  const totalCredits = (user.freeCredits || 0) + (user.proCredits || 0);
  const usedCredits = user.requestsUsed || 0;
  const remainingCredits = Math.max(0, totalCredits - usedCredits);
  const usagePercent = totalCredits > 0 ? Math.min((usedCredits / totalCredits) * 100, 100) : 0;

  // Kredi formatla - binlik ayrac ile
  const formatCredits = (num: number) => {
    return num.toLocaleString('tr-TR');
  };

  const formatTime = (ts: string) => {
    try {
      const diff = Date.now() - new Date(ts).getTime();
      if (diff < 60000) return "Az önce";
      if (diff < 3600000) return `${Math.floor(diff / 60000)} dk önce`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)} saat önce`;
      return `${Math.floor(diff / 86400000)} gün önce`;
    } catch {
      return ts;
    }
  };

  const getSubscriptionStatus = () => {
    if (!user.subscription) {
      // Free kullanıcılar için kayıt tarihinden itibaren 90 gün hesapla
      if (user.plan === "free" && user.createdAt) {
        const createdDate = new Date(user.createdAt);
        const endDate = new Date(createdDate.getTime() + 90 * 24 * 60 * 60 * 1000);
        const now = new Date();
        const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { status: "active" as const, daysLeft: Math.max(0, daysLeft), endDate };
      }
      return null;
    }
    const endDate = new Date(user.subscription.endDate);
    const now = new Date();
    // Gün hesaplama - saat farkını da dikkate al
    const timeDiff = endDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return { status: user.subscription.status, daysLeft: Math.max(0, daysLeft), endDate };
  };

  const subscription = getSubscriptionStatus();

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Genel" },
    { id: "usage", label: "Kullanım" },
    { id: "billing", label: "Ödeme" },
    { id: "settings", label: "Ayarlar" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed lg:static top-0 left-0 h-full w-52 flex-shrink-0 border-r border-border/10 bg-background flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-14 flex items-center px-5 border-b border-border/10">
          <Link to="/" className="text-[14px] font-semibold text-foreground hover:opacity-80 transition-opacity">fortext</Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-xl text-[12px] font-medium transition-all ${
                activeTab === t.id
                  ? "text-foreground bg-foreground/[0.06]"
                  : "text-foreground/50 hover:text-foreground/70 hover:bg-foreground/[0.03]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border/10 space-y-1">
          <div className="px-3 py-2">
            <p className="text-[11px] font-medium text-foreground/70 truncate">{user.name}</p>
            <p className="text-[10px] text-foreground/40 truncate">{user.email}</p>
          </div>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="w-full text-left px-3 py-2 rounded-xl text-[12px] text-foreground/50 hover:text-destructive hover:bg-destructive/5 transition-all"
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto min-w-0">
        <div className="h-14 flex items-center px-4 lg:px-8 border-b border-border/10 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-foreground/[0.05] transition-colors">
            <SidebarMenuIcon />
          </button>
          <h1 className="text-sm font-semibold text-foreground">Dashboard</h1>
          <span className="text-[10px] text-foreground/40 hidden sm:inline">Hoş geldin, {user.name}</span>
        </div>

        <div className="p-4 lg:p-8 max-w-5xl space-y-6">
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Abonelik uyarisi */}
              {user.plan !== "free" && subscription && subscription.daysLeft <= 7 && (
                <div className={`glass p-4 border-l-4 ${subscription.daysLeft <= 0 ? 'border-destructive bg-destructive/5' : 'border-[hsl(var(--warning))] bg-[hsl(var(--warning))]/5'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-semibold ${subscription.daysLeft <= 0 ? 'text-destructive' : 'text-[hsl(var(--warning))]'}`}>
                        {subscription.daysLeft <= 0 ? 'Aboneliğiniz sona erdi!' : `Aboneliğiniz ${subscription.daysLeft} gün içinde sona erecek`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {subscription.daysLeft <= 0 ? 'Hizmetlerinize devam etmek için ödeme yapın.' : 'Kesintisiz hizmet için ödemenizi yapın.'}
                      </p>
                    </div>
                    <Link to="/payment?plan=pro" className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90">
                      Ödeme Yap
                    </Link>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="glass p-5">
                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-semibold mb-2">Plan</p>
                  <p className="text-2xl font-semibold text-foreground capitalize">{user.plan}</p>
                  {user.plan === "free" ? (
                    <Link to="/payment?plan=pro" className="text-[11px] text-primary hover:underline mt-1 inline-block">Pro'ya Yükselt</Link>
                  ) : (
                    subscription && <p className="text-[10px] text-foreground/40 mt-1">{subscription.daysLeft} gün kaldı</p>
                  )}
                </div>
                <div className="glass p-5">
                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-semibold mb-2">Ücretsiz Kredi</p>
                  <p className="text-2xl font-semibold text-foreground">{formatCredits(user.freeCredits || 0)}</p>
                  <p className="text-[10px] text-foreground/40 mt-1">Önce kullanılır</p>
                </div>
                <div className="glass p-5">
                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-semibold mb-2">Pro Kredi</p>
                  <p className="text-2xl font-semibold text-foreground">{formatCredits(user.proCredits || 0)}</p>
                  <p className="text-[10px] text-foreground/40 mt-1">Ücretsiz bittikten sonra</p>
                </div>
                <div className="glass p-5">
                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-semibold mb-2">Kullanım</p>
                  <p className="text-2xl font-semibold text-foreground">{formatCredits(usedCredits)}</p>
                  <div className="w-full h-1.5 bg-secondary rounded-full mt-3 overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${usagePercent}%` }} />
                  </div>
                </div>
              </div>

              <div className="glass p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-semibold">API Key</p>
                  <p className="text-[10px] text-foreground/40">Bu anahtarı kimseyle paylaşmayın</p>
                </div>
                <div className="flex items-center gap-3">
                  <code className="flex-1 h-10 flex items-center px-4 rounded-xl bg-secondary/50 border border-border text-xs mono text-foreground/60 overflow-hidden text-ellipsis">
                    {user.apiKey}
                  </code>
                  <button onClick={copyKey} className="h-10 px-4 rounded-xl bg-foreground text-background text-[11px] font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/></svg>
                    {copied ? "Kopyalandi!" : "Kopyala"}
                  </button>
                </div>
              </div>

              <div className="glass p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-semibold">Son İstekler</p>
                  {usedCredits > 0 && (
                    <span className="text-[10px] text-foreground/50">Toplam: {formatCredits(usedCredits)} istek</span>
                  )}
                </div>
                {recentRequests.length === 0 && usedCredits === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-foreground/50">Henüz API isteği yapılmadı.</p>
                    <p className="text-[11px] text-foreground/40 mt-1">API key'inizi kullanarak istek attığınızda burada görünecek.</p>
                  </div>
                ) : recentRequests.length === 0 && usedCredits > 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-foreground/50">{formatCredits(usedCredits)} istek kullanıldı.</p>
                    <p className="text-[11px] text-foreground/40 mt-1">Detaylı istek logları yüklenemedi.</p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {recentRequests.slice(0, 10).map((a) => (
                      <div key={a.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-foreground/[0.02] transition-colors">
                        <div className="flex items-center gap-3">
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold mono ${a.status >= 200 && a.status < 300 ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]"}`}>
                            {a.status}
                          </span>
                          <code className="text-[11px] mono text-foreground/50">{a.endpoint}</code>
                        </div>
                        <span className="text-[10px] text-foreground/40 hidden sm:inline">{formatTime(a.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "usage" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="glass p-5">
                <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-semibold mb-4">Kullanım Grafiği</p>
                {usageData.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-foreground/50">Henüz veri yok.</p>
                    <p className="text-[11px] text-foreground/40 mt-1">API istekleri yapıldıkça grafik burada oluşacak.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={usageData}>
                      <defs>
                        <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(211,100%,50%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(211,100%,50%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "hsl(0,0%,6%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                      <Area type="monotone" dataKey="requests" stroke="hsl(211,100%,50%)" fill="url(#dashGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="glass p-5">
                <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-semibold mb-3">Kredi Bilgisi</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-foreground/60">Ücretsiz Kredi</span>
                    <span className="text-foreground font-medium">{formatCredits(user.freeCredits || 0)}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-foreground/60">Pro Kredi</span>
                    <span className="text-foreground font-medium">{formatCredits(user.proCredits || 0)}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-foreground/60">Toplam Kullanılan</span>
                    <span className="text-foreground font-medium">{formatCredits(usedCredits)}</span>
                  </div>
                  <div className="flex justify-between text-[12px] pt-2 border-t border-border/20">
                    <span className="text-foreground/60">Kalan Toplam</span>
                    <span className="text-foreground font-semibold">{formatCredits(remainingCredits)}</span>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-[11px] text-primary/70">
                    Kredi kullanım sırası: Önce ücretsiz verilen 100 kredi kullanılır. Ücretsiz kredi bittikten sonra Pro kredi kullanılmaya başlar.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "billing" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="glass p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[13px] font-semibold text-foreground/80">Mevcut Plan</p>
                    <p className="text-2xl font-semibold text-foreground capitalize mt-1">{user.plan}</p>
                  </div>
                  {user.plan === "free" && (
                    <Link to="/payment?plan=pro" className="px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity">
                      Pro'ya Yükselt
                    </Link>
                  )}
                </div>
                
                {subscription && (
                  <div className="border-t border-border/20 pt-4 mt-4">
                    <div className="flex justify-between text-[12px] mb-2">
                      <span className="text-muted-foreground/50">Abonelik Durumu</span>
                      <span className={`font-medium ${subscription.status === 'active' ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--warning))]'}`}>
                        {subscription.status === 'active' ? 'Aktif' : 'Askıda'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[12px] mb-2">
                      <span className="text-muted-foreground/50">Bitiş Tarihi</span>
                      <span className="text-foreground">{subscription.endDate.toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-muted-foreground/50">Kalan Gün</span>
                      <span className="text-foreground font-medium">{Math.max(0, subscription.daysLeft)} gün</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="glass p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[13px] font-semibold text-foreground/80">Faturalar</p>
                  <Link to="/invoices" className="text-xs text-primary hover:underline">Tumu</Link>
                </div>
                <p className="text-[12px] text-muted-foreground/50">Tum faturalarinizi faturalar sayfasindan goruntuleyebilir ve PDF olarak indirebilirsiniz.</p>
                <Link
                  to="/invoices"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Faturalarim
                </Link>
              </div>

              {user.plan === "free" && (
                <div className="glass p-6 border-primary/20 bg-primary/[0.02]">
                  <p className="text-[13px] font-semibold text-foreground/80 mb-2">Pro Pakete Gec</p>
                  <p className="text-[12px] text-muted-foreground/50 mb-4">
                    Pro paket ile 100.000 kredi + 3 gunluk bonus kredi kazanin. 3 aylik abonelik 500 TL.
                  </p>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center gap-2 text-[12px] text-foreground/70">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="hsl(var(--success))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      100.000 API istegi
                    </li>
                    <li className="flex items-center gap-2 text-[12px] text-foreground/70">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="hsl(var(--success))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      3 gunluk bonus kredi
                    </li>
                    <li className="flex items-center gap-2 text-[12px] text-foreground/70">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="hsl(var(--success))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Oncelikli destek
                    </li>
                  </ul>
                  <Link to="/payment?plan=pro" className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity">
                    500 TL - Pro'ya Gec
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md space-y-6">
              <div className="glass p-6 space-y-4">
                <h3 className="text-[13px] font-semibold text-foreground/80">API Key Sifirla</h3>
                <p className="text-[12px] text-muted-foreground/40">Yeni bir API key oluşturulacak, eski key geçersiz olacak.</p>
                <button 
                  onClick={resetApiKey}
                  disabled={resettingKey}
                  className="px-5 py-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors disabled:opacity-50"
                >
                  {resettingKey ? "Sifirlaniyor..." : "Key Sifirla"}
                </button>
              </div>
              <div className="glass p-6 space-y-4">
                <h3 className="text-[13px] font-semibold text-foreground/80">Hesap Bilgileri</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground/50">Isim</span>
                    <span className="text-foreground">{user.name}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground/50">E-posta</span>
                    <span className="text-foreground">{user.email}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground/50">Plan</span>
                    <span className="text-foreground capitalize">{user.plan}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground/50">Kayit Tarihi</span>
                    <span className="text-foreground">{new Date(user.createdAt).toLocaleDateString("tr-TR")}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
