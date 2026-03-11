import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface Invoice {
  id: string;
  invoiceNo: string;
  userId: string;
  userEmail: string;
  userName?: string;
  plan: string;
  amount: number;
  tax?: number;
  total: number;
  createdAt: string;
  status?: string;
}

interface InvoiceSettings {
  companyName: string;
  companyAddress: string;
}

const InvoiceViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<InvoiceSettings>({ companyName: "Fortext Yazılım", companyAddress: "İstanbul, Türkiye" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) { setError(true); setLoading(false); return; }

    const fetchInvoice = async () => {
      try {
        const invDoc = await getDoc(doc(db, "invoices", id));
        if (!invDoc.exists()) {
          setError(true);
          setLoading(false);
          return;
        }
        setInvoice({ id: invDoc.id, ...invDoc.data() } as Invoice);
        
        const settingsDoc = await getDoc(doc(db, "settings", "invoiceConfig"));
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data() as InvoiceSettings);
        }
        setLoading(false);
      } catch (e) {
        console.error("Invoice fetch error:", e);
        setError(true);
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground/50">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="hsl(var(--destructive))" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">Fatura Bulunamadı</h1>
          <p className="text-sm text-foreground/60 mb-6">Bu fatura mevcut değil veya erişim izniniz yok.</p>
          <Link to="/" className="inline-flex items-center justify-center h-10 px-6 rounded-xl bg-foreground text-background text-sm font-semibold">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link to="/invoices" className="text-sm text-foreground/50 hover:text-foreground flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Faturalarıma Dön
          </Link>
          <button onClick={handlePrint} className="px-4 py-2 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90">
            Yazdır / PDF
          </button>
        </div>

        <div className="glass p-8 print:shadow-none print:border-0">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b border-border/20">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">{settings.companyName}</h1>
              <p className="text-sm text-foreground/50">{settings.companyAddress}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-foreground/40 mb-1">Fatura No</p>
              <p className="text-lg font-semibold text-foreground mono">{invoice.invoiceNo}</p>
              <p className="text-xs text-foreground/40 mt-2">{new Date(invoice.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Billing Info */}
          <div className="mb-8">
            <p className="text-xs text-foreground/40 mb-2">Fatura Edilen</p>
            <p className="text-sm font-medium text-foreground">{invoice.userName || invoice.userEmail}</p>
            <p className="text-sm text-foreground/60">{invoice.userEmail}</p>
          </div>

          {/* Items */}
          <div className="mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-3 text-foreground/50 font-medium">Açıklama</th>
                  <th className="text-right py-3 text-foreground/50 font-medium">Tutar</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/10">
                  <td className="py-4 text-foreground">
                    <p className="font-medium capitalize">{invoice.plan} Plan - 3 Aylık Abonelik</p>
                    <p className="text-xs text-foreground/50 mt-0.5">API erişimi ve kredi paketi</p>
                  </td>
                  <td className="py-4 text-right text-foreground">{invoice.amount?.toLocaleString('tr-TR')} TL</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-border/30 pt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-foreground/60">Ara Toplam</span>
              <span className="text-foreground">{invoice.amount?.toLocaleString('tr-TR')} TL</span>
            </div>
            {invoice.tax && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground/60">KDV (%18)</span>
                <span className="text-foreground">{invoice.tax?.toLocaleString('tr-TR')} TL</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-border/20">
              <span className="text-foreground">Toplam</span>
              <span className="text-foreground">{invoice.total?.toLocaleString('tr-TR')} TL</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border/20 text-center">
            <p className="text-xs text-foreground/40">Bu fatura elektronik olarak oluşturulmuştur.</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .glass { background: white !important; border: none !important; }
        }
      `}</style>
    </div>
  );
};

export default InvoiceViewPage;
