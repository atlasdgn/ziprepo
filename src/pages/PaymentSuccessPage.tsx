import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "pro";
  const method = searchParams.get("method") || "card";

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-[hsl(var(--success))]/10 flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="hsl(var(--success))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            {method === "eft" ? "Ödeme Talebiniz Alındı!" : "Ödeme Başarılı!"}
          </h1>
          
          <p className="text-sm text-foreground/55 mb-6">
            {method === "eft" 
              ? "EFT/Havale bildiriminiz alındı. Ödemeniz kontrol edildikten sonra paketiniz aktif edilecektir. Bu işlem genellikle 1-24 saat içinde tamamlanır."
              : `${plan.charAt(0).toUpperCase() + plan.slice(1)} paketiniz başarıyla aktif edildi. 3 aylık aboneliğiniz başlamıştır.`
            }
          </p>

          {method !== "eft" && (
            <div className="glass-sm p-4 mb-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground capitalize">{plan} Paket</p>
                  <p className="text-xs text-foreground/50">3 Aylık Abonelik</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-foreground/50">Pro Kredi</span>
                  <span className="text-foreground font-medium">+100.000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/50">Bonus Kredi</span>
                  <span className="text-[hsl(var(--success))] font-medium">+1.000</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="flex items-center justify-center w-full h-11 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Dashboard'a Git
            </Link>
            <Link
              to="/invoices"
              className="flex items-center justify-center w-full h-11 rounded-xl border border-border bg-secondary/50 text-foreground text-sm font-medium hover:bg-secondary transition-colors"
            >
              Faturalarımı Görüntüle
            </Link>
          </div>

          <p className="text-[10px] text-foreground/50 mt-6">
            Ödeme ile ilgili sorularınız için destek@fortext.com.tr adresine ulaşabilirsiniz.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;
