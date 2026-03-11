import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

const PaymentFailedPage = () => {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason") || "unknown";

  const getErrorMessage = () => {
    switch (reason) {
      case "insufficient_funds":
        return "Kartınızda yeterli bakiye bulunmuyor. Lütfen farklı bir kart deneyin veya bakiyenizi kontrol edin.";
      case "card_declined":
        return "Kartınız reddedildi. Lütfen kart bilgilerinizi kontrol edin veya bankanızla iletişime geçin.";
      case "expired_card":
        return "Kartınızın son kullanma tarihi geçmiş. Lütfen geçerli bir kart kullanın.";
      case "invalid_card":
        return "Girdiğiniz kart bilgileri geçersiz. Lütfen bilgilerinizi kontrol edip tekrar deneyin.";
      case "timeout":
        return "İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.";
      case "cancelled":
        return "Ödeme işlemi iptal edildi.";
      default:
        return "Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin veya farklı bir ödeme yöntemi kullanın.";
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="hsl(var(--destructive))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-semibold text-foreground mb-2">Ödeme Başarısız</h1>
          
          <p className="text-sm text-foreground/55 mb-6">
            {getErrorMessage()}
          </p>

          <div className="glass-sm p-4 mb-6 text-left border-l-2 border-[hsl(var(--warning))]">
            <p className="text-xs text-foreground/55">
              <strong className="text-foreground">Not:</strong> Kartınızdan herhangi bir tutar çekilmedi. Güvenli bir şekilde tekrar deneyebilirsiniz.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/payment"
              className="flex items-center justify-center w-full h-11 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Tekrar Dene
            </Link>
            <Link
              to="/payment"
              state={{ method: "eft" }}
              className="flex items-center justify-center w-full h-11 rounded-xl border border-border bg-secondary/50 text-foreground text-sm font-medium hover:bg-secondary transition-colors"
            >
              EFT/Havale ile Öde
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center justify-center w-full h-11 rounded-xl text-foreground/70 text-sm font-medium hover:text-foreground transition-colors"
            >
              Dashboard'a Dön
            </Link>
          </div>

          <p className="text-[10px] text-foreground/50 mt-6">
            Sorun devam ederse destek@fortext.com.tr adresine ulaşabilirsiniz.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailedPage;
