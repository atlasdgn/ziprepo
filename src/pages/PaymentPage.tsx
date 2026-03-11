import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";

type PaymentMethod = "credit_card" | "eft" | null;

interface PaytrSettings {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  testMode: boolean;
}

const PaymentPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get("plan") || "pro";
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // EFT formu
  const [eftForm, setEftForm] = useState({
    senderName: "",
    referenceNo: "",
    amount: ""
  });
  
  // Kredi karti formu
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardHolder: ""
  });
  
  // Fatura bilgileri
  const [billingForm, setBillingForm] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    taxNumber: "",
    companyName: ""
  });
  
  const [planPrice, setPlanPrice] = useState(500);
  const [paytrEnabled, setPaytrEnabled] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState({
    creditCard: true,
    bankTransfer: true
  });
  const [bankInfo, setBankInfo] = useState({
    bankName: "Ziraat Bankası",
    iban: "TR00 0000 0000 0000 0000 0000 00",
    accountHolder: "Fortext Yazılım"
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Plan fiyatını ve ödeme ayarlarını yükle
    const loadSettings = async () => {
      const plansSnap = await getDoc(doc(db, "settings", "plans"));
      if (plansSnap.exists()) {
        const plans = plansSnap.data();
        if (selectedPlan === "pro") {
          setPlanPrice(parseInt(plans.proPrice) || 500);
        } else if (selectedPlan === "enterprise") {
          setPlanPrice(parseInt(plans.enterprisePrice) || 2499);
        }
      }
      
      const paymentsSnap = await getDoc(doc(db, "settings", "payments"));
      if (paymentsSnap.exists()) {
        const payments = paymentsSnap.data();
        if (payments.paytr && payments.paytr.merchantId) {
          setPaytrEnabled(true);
        }
        if (payments.bankInfo) {
          setBankInfo(payments.bankInfo);
        }
        // Ödeme yöntemlerini yükle
        if (payments.methods) {
          setPaymentMethods({
            creditCard: payments.methods.creditCard !== false,
            bankTransfer: payments.methods.bankTransfer !== false
          });
        }
      }
    };
    
    loadSettings();
  }, [user, navigate, selectedPlan]);

  const handleEftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError("");
    
    try {
      // Sipariş oluştur
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        plan: selectedPlan,
        amount: `${planPrice} TL`,
        paymentMethod: "eft",
        status: "pending",
        eftDetails: {
          senderName: eftForm.senderName,
          referenceNo: eftForm.referenceNo,
          declaredAmount: eftForm.amount
        },
        billingInfo: billingForm,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      
      // Log kaydet
      await setDoc(doc(db, "logs", `${Date.now()}_eft_order`), {
        type: "eft_payment_request",
        userId: user.id,
        userEmail: user.email,
        orderId: orderRef.id,
        amount: planPrice,
        timestamp: new Date().toISOString(),
        details: `EFT ödeme talebi - ${selectedPlan} plan`
      });
      
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
    
    setLoading(false);
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError("");
    
    try {
      // Sipariş oluştur (PayTR entegrasyonu için)
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        plan: selectedPlan,
        amount: `${planPrice} TL`,
        paymentMethod: "credit_card",
        status: "pending",
        billingInfo: billingForm,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      
      // PayTR iframe'e yönlendir veya şimdilik başarılı say
      // Gerçek entegrasyon için PayTR API'si kullanılacak
      
      // Şimdilik test modunda direkt onayla
      if (!paytrEnabled) {
        // Test modu - direkt onayla
        const now = new Date();
        const endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 ay
        
        await setDoc(doc(db, "users", user.id), {
          ...user,
          plan: selectedPlan,
          proCredits: (user.proCredits || 0) + 100000 + 1000, // Pro krediler + 3 günlük bonus
          subscription: {
            status: "active",
            startDate: now.toISOString(),
            endDate: endDate.toISOString(),
            lastPaymentDate: now.toISOString(),
            autoRenew: true
          }
        }, { merge: true });
        
        await setDoc(doc(db, "orders", orderRef.id), {
          status: "completed",
          completedAt: now.toISOString()
        }, { merge: true });
        
        // Fatura oluştur
        await createInvoice(orderRef.id, user, selectedPlan, planPrice, billingForm);
        
        // Log kaydet
        await setDoc(doc(db, "logs", `${Date.now()}_card_payment`), {
          type: "card_payment_success",
          userId: user.id,
          userEmail: user.email,
          orderId: orderRef.id,
          amount: planPrice,
          timestamp: new Date().toISOString(),
          details: `Kredi kartı ödemesi başarılı - ${selectedPlan} plan`
        });
        
        await refreshUser();
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError("Ödeme işlemi başarısız. Lütfen tekrar deneyin.");
    }
    
    setLoading(false);
  };

  const createInvoice = async (orderId: string, user: any, plan: string, amount: number, billing: any) => {
    // Fatura numarası oluştur
    const settingsSnap = await getDoc(doc(db, "settings", "invoice"));
    let invoiceNo = 1001;
    if (settingsSnap.exists()) {
      invoiceNo = (settingsSnap.data().lastNumber || 1000) + 1;
    }
    
    await setDoc(doc(db, "settings", "invoice"), { lastNumber: invoiceNo }, { merge: true });
    
    const invoiceData = {
      invoiceNo: `FTX-${invoiceNo}`,
      orderId,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      plan,
      amount,
      tax: Math.round(amount * 0.18),
      total: Math.round(amount * 1.18),
      billingInfo: billing,
      status: "issued",
      createdAt: new Date().toISOString(),
      dueDate: new Date().toISOString()
    };
    
    await addDoc(collection(db, "invoices"), invoiceData);
    
    return invoiceData;
  };

  if (!user) return null;

  if (success) {
    // Başarılı ödeme sayfasına yönlendir
    navigate(`/payment/success?plan=${selectedPlan}&method=${paymentMethod}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-background grid-bg py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <span className="text-lg font-semibold text-foreground">fortext</span>
          </Link>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Ödeme Alanı</h1>
          <p className="text-sm text-foreground/70">
            {selectedPlan === "pro" ? "Pro" : "Enterprise"} paket - {planPrice} TL / 3 ay
          </p>
        </div>

        {/* Plan ozeti */}
        <div className="glass p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-foreground/70 mb-1">Seçilen Paket</p>
              <p className="text-lg font-semibold text-foreground capitalize">{selectedPlan}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-foreground/70 mb-1">Toplam Tutar</p>
              <p className="text-2xl font-semibold text-foreground">{planPrice} TL</p>
              <p className="text-[10px] text-foreground/50">+ KDV dahil</p>
            </div>
          </div>
          <div className="border-t border-border/30 pt-4">
            <p className="text-[11px] text-foreground/70">
              3 aylık abonelik. Abonelik süresi sonunda otomatik yenilenir.
              Pro pakette 100.000 kredi + 3 günlük bonus kredi verilir.
            </p>
          </div>
        </div>

        {/* Odeme yontemi secimi */}
        {!paymentMethod && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-sm font-medium text-foreground mb-4">Ödeme Yöntemi Seçin</p>
            
            {/* Kredi Kartı - Admin'den kapatılabilir */}
            {paymentMethods.creditCard ? (
              <button
                onClick={() => setPaymentMethod("credit_card")}
                className="w-full glass p-5 text-left hover:bg-foreground/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5">
                      <rect x="1" y="4" width="22" height="16" rx="3"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Kredi Kartı / Banka Kartı</p>
                    <p className="text-xs text-foreground/70">Anında aktivasyon</p>
                  </div>
                </div>
              </button>
            ) : (
              <div className="w-full glass p-5 opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-foreground/30">
                      <rect x="1" y="4" width="22" height="16" rx="3"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground/50">Kredi Kartı / Banka Kartı</p>
                    <p className="text-xs text-destructive">Şu anda aktif değil</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* EFT/Havale - Admin'den kapatılabilir */}
            {paymentMethods.bankTransfer ? (
              <button
                onClick={() => setPaymentMethod("eft")}
                className="w-full glass p-5 text-left hover:bg-foreground/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[hsl(var(--success))]/10 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--success))" strokeWidth="1.5">
                      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">EFT / Havale</p>
                    <p className="text-xs text-foreground/70">Manuel onay gerektirir (1-24 saat)</p>
                  </div>
                </div>
              </button>
            ) : (
              <div className="w-full glass p-5 opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-foreground/30">
                      <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground/50">EFT / Havale</p>
                    <p className="text-xs text-destructive">Şu anda aktif değil</p>
                  </div>
                </div>
              </div>
            )}

            {/* Hiçbir yöntem aktif değilse uyarı */}
            {!paymentMethods.creditCard && !paymentMethods.bankTransfer && (
              <div className="glass p-4 border-l-4 border-[hsl(var(--warning))] bg-[hsl(var(--warning))]/5">
                <p className="text-sm text-[hsl(var(--warning))]">
                  Şu anda ödeme kabul edilmiyor. Lütfen daha sonra tekrar deneyin.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* EFT Formu */}
        {paymentMethod === "eft" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => setPaymentMethod(null)}
              className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground mb-6 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Geri
            </button>
            
            <div className="glass p-6 mb-6">
              <p className="text-sm font-semibold text-foreground mb-4">Banka Bilgileri</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border/20">
                  <span className="text-muted-foreground">Banka</span>
                  <span className="text-foreground font-medium">{bankInfo.bankName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/20">
                  <span className="text-muted-foreground">IBAN</span>
                  <span className="text-foreground font-mono text-xs">{bankInfo.iban}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Hesap Sahibi</span>
                  <span className="text-foreground font-medium">{bankInfo.accountHolder}</span>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-[hsl(var(--warning))]/10 border border-[hsl(var(--warning))]/20">
                <p className="text-[11px] text-[hsl(var(--warning))]">
                  Lutfen aciklama kismina e-posta adresinizi yazin: {user.email}
                </p>
              </div>
            </div>

            <form onSubmit={handleEftSubmit} className="glass p-6 space-y-5">
              <p className="text-sm font-semibold text-foreground">Transfer Bilgileri</p>
              
              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-2">Gönderen Adı</label>
                <input
                  type="text"
                  value={eftForm.senderName}
                  onChange={(e) => setEftForm({ ...eftForm, senderName: e.target.value })}
                  required
                  className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/50"
                  placeholder="Banka hesabi sahibi"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-2">Referans / Dekont No</label>
                <input
                  type="text"
                  value={eftForm.referenceNo}
                  onChange={(e) => setEftForm({ ...eftForm, referenceNo: e.target.value })}
                  required
                  className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/50"
                  placeholder="Transfer referans numarasi"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-2">Gönderilen Tutar (TL)</label>
                <input
                  type="text"
                  value={eftForm.amount}
                  onChange={(e) => setEftForm({ ...eftForm, amount: e.target.value })}
                  required
                  className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/50"
                  placeholder={`${planPrice}`}
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Gönderiliyor..." : "Ödeme Bildir"}
              </button>
            </form>
          </motion.div>
        )}

        {/* Kredi Karti Formu */}
        {paymentMethod === "credit_card" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => setPaymentMethod(null)}
              className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground mb-6 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Geri
            </button>

            <form onSubmit={handleCardSubmit} className="space-y-6">
              {/* Fatura Bilgileri */}
              <div className="glass p-6 space-y-4">
                <p className="text-sm font-semibold text-foreground">Fatura Bilgileri</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground/70 mb-2">Ad Soyad</label>
                    <input
                      type="text"
                      value={billingForm.fullName}
                      onChange={(e) => setBillingForm({ ...billingForm, fullName: e.target.value })}
                      required
                      className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground/70 mb-2">Adres</label>
                    <input
                      type="text"
                      value={billingForm.address}
                      onChange={(e) => setBillingForm({ ...billingForm, address: e.target.value })}
                      required
                      className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground/70 mb-2">Şehir</label>
                    <input
                      type="text"
                      value={billingForm.city}
                      onChange={(e) => setBillingForm({ ...billingForm, city: e.target.value })}
                      required
                      className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground/70 mb-2">Vergi No (Opsiyonel)</label>
                    <input
                      type="text"
                      value={billingForm.taxNumber}
                      onChange={(e) => setBillingForm({ ...billingForm, taxNumber: e.target.value })}
                      className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                    />
                  </div>
                </div>
              </div>

              {/* Kart Bilgileri */}
              <div className="glass p-6 space-y-4">
                <p className="text-sm font-semibold text-foreground">Kart Bilgileri</p>
                
                {error && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-medium text-foreground/70 mb-2">Kart Numarası</label>
                  <input
                    type="text"
                    value={cardForm.cardNumber}
                    onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                    required
                    className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring/50"
                    placeholder="0000 0000 0000 0000"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground/70 mb-2">Son Kullanma</label>
                    <input
                      type="text"
                      value={cardForm.expiry}
                      onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                      required
                      className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                      placeholder="AA/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground/70 mb-2">CVV</label>
                    <input
                      type="text"
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      required
                      className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                      placeholder="000"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-foreground/70 mb-2">Kart Üzerindeki İsim</label>
                  <input
                    type="text"
                    value={cardForm.cardHolder}
                    onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value.toUpperCase() })}
                    required
                    className="w-full h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-ring/50"
                    placeholder="AD SOYAD"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Ödeme İşleniyor..." : `${planPrice} TL Öde`}
              </button>
              
              <p className="text-[10px] text-center text-foreground/50">
                Ödemeniz 256-bit SSL ile korunmaktadır. Kart bilgileriniz güvendedir.
              </p>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
