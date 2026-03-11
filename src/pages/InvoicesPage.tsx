import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, getDoc, doc, getDocs } from "firebase/firestore";

interface Invoice {
  id: string;
  invoiceNo: string;
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  plan: string;
  amount: number;
  tax: number;
  total: number;
  billingInfo: {
    fullName: string;
    address: string;
    city: string;
    taxNumber?: string;
    companyName?: string;
  };
  status: string;
  createdAt: string;
}

interface InvoiceSettings {
  companyName: string;
  companyAddress: string;
  companyLogo?: string;
  startNumber: number;
}

const InvoicesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    companyName: "Fortext Yazılım",
    companyAddress: "İstanbul, Türkiye",
    startNumber: 1000
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Fatura ayarlarını yükle
    getDoc(doc(db, "settings", "invoiceConfig")).then((snap) => {
      if (snap.exists()) {
        setInvoiceSettings(snap.data() as InvoiceSettings);
      }
    });

    // Kullanicinin faturalarini dinle - userId veya email ile sorgula
    // Önce userId ile dene, sonra email ile
    const fetchInvoices = async () => {
      try {
        // userId ile sorgula
        const q1 = query(
          collection(db, "invoices"),
          where("userId", "==", user.id)
        );
        
        const unsub = onSnapshot(q1, (snapshot) => {
          const list: Invoice[] = [];
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...d.data() } as Invoice);
          });
          // Tarihe göre sırala (client-side)
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setInvoices(list);
          setLoading(false);
        }, async (error) => {
          console.error("Invoice query error:", error);
          // userId ile hata olursa email ile dene
          try {
            const q2 = query(
              collection(db, "invoices"),
              where("userEmail", "==", user.email)
            );
            const snapshot = await getDocs(q2);
            const list: Invoice[] = [];
            snapshot.forEach((d) => {
              list.push({ id: d.id, ...d.data() } as Invoice);
            });
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setInvoices(list);
          } catch (e) {
            console.error("Invoice email query error:", e);
            setInvoices([]);
          }
          setLoading(false);
        });
        
        return unsub;
      } catch (error) {
        console.error("Invoice fetch error:", error);
        setInvoices([]);
        setLoading(false);
        return () => {};
      }
    };
    
    let unsubscribe: (() => void) | undefined;
    fetchInvoices().then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, navigate]);

  const generatePDF = (invoice: Invoice) => {
    // PDF oluşturma - basit HTML to PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Fatura - ${invoice.invoiceNo}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', system-ui, sans-serif; }
          body { padding: 40px; background: #fff; color: #1a1a1a; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #0066ff; padding-bottom: 20px; }
          .company { }
          .company h1 { font-size: 24px; color: #0066ff; margin-bottom: 8px; }
          .company p { font-size: 12px; color: #666; }
          .invoice-info { text-align: right; }
          .invoice-info h2 { font-size: 28px; color: #1a1a1a; margin-bottom: 8px; }
          .invoice-info p { font-size: 12px; color: #666; margin-bottom: 4px; }
          .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .party { }
          .party h3 { font-size: 10px; text-transform: uppercase; color: #999; margin-bottom: 8px; letter-spacing: 1px; }
          .party p { font-size: 13px; color: #333; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #f5f5f5; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #666; border-bottom: 2px solid #ddd; }
          td { padding: 14px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
          .totals { margin-left: auto; width: 280px; }
          .totals .row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
          .totals .row.total { border-top: 2px solid #1a1a1a; margin-top: 8px; padding-top: 12px; font-weight: bold; font-size: 16px; }
          .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #999; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company">
            <h1>${invoiceSettings.companyName}</h1>
            <p>${invoiceSettings.companyAddress}</p>
          </div>
          <div class="invoice-info">
            <h2>FATURA</h2>
            <p><strong>Belge No:</strong> ${invoice.invoiceNo}</p>
            <p><strong>Tarih:</strong> ${new Date(invoice.createdAt).toLocaleDateString('tr-TR')}</p>
          </div>
        </div>

        <div class="parties">
          <div class="party">
            <h3>Fatura Edilen</h3>
            <p><strong>${invoice.billingInfo?.fullName || invoice.userName}</strong></p>
            <p>${invoice.billingInfo?.address || ''}</p>
            <p>${invoice.billingInfo?.city || ''}</p>
            ${invoice.billingInfo?.taxNumber ? `<p>Vergi No: ${invoice.billingInfo.taxNumber}</p>` : ''}
            <p>${invoice.userEmail}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Açıklama</th>
              <th>Miktar</th>
              <th>Birim Fiyat</th>
              <th style="text-align: right">Toplam</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${invoice.plan.charAt(0).toUpperCase() + invoice.plan.slice(1)} Paket - 3 Aylik Abonelik</td>
              <td>1</td>
              <td>${invoice.amount.toLocaleString('tr-TR')} TL</td>
              <td style="text-align: right">${invoice.amount.toLocaleString('tr-TR')} TL</td>
            </tr>
          </tbody>
        </table>

        <div class="totals">
          <div class="row">
            <span>Ara Toplam</span>
            <span>${invoice.amount.toLocaleString('tr-TR')} TL</span>
          </div>
          <div class="row">
            <span>KDV (%18)</span>
            <span>${invoice.tax.toLocaleString('tr-TR')} TL</span>
          </div>
          <div class="row total">
            <span>Genel Toplam</span>
            <span>${invoice.total.toLocaleString('tr-TR')} TL</span>
          </div>
        </div>

        <div class="footer">
          <p>Bu belge elektronik ortamda oluşturulmuştur.</p>
          <p>${invoiceSettings.companyName} - ${new Date().getFullYear()}</p>
        </div>

        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="h-14 flex items-center px-4 lg:px-8 border-b border-border/10">
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Dashboard'a Dön
        </Link>
      </div>

      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Faturalarım</h1>
          <p className="text-sm text-foreground/55">Tüm faturalarınızı buradan görüntüleyebilir ve indirebilirsiniz.</p>
        </div>

        {loading ? (
          <div className="glass p-12 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-foreground/55">Faturalar yükleniyor...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="glass p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-foreground/50">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <p className="text-foreground font-medium mb-1">Henüz faturanız yok</p>
            <p className="text-sm text-foreground/55">Pro paket satın aldığınızda faturalarınız burada görünecek.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{invoice.invoiceNo}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(invoice.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{invoice.total.toLocaleString('tr-TR')} TL</p>
                      <p className="text-xs text-muted-foreground capitalize">{invoice.plan} Paket</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                      >
                        Görüntüle
                      </button>
                      <button
                        onClick={() => generatePDF(invoice)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                      >
                        PDF İndir
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Fatura Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedInvoice(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-6 max-w-lg w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Fatura Detayı</h3>
              <button onClick={() => setSelectedInvoice(null)} className="text-foreground/50 hover:text-foreground">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-border/20">
                <span className="text-sm text-foreground/55">Belge No</span>
                <span className="text-sm font-medium text-foreground">{selectedInvoice.invoiceNo}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/20">
                <span className="text-sm text-foreground/55">Tarih</span>
                <span className="text-sm text-foreground">{new Date(selectedInvoice.createdAt).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/20">
                <span className="text-sm text-foreground/55">Paket</span>
                <span className="text-sm text-foreground capitalize">{selectedInvoice.plan}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/20">
                <span className="text-sm text-foreground/55">Ara Toplam</span>
                <span className="text-sm text-foreground">{selectedInvoice.amount.toLocaleString('tr-TR')} TL</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/20">
                <span className="text-sm text-foreground/55">KDV (%18)</span>
                <span className="text-sm text-foreground">{selectedInvoice.tax.toLocaleString('tr-TR')} TL</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm font-semibold text-foreground">Toplam</span>
                <span className="text-sm font-semibold text-foreground">{selectedInvoice.total.toLocaleString('tr-TR')} TL</span>
              </div>
            </div>
            
            <button
              onClick={() => generatePDF(selectedInvoice)}
              className="w-full h-11 mt-6 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              PDF Olarak İndir
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
