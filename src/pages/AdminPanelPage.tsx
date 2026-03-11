import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc, getDoc, onSnapshot, query, addDoc } from "firebase/firestore";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

interface DBUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  freeCredits: number;
  proCredits: number;
  requestsUsed: number;
  requestsLimit: number;
  createdAt: string;
  role?: string;
  subscription?: {
    status: string;
    startDate: string;
    endDate: string;
  };
}

interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  plan: string;
  amount: string;
  status: string;
  paymentMethod: string;
  eftDetails?: {
    senderName: string;
    referenceNo: string;
    declaredAmount: string;
  };
  date: string;
}

interface LogEntry {
  id: string;
  type: string;
  userId?: string;
  userEmail?: string;
  timestamp: string;
  details: string;
}

interface Invoice {
  id: string;
  invoiceNo: string;
  userId: string;
  userEmail: string;
  plan: string;
  amount: number;
  total: number;
  createdAt: string;
}

interface RequestLog {
  id: string;
  userId: string;
  endpoint: string;
  status: number;
  timestamp: string;
  carrier?: string;
}

type Tab = "overview" | "users" | "orders" | "logs" | "invoices" | "payments" | "smtp" | "templates" | "site" | "settings";

const tabs: { id: Tab; label: string; icon: JSX.Element }[] = [
  { id: "overview", label: "Genel Bakış", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg> },
  { id: "users", label: "Kullanıcılar", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { id: "orders", label: "Siparişler", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
  { id: "logs", label: "Loglar", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { id: "invoices", label: "Faturalar", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { id: "payments", label: "Ödeme", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="3"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { id: "smtp", label: "SMTP", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
  { id: "templates", label: "Mail Şablonları", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { id: "site", label: "Site İçerikleri", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
  { id: "settings", label: "Ayarlar", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

const defaultTemplates = [
  { id: "welcome", name: "Hoş Geldiniz", subject: "Fortext'e Hoş Geldiniz!", body: "Merhaba {{name}},\n\nFortext API'ye kaydınız başarıyla oluşturuldu.\nAPI Key: {{api_key}}\n\nİyi çalışmalar!" },
  { id: "payment_received", name: "Ödeme Alındı", subject: "Ödeme Bildiriminiz Alındı", body: "Merhaba {{name}},\n\nEFT/Havale ödeme bildiriminiz alındı.\nTutar: {{amount}}\n\nÖdemeniz en kısa sürede kontrol edilecektir." },
  { id: "payment_approved", name: "Ödeme Onaylandı", subject: "Ödemeniz Onaylandı!", body: "Merhaba {{name}},\n\nÖdemeniz onaylandı ve {{plan}} paketiniz aktif edildi.\nYeni krediniz: {{credits}}\n\nTeşekkürler!" },
  { id: "plan_active", name: "Paket Aktif", subject: "Pro Paketiniz Aktif!", body: "Merhaba {{name}},\n\n{{plan}} paketiniz başarıyla aktif edildi.\nAbonelik bitiş tarihi: {{end_date}}\n\nİyi çalışmalar!" },
  { id: "plan_suspended", name: "Paket Askıya Alındı", subject: "Aboneliğiniz Askıya Alındı", body: "Merhaba {{name}},\n\nAbonelik süresi doldu ve ödeme yapılmadığı için hesabınız askıya alındı.\nYeniden aktif etmek için ödeme yapın.\n\nFortext Ekibi" },
  { id: "invoice", name: "Fatura", subject: "Faturanız Oluşturuldu", body: "Merhaba {{name}},\n\nFaturanız oluşturuldu.\nFatura No: {{invoice_no}}\nTutar: {{amount}}\n\nFaturanızı dashboard üzerinden indirebilirsiniz." },
  { id: "password_reset", name: "Şifre Sıfırlama", subject: "Şifre Sıfırlama Talebi", body: "Merhaba {{name}},\n\nŞifre sıfırlama talebiniz alındı.\n\nAşağıdaki bağlantıya tıklayarak yeni şifrenizi belirleyebilirsiniz:\n{{reset_url}}\n\nBu bağlantı 30 dakika geçerlidir.\n\nEğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.\n\nFortext" },
];

const SidebarMenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-foreground/50">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 2V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 9L11 12L7 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AdminPanelPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [users, setUsers] = useState<DBUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [allRequests, setAllRequests] = useState<RequestLog[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState("");
  const [editLimit, setEditLimit] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editFreeCredits, setEditFreeCredits] = useState("");
  const [editProCredits, setEditProCredits] = useState("");
  const [templates, setTemplates] = useState(defaultTemplates);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState({ subject: "", body: "" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [smtpSaved, setSmtpSaved] = useState(false);
  const [paymentsSaved, setPaymentsSaved] = useState(false);
  const [plansSaved, setPlansSaved] = useState(false);
  const [siteSaved, setSiteSaved] = useState(false);
  const [invoiceSettingsSaved, setInvoiceSettingsSaved] = useState(false);

  const [smtp, setSmtp] = useState({
    host: "",
    port: "587",
    user: "",
    pass: "",
    from: "",
    secure: true,
  });

  const [payments, setPayments] = useState({
    enabled: true,
    methods: {
      creditCard: true,
      bankTransfer: true,
    },
    currency: "TRY",
    taxRate: "18",
    bankInfo: {
      bankName: "Ziraat Bankası",
      iban: "TR00 0000 0000 0000 0000 0000 00",
      accountHolder: "Fortext Yazılım"
    },
    paytr: {
      merchantId: "",
      merchantKey: "",
      merchantSalt: "",
      testMode: true
    }
  });

  const [planSettings, setPlanSettings] = useState({
    freeLimit: "100",
    freePeriod: "3",
    proPrice: "500",
    proLimit: "100000",
    proPeriod: "90",
    enterprisePrice: "2499",
    enterpriseLimit: "0",
    enterprisePeriod: "90",
  });

  const [siteContent, setSiteContent] = useState({
    copyright: "2024 Fortext. Tüm hakları saklıdır.",
    privacyPolicy: "",
    termsOfService: "",
    cookiePolicy: "",
    footerText: "Kargo takip API çözümü",
  });

  const [invoiceSettings, setInvoiceSettings] = useState({
    companyName: "Fortext Yazılım",
    companyAddress: "İstanbul, Türkiye",
    startNumber: 1000,
  });

  useEffect(() => {
    const isAdmin = localStorage.getItem("fortext_admin");
    if (!isAdmin) { navigate("/fortext/login"); return; }

    const unsubscribers: (() => void)[] = [];

    try {
      // Users
      const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        try {
          const list: DBUser[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as DBUser));
          setUsers(list);
        } catch (e) { console.error("Users parse error:", e); }
      }, (err) => { console.error("Users error:", err); });
      unsubscribers.push(unsubUsers);

      // Orders
      const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
        try {
          const list: Order[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Order));
          list.sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
          });
          setOrders(list);
        } catch (e) { console.error("Orders parse error:", e); }
      }, (err) => { console.error("Orders error:", err); });
      unsubscribers.push(unsubOrders);

      // Logs
      const unsubLogs = onSnapshot(collection(db, "logs"), (snapshot) => {
        try {
          const list: LogEntry[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as LogEntry));
          list.sort((a, b) => {
            const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return dateB - dateA;
          });
          setLogs(list.slice(0, 100));
        } catch (e) { console.error("Logs parse error:", e); }
      }, (err) => { console.error("Logs error:", err); });
      unsubscribers.push(unsubLogs);

      // Invoices
      const unsubInvoices = onSnapshot(collection(db, "invoices"), (snapshot) => {
        try {
          const list: Invoice[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Invoice));
          list.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          setInvoices(list.slice(0, 50));
        } catch (e) { console.error("Invoices parse error:", e); }
      }, (err) => { console.error("Invoices error:", err); });
      unsubscribers.push(unsubInvoices);

      // Requests
      const unsubReqs = onSnapshot(collection(db, "requests"), (snapshot) => {
        try {
          const list: RequestLog[] = [];
          snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as RequestLog));
          list.sort((a, b) => {
            const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return dateB - dateA;
          });
          setAllRequests(list.slice(0, 100));
        } catch (e) { console.error("Requests parse error:", e); }
      }, (err) => { console.error("Requests error:", err); });
      unsubscribers.push(unsubReqs);
    } catch (error: any) {
      console.error("Admin panel init error:", error);
    }

    // Load settings
    getDoc(doc(db, "settings", "smtp")).then((snap) => { if (snap.exists()) setSmtp(snap.data() as any); });
    getDoc(doc(db, "settings", "payments")).then((snap) => { 
      if (snap.exists()) {
        const data = snap.data();
        setPayments(prev => ({ 
          ...prev, 
          ...data,
          methods: { ...prev.methods, ...(data.methods || {}) },
          bankInfo: { ...prev.bankInfo, ...(data.bankInfo || {}) },
          paytr: { ...prev.paytr, ...(data.paytr || {}) }
        }));
      }
    });
    getDoc(doc(db, "settings", "plans")).then((snap) => { if (snap.exists()) setPlanSettings(snap.data() as any); });
    getDoc(doc(db, "settings", "site")).then((snap) => { if (snap.exists()) setSiteContent(snap.data() as any); });
    getDoc(doc(db, "settings", "invoiceConfig")).then((snap) => { if (snap.exists()) setInvoiceSettings(snap.data() as any); });
    getDoc(doc(db, "templates", "all")).then((snap) => { if (snap.exists() && snap.data()?.list) setTemplates(snap.data().list); });

    return () => { 
      unsubscribers.forEach(unsub => { try { unsub(); } catch (e) {} }); 
    };
  }, [navigate]);

  const deleteUser = async (id: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return;
    await deleteDoc(doc(db, "users", id));
    await addLog("user_delete", "", "", `Kullanıcı silindi: ${id}`);
  };

  const saveUserEdit = async (id: string) => {
    await updateDoc(doc(db, "users", id), { 
      plan: editPlan, 
      requestsLimit: parseInt(editLimit), 
      role: editRole,
      freeCredits: parseInt(editFreeCredits) || 0,
      proCredits: parseInt(editProCredits) || 0
    });
    await addLog("user_update", id, "", `Kullanıcı güncellendi - Plan: ${editPlan}`);
    setEditingUser(null);
  };

  const startEdit = (u: DBUser) => {
    setEditingUser(u.id);
    setEditPlan(u.plan);
    setEditLimit(String(u.requestsLimit));
    setEditRole(u.role || "user");
    setEditFreeCredits(String(u.freeCredits || 0));
    setEditProCredits(String(u.proCredits || 0));
  };

  const approveOrder = async (order: Order) => {
    if (!confirm("Bu siparişi onaylamak istediğinize emin misiniz?")) return;
    
    // Kullanıcıyı bul ve güncelle
    const userDoc = await getDoc(doc(db, "users", order.userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const now = new Date();
      const endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      
      await updateDoc(doc(db, "users", order.userId), {
        plan: order.plan,
        proCredits: (userData.proCredits || 0) + 100000 + 1000,
        subscription: {
          status: "active",
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
          lastPaymentDate: now.toISOString(),
          autoRenew: true
        }
      });
    }
    
    // Siparişi onayla
    await updateDoc(doc(db, "orders", order.id), { 
      status: "completed",
      completedAt: new Date().toISOString()
    });
    
    // Fatura oluştur
    const settingsSnap = await getDoc(doc(db, "settings", "invoice"));
    let invoiceNo = 1001;
    if (settingsSnap.exists()) {
      invoiceNo = (settingsSnap.data().lastNumber || 1000) + 1;
    }
    await setDoc(doc(db, "settings", "invoice"), { lastNumber: invoiceNo }, { merge: true });
    
    const amount = parseInt(order.amount.replace(/[^0-9]/g, '')) || 0;
    await addDoc(collection(db, "invoices"), {
      invoiceNo: `FTX-${invoiceNo}`,
      orderId: order.id,
      userId: order.userId,
      userEmail: order.userEmail,
      userName: order.userName,
      plan: order.plan,
      amount: amount,
      tax: Math.round(amount * 0.18),
      total: Math.round(amount * 1.18),
      status: "issued",
      createdAt: new Date().toISOString()
    });
    
    await addLog("order_approved", order.userId, order.userEmail, `Sipariş onaylandı: ${order.id}`);
  };

  const rejectOrder = async (order: Order) => {
    if (!confirm("Bu siparişi reddetmek istediğinize emin misiniz?")) return;
    await updateDoc(doc(db, "orders", order.id), { status: "rejected" });
    await addLog("order_rejected", order.userId, order.userEmail, `Sipariş reddedildi: ${order.id}`);
  };

  const addLog = async (type: string, userId: string, userEmail: string, details: string) => {
    await setDoc(doc(db, "logs", `${Date.now()}_${type}`), {
      type,
      userId,
      userEmail,
      timestamp: new Date().toISOString(),
      details
    });
  };

  const startTemplateEdit = (t: typeof defaultTemplates[0]) => {
    setEditingTemplate(t.id);
    setTemplateForm({ subject: t.subject, body: t.body });
  };

  const saveTemplate = async (id: string) => {
    const updated = templates.map(t => t.id === id ? { ...t, ...templateForm } : t);
    setTemplates(updated);
    await setDoc(doc(db, "templates", "all"), { list: updated });
    setEditingTemplate(null);
  };

  const saveSmtp = async () => {
    await setDoc(doc(db, "settings", "smtp"), smtp);
    setSmtpSaved(true);
    setTimeout(() => setSmtpSaved(false), 2000);
  };

  const savePayments = async () => {
    await setDoc(doc(db, "settings", "payments"), payments);
    setPaymentsSaved(true);
    setTimeout(() => setPaymentsSaved(false), 2000);
  };

  const savePlanSettings = async () => {
    await setDoc(doc(db, "settings", "plans"), planSettings);
    setPlansSaved(true);
    setTimeout(() => setPlansSaved(false), 2000);
  };

  const saveSiteContent = async () => {
    await setDoc(doc(db, "settings", "site"), siteContent);
    setSiteSaved(true);
    setTimeout(() => setSiteSaved(false), 2000);
  };

  const saveInvoiceSettings = async () => {
    await setDoc(doc(db, "settings", "invoiceConfig"), invoiceSettings);
    setInvoiceSettingsSaved(true);
    setTimeout(() => setInvoiceSettingsSaved(false), 2000);
  };

  // Stats
  const totalRequests = allRequests.length;
  const paidUsers = users.filter(u => u.plan === "pro" || u.plan === "enterprise").length;
  const freeUsers = users.filter(u => u.plan === "free").length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const totalRevenue = orders.filter(o => o.status === "completed").reduce((s, o) => {
    const num = parseFloat(o.amount?.replace(/[^0-9.]/g, "") || "0");
    return s + num;
  }, 0);

  const planDistribution = [
    { name: "Free", value: freeUsers || 0, color: "hsl(0, 0%, 40%)" },
    { name: "Pro", value: users.filter(u => u.plan === "pro").length || 0, color: "hsl(211, 100%, 50%)" },
    { name: "Enterprise", value: users.filter(u => u.plan === "enterprise").length || 0, color: "hsl(195, 100%, 75%)" },
  ];

  const StatCard = ({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) => (
    <div className={`glass p-5 ${highlight ? 'border-[hsl(var(--warning))]/30' : ''}`}>
      <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-semibold mb-2">{label}</p>
      <p className={`text-2xl font-semibold ${highlight ? 'text-[hsl(var(--warning))]' : 'text-foreground'}`}>{value}</p>
      {sub && <p className="text-[11px] text-foreground/40 mt-1">{sub}</p>}
    </div>
  );

  const getLogTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      user_register: "Kayıt",
      user_update: "Güncelleme",
      user_delete: "Silme",
      order_approved: "Sipariş Onay",
      order_rejected: "Sipariş Red",
      eft_payment_request: "EFT Talebi",
      card_payment_success: "Kart Ödeme",
      admin_login: "Admin Giriş",
      system_error: "Hata"
    };
    return labels[type] || type;
  };

  const getLogTypeColor = (type: string) => {
    if (type.includes("error")) return "bg-destructive/10 text-destructive";
    if (type.includes("approved") || type.includes("success")) return "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]";
    if (type.includes("rejected")) return "bg-destructive/10 text-destructive";
    return "bg-primary/10 text-primary";
  };

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static top-0 left-0 h-full w-60 flex-shrink-0 border-r border-border/10 bg-background flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-14 flex items-center justify-between px-5 border-b border-border/10">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-foreground">fortext</span>
            <span className="text-[9px] font-medium text-foreground/50 bg-muted/50 px-1.5 py-0.5 rounded-md">admin</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setSidebarOpen(false); }}
            className="lg:hidden text-foreground/40 hover:text-foreground transition-colors p-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-auto">
          <p className="px-3 py-2 text-[9px] uppercase tracking-widest text-foreground/30 font-semibold">Menü</p>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all flex items-center gap-2.5 ${
                activeTab === t.id
                  ? "text-foreground bg-foreground/[0.07]"
                  : "text-foreground/40 hover:text-foreground/70 hover:bg-foreground/[0.03]"
              }`}
            >
              <span className={activeTab === t.id ? "text-foreground" : "text-foreground/30"}>{t.icon}</span>
              {t.label}
              {t.id === "orders" && pendingOrders > 0 && (
                <span className="ml-auto bg-[hsl(var(--warning))] text-background text-[9px] font-bold px-1.5 py-0.5 rounded-full">{pendingOrders}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border/10 space-y-1">
          <button
            onClick={() => { localStorage.removeItem("fortext_admin"); navigate("/"); }}
            className="w-full text-left px-3 py-2 rounded-xl text-[12px] text-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-all flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto min-w-0">
        <div className="h-14 flex items-center px-4 lg:px-8 border-b border-border/10 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-foreground/[0.05] transition-colors">
            <SidebarMenuIcon />
          </button>
          <h1 className="text-sm font-semibold text-foreground">{tabs.find(t => t.id === activeTab)?.label}</h1>
        </div>

        <div className="p-4 lg:p-8 max-w-6xl">

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <StatCard label="Kullanıcılar" value={String(users.length || 0)} sub="Toplam" />
                <StatCard label="İstekler" value={String(totalRequests || 0)} sub="Son 100" />
                <StatCard label="Gelir" value={`${(totalRevenue || 0).toLocaleString()} TL`} sub="Onaylanan" />
                <StatCard label="Pro" value={String(paidUsers || 0)} sub={`${freeUsers || 0} free`} />
                <StatCard label="Bekleyen" value={String(pendingOrders || 0)} sub="Sipariş" highlight={pendingOrders > 0} />
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="glass p-5">
                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-semibold mb-4">Plan Dağılımı</p>
                  {users.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={planDistribution.filter(p => p.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                          {planDistribution.filter(p => p.value > 0).map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend formatter={(value) => <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{value}</span>} />
                        <Tooltip contentStyle={{ background: "hsl(0,0%,6%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-center py-8 text-sm text-foreground/30">Kullanıcı yok</p>
                  )}
                </div>

                <div className="glass p-5">
                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-semibold mb-3">Son Loglar</p>
                  {logs.length === 0 ? (
                    <p className="text-center py-8 text-sm text-foreground/30">Henüz log yok</p>
                  ) : (
                    <div className="space-y-1 max-h-[200px] overflow-auto">
                      {logs.slice(0, 8).map((l) => (
                        <div key={l.id} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-foreground/[0.02]">
                          <span className={`rounded-md px-2 py-0.5 text-[9px] font-semibold ${getLogTypeColor(l.type)}`}>
                            {getLogTypeLabel(l.type)}
                          </span>
                          <span className="text-[11px] text-foreground/50 truncate flex-1">{l.details}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* USERS */}
          {activeTab === "users" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-foreground/50">{users.length} kayıtlı kullanıcı</p>
              </div>
              {users.length === 0 ? (
                <div className="glass p-12 text-center">
                  <p className="text-foreground/60 text-sm">Henüz kayıtlı kullanıcı yok.</p>
                </div>
              ) : (
                <div className="glass overflow-x-auto">
                  <table className="w-full text-xs min-w-[900px]">
                    <thead>
                      <tr className="border-b border-border/30">
<th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">İsim</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">E-posta</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Plan</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Free Kr.</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Pro Kr.</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Abonelik</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Rol</th>
                  <th className="text-right py-3.5 px-4 text-foreground/40 font-semibold">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-border/10 hover:bg-foreground/[0.02]">
                          <td className="py-3 px-4 text-foreground/80">{u.name}</td>
                          <td className="py-3 px-4 mono text-foreground/50 text-[10px]">{u.email}</td>
                          <td className="py-3 px-4">
                            {editingUser === u.id ? (
                              <select value={editPlan} onChange={e => setEditPlan(e.target.value)} className="bg-secondary border border-border rounded-lg px-2 py-1 text-[11px] text-foreground">
                                <option value="free">Free</option>
                                <option value="pro">Pro</option>
                                <option value="enterprise">Enterprise</option>
                              </select>
                            ) : (
                              <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary capitalize">{u.plan}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-foreground/50">
                            {editingUser === u.id ? (
                              <input type="number" value={editFreeCredits} onChange={e => setEditFreeCredits(e.target.value)} className="bg-secondary border border-border rounded-lg px-2 py-1 text-[11px] text-foreground w-16" />
                            ) : (
                              u.freeCredits || 0
                            )}
                          </td>
                          <td className="py-3 px-4 text-foreground/50">
                            {editingUser === u.id ? (
                              <input type="number" value={editProCredits} onChange={e => setEditProCredits(e.target.value)} className="bg-secondary border border-border rounded-lg px-2 py-1 text-[11px] text-foreground w-20" />
                            ) : (
                              u.proCredits || 0
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {u.subscription ? (
                              <span className={`rounded-md px-2 py-0.5 text-[9px] font-semibold ${u.subscription.status === 'active' ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]' : 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]'}`}>
                                {u.subscription.status === 'active' ? 'Aktif' : 'Askıda'}
                              </span>
                            ) : (
                              <span className="text-foreground/30 text-[10px]">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {editingUser === u.id ? (
                              <select value={editRole} onChange={e => setEditRole(e.target.value)} className="bg-secondary border border-border rounded-lg px-2 py-1 text-[11px] text-foreground">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            ) : (
                              <span className={`text-[10px] font-medium ${u.role === "admin" ? "text-[hsl(var(--warning))]" : "text-foreground/40"}`}>{u.role || "user"}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {editingUser === u.id ? (
                              <div className="flex gap-1 justify-end">
                                <button onClick={() => saveUserEdit(u.id)} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Kaydet</button>
                                <button onClick={() => setEditingUser(null)} className="px-2.5 py-1 rounded-lg text-[10px] text-foreground/50 hover:text-muted-foreground transition-colors">İptal</button>
                              </div>
                            ) : (
                              <div className="flex gap-1 justify-end">
                                <button onClick={() => startEdit(u)} className="px-2.5 py-1 rounded-lg text-[10px] text-foreground/40 hover:text-foreground hover:bg-foreground/[0.05] transition-all">Düzenle</button>
                                <button onClick={() => deleteUser(u.id)} className="px-2.5 py-1 rounded-lg text-[10px] text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all">Sil</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ORDERS */}
          {activeTab === "orders" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-3 mb-4">
                <p className="text-xs text-foreground/50">{orders.length} sipariş</p>
                {pendingOrders > 0 && (
                  <span className="bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] text-[10px] font-semibold px-2 py-0.5 rounded-lg">{pendingOrders} bekliyor</span>
                )}
              </div>
              {orders.length === 0 ? (
                <div className="glass p-12 text-center">
                  <p className="text-foreground/60 text-sm">Henüz sipariş yok.</p>
                </div>
              ) : (
                <div className="glass overflow-x-auto">
                  <table className="w-full text-xs min-w-[800px]">
                    <thead>
                      <tr className="border-b border-border/30">
<th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">ID</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Kullanıcı</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Plan</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Tutar</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Yöntem</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Durum</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Tarih</th>
                  <th className="text-right py-3.5 px-4 text-foreground/40 font-semibold">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className={`border-b border-border/10 hover:bg-foreground/[0.02] ${o.status === 'pending' ? 'bg-[hsl(var(--warning))]/[0.02]' : ''}`}>
                          <td className="py-3 px-4 mono text-foreground/60">{o.id.slice(0, 8)}</td>
                          <td className="py-3 px-4">
                            <p className="text-foreground/80">{o.userName}</p>
                            <p className="text-foreground/40 text-[10px]">{o.userEmail}</p>
                          </td>
                          <td className="py-3 px-4 text-foreground/50 capitalize">{o.plan}</td>
                          <td className="py-3 px-4 text-foreground/70 font-medium">{o.amount}</td>
                          <td className="py-3 px-4">
                            <span className={`rounded-md px-2 py-0.5 text-[9px] font-semibold ${o.paymentMethod === 'eft' ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]' : 'bg-primary/10 text-primary'}`}>
                              {o.paymentMethod === 'eft' ? 'EFT' : 'Kart'}
                            </span>
                            {o.eftDetails && (
                              <p className="text-[9px] text-foreground/40 mt-1">Ref: {o.eftDetails.referenceNo}</p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                              o.status === "completed" ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : 
                              o.status === "pending" ? "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]" :
                              "bg-destructive/10 text-destructive"
                            }`}>
                              {o.status === "completed" ? "Onaylandı" : o.status === "pending" ? "Bekliyor" : "Reddedildi"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-foreground/30">{new Date(o.date).toLocaleDateString('tr-TR')}</td>
                          <td className="py-3 px-4 text-right">
                            {o.status === "pending" && (
                              <div className="flex gap-1 justify-end">
                                <button onClick={() => approveOrder(o)} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/20 transition-colors">Onayla</button>
                                <button onClick={() => rejectOrder(o)} className="px-2.5 py-1 rounded-lg text-[10px] text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors">Reddet</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* LOGS */}
          {activeTab === "logs" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-xs text-foreground/50 mb-4">{logs.length} log kaydı</p>
              {logs.length === 0 ? (
                <div className="glass p-12 text-center">
                  <p className="text-foreground/60 text-sm">Henuz log yok.</p>
                </div>
              ) : (
                <div className="glass overflow-x-auto">
                  <table className="w-full text-xs min-w-[700px]">
                    <thead>
                      <tr className="border-b border-border/30">
<th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Tip</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Kullanıcı</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Detay</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Tarih</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((l) => (
                        <tr key={l.id} className="border-b border-border/10 hover:bg-foreground/[0.02]">
                          <td className="py-3 px-4">
                            <span className={`rounded-md px-2 py-0.5 text-[9px] font-semibold ${getLogTypeColor(l.type)}`}>
                              {getLogTypeLabel(l.type)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-foreground/50">{l.userEmail || '-'}</td>
                          <td className="py-3 px-4 text-foreground/70">{l.details}</td>
                          <td className="py-3 px-4 text-foreground/30">{new Date(l.timestamp).toLocaleString('tr-TR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* INVOICES */}
          {activeTab === "invoices" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="glass p-6 space-y-4">
                <h3 className="text-[13px] font-semibold text-foreground/80">Fatura Ayarlari</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-foreground/40 mb-1">Firma Adı</label>
                    <input value={invoiceSettings.companyName} onChange={e => setInvoiceSettings({ ...invoiceSettings, companyName: e.target.value })} className="w-full h-9 rounded-xl border border-border bg-secondary/50 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-foreground/40 mb-1">Başlangıç No</label>
                    <input type="number" value={invoiceSettings.startNumber} onChange={e => setInvoiceSettings({ ...invoiceSettings, startNumber: parseInt(e.target.value) })} className="w-full h-9 rounded-xl border border-border bg-secondary/50 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-foreground/40 mb-1">Firma Adresi</label>
                    <input value={invoiceSettings.companyAddress} onChange={e => setInvoiceSettings({ ...invoiceSettings, companyAddress: e.target.value })} className="w-full h-9 rounded-xl border border-border bg-secondary/50 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                </div>
                <button onClick={saveInvoiceSettings} className="px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity">
                  {invoiceSettingsSaved ? "Kaydedildi" : "Fatura Ayarlarini Kaydet"}
                </button>
              </div>

              <p className="text-xs text-foreground/50">{invoices.length} fatura</p>
              {invoices.length === 0 ? (
                <div className="glass p-12 text-center">
                  <p className="text-foreground/60 text-sm">Henüz fatura yok.</p>
                </div>
              ) : (
                <div className="glass overflow-x-auto">
                  <table className="w-full text-xs min-w-[600px]">
                    <thead>
                      <tr className="border-b border-border/30">
<th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Fatura No</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Kullanıcı</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Plan</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Tutar</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold">Tarih</th>
                  <th className="text-left py-3.5 px-4 text-foreground/40 font-semibold"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="border-b border-border/10 hover:bg-foreground/[0.02]">
                          <td className="py-3 px-4 mono text-foreground/70 font-medium">{inv.invoiceNo}</td>
                          <td className="py-3 px-4 text-foreground/50">{inv.userEmail}</td>
                          <td className="py-3 px-4 text-foreground/50 capitalize">{inv.plan}</td>
                          <td className="py-3 px-4 text-foreground/70 font-medium">{inv.total?.toLocaleString()} TL</td>
                          <td className="py-3 px-4 text-foreground/30">{new Date(inv.createdAt).toLocaleDateString('tr-TR')}</td>
                          <td className="py-3 px-4">
                            <button onClick={() => window.open(`/invoice/${inv.id}`, '_blank')} className="px-2 py-1 text-[10px] rounded-lg bg-primary/10 text-primary hover:bg-primary/20">Görüntüle</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* PAYMENTS */}
          {activeTab === "payments" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl space-y-6">
              <div className="glass p-6 space-y-5">
                <h3 className="text-[13px] font-semibold text-foreground/80">Banka Bilgileri (EFT)</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-foreground/40 mb-1">Banka Adı</label>
                    <input value={payments.bankInfo.bankName} onChange={e => setPayments({ ...payments, bankInfo: { ...payments.bankInfo, bankName: e.target.value } })} className="w-full h-9 rounded-xl border border-border bg-secondary/50 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-foreground/40 mb-1">IBAN</label>
                    <input value={payments.bankInfo.iban} onChange={e => setPayments({ ...payments, bankInfo: { ...payments.bankInfo, iban: e.target.value } })} className="w-full h-9 rounded-xl border border-border bg-secondary/50 px-3 text-xs text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-foreground/40 mb-1">Hesap Sahibi</label>
                    <input value={payments.bankInfo.accountHolder} onChange={e => setPayments({ ...payments, bankInfo: { ...payments.bankInfo, accountHolder: e.target.value } })} className="w-full h-9 rounded-xl border border-border bg-secondary/50 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                </div>
              </div>

              <div className="glass p-6 space-y-5">
                <h3 className="text-[13px] font-semibold text-foreground/80">PayTR Ayarlari</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-foreground/40 mb-1">Merchant ID</label>
                    <input value={payments.paytr.merchantId} onChange={e => setPayments({ ...payments, paytr: { ...payments.paytr, merchantId: e.target.value } })} className="w-full h-9 rounded-xl border border-border bg-secondary/50 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" placeholder="PayTR Merchant ID" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-foreground/40 mb-1">Merchant Key</label>
                    <input value={payments.paytr.merchantKey} onChange={e => setPayments({ ...payments, paytr: { ...payments.paytr, merchantKey: e.target.value } })} className="w-full h-9 rounded-xl border border-border bg-secondary/50 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" placeholder="PayTR Merchant Key" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-foreground/40 mb-1">Merchant Salt</label>
                    <input value={payments.paytr.merchantSalt} onChange={e => setPayments({ ...payments, paytr: { ...payments.paytr, merchantSalt: e.target.value } })} className="w-full h-9 rounded-xl border border-border bg-secondary/50 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" placeholder="PayTR Merchant Salt" />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[12px] text-foreground/70">Test Modu</span>
                    <button
                      onClick={() => setPayments({ ...payments, paytr: { ...payments.paytr, testMode: !payments.paytr.testMode } })}
                      className={`w-10 h-5 rounded-full transition-all relative ${payments.paytr.testMode ? "bg-[hsl(var(--warning))]" : "bg-border"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${payments.paytr.testMode ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="glass p-6 space-y-5">
                <h3 className="text-[13px] font-semibold text-foreground/80">Ödeme Yöntemleri</h3>
                <p className="text-[10px] text-foreground/40">Aktif olmayan yöntemler kullanıcılara gösterilmez ve seçilemez.</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-secondary/30">
                    <div>
                      <span className="text-[12px] text-foreground/70">Kredi Kartı / Banka Kartı</span>
                      <p className="text-[10px] text-foreground/40">PayTR ile ödeme</p>
                    </div>
                    <button
                      onClick={() => setPayments({ ...payments, methods: { ...payments.methods, creditCard: !payments.methods.creditCard } })}
                      className={`w-10 h-5 rounded-full transition-all relative ${payments.methods.creditCard ? "bg-[hsl(var(--success))]" : "bg-border"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${payments.methods.creditCard ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-secondary/30">
                    <div>
                      <span className="text-[12px] text-foreground/70">EFT / Havale</span>
                      <p className="text-[10px] text-foreground/40">Manuel onay gerektirir</p>
                    </div>
                    <button
                      onClick={() => setPayments({ ...payments, methods: { ...payments.methods, bankTransfer: !payments.methods.bankTransfer } })}
                      className={`w-10 h-5 rounded-full transition-all relative ${payments.methods.bankTransfer ? "bg-[hsl(var(--success))]" : "bg-border"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${payments.methods.bankTransfer ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="glass p-6 space-y-5">
                <h3 className="text-[13px] font-semibold text-foreground/80">Plan Fiyatlandirmasi</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-foreground/40 mb-1">Pro Fiyat (TL/3 ay)</label>
                    <input type="number" value={planSettings.proPrice} onChange={e => setPlanSettings({ ...planSettings, proPrice: e.target.value })} className="w-full h-9 rounded-xl border border-border bg-secondary/50 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-foreground/40 mb-1">Pro Kredi</label>
                    <input type="number" value={planSettings.proLimit} onChange={e => setPlanSettings({ ...planSettings, proLimit: e.target.value })} className="w-full h-9 rounded-xl border border-border bg-secondary/50 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-foreground/40 mb-1">Free Kredi</label>
                    <input type="number" value={planSettings.freeLimit} onChange={e => setPlanSettings({ ...planSettings, freeLimit: e.target.value })} className="w-full h-9 rounded-xl border border-border bg-secondary/50 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-foreground/40 mb-1">KDV Oranı (%)</label>
                    <input type="number" value={payments.taxRate} onChange={e => setPayments({ ...payments, taxRate: e.target.value })} className="w-full h-9 rounded-xl border border-border bg-secondary/50 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={savePayments} className="px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity">
                    {paymentsSaved ? "Kaydedildi" : "Odeme Ayarlarini Kaydet"}
                  </button>
                  <button onClick={savePlanSettings} className="px-5 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors">
                    {plansSaved ? "Kaydedildi" : "Plan Ayarlarini Kaydet"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* SMTP */}
          {activeTab === "smtp" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl space-y-6">
              <div className="glass p-6 space-y-5">
                <div className="glass-sm p-3 border-l-2 border-primary/40">
                  <p className="text-[11px] text-foreground/50">
                    <strong className="text-foreground/60">CyberPanel SMTP:</strong> CyberPanel üzerinden oluşturduğunuz mail hesabınızın bilgilerini girin.
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-foreground/50 mb-1.5">SMTP Sunucu (Host)</label>
                  <input value={smtp.host} onChange={e => setSmtp({ ...smtp, host: e.target.value })} placeholder="mail.fortext.com.tr" className="w-full h-10 rounded-xl border border-border bg-secondary/50 px-4 text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-foreground/50 mb-1.5">Port</label>
                    <input value={smtp.port} onChange={e => setSmtp({ ...smtp, port: e.target.value })} className="w-full h-10 rounded-xl border border-border bg-secondary/50 px-4 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={smtp.secure} onChange={e => setSmtp({ ...smtp, secure: e.target.checked })} className="w-4 h-4 rounded border-border bg-secondary" />
                      <span className="text-[11px] text-foreground/50">SSL/TLS</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-foreground/50 mb-1.5">Kullanıcı Adı (E-posta)</label>
                  <input value={smtp.user} onChange={e => setSmtp({ ...smtp, user: e.target.value })} placeholder="noreply@fortext.com.tr" className="w-full h-10 rounded-xl border border-border bg-secondary/50 px-4 text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-foreground/50 mb-1.5">Şifre</label>
                  <input type="password" value={smtp.pass} onChange={e => setSmtp({ ...smtp, pass: e.target.value })} className="w-full h-10 rounded-xl border border-border bg-secondary/50 px-4 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-foreground/50 mb-1.5">Gonderen Adi</label>
                  <input value={smtp.from} onChange={e => setSmtp({ ...smtp, from: e.target.value })} placeholder="Fortext API" className="w-full h-10 rounded-xl border border-border bg-secondary/50 px-4 text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
                <button onClick={saveSmtp} className="px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity">
                  {smtpSaved ? "Kaydedildi" : "SMTP Ayarlarini Kaydet"}
                </button>
              </div>
            </motion.div>
          )}

          {/* TEMPLATES */}
          {activeTab === "templates" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {templates.map((t) => (
                <div key={t.id} className="glass p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[13px] font-semibold text-foreground/80">{t.name}</p>
                      <p className="text-[10px] text-foreground/40 mono">{t.id}</p>
                    </div>
                    <button onClick={() => startTemplateEdit(t)} className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-all">
                      Düzenle
                    </button>
                  </div>
                  {editingTemplate === t.id ? (
                    <div className="space-y-3">
                      <input value={templateForm.subject} onChange={e => setTemplateForm({ ...templateForm, subject: e.target.value })} className="w-full h-9 rounded-xl border border-border bg-secondary/50 px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" placeholder="Konu" />
                      <textarea value={templateForm.body} onChange={e => setTemplateForm({ ...templateForm, body: e.target.value })} rows={6} className="w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => saveTemplate(t.id)} className="px-4 py-2 rounded-xl bg-foreground text-background text-[11px] font-semibold hover:opacity-90 transition-opacity">Kaydet</button>
                        <button onClick={() => setEditingTemplate(null)} className="px-4 py-2 rounded-xl text-[11px] text-foreground/50 hover:text-foreground transition-colors">İptal</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-[11px] text-foreground/50 mb-1">Konu: {t.subject}</p>
                      <pre className="text-[10px] text-foreground/30 whitespace-pre-wrap">{t.body.slice(0, 100)}...</pre>
                    </>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* SITE CONTENT */}
          {activeTab === "site" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-6">
              <div className="glass p-6 space-y-5">
                <h3 className="text-[13px] font-semibold text-foreground/80">Genel Ayarlar</h3>
                <div>
                  <label className="block text-[11px] font-medium text-foreground/50 mb-1.5">Telif Hakkı Yazısı</label>
                  <input value={siteContent.copyright} onChange={e => setSiteContent({ ...siteContent, copyright: e.target.value })} className="w-full h-10 rounded-xl border border-border bg-secondary/50 px-4 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-foreground/50 mb-1.5">Footer Metni</label>
                  <input value={siteContent.footerText} onChange={e => setSiteContent({ ...siteContent, footerText: e.target.value })} className="w-full h-10 rounded-xl border border-border bg-secondary/50 px-4 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
              </div>

              <div className="glass p-6 space-y-5">
                <h3 className="text-[13px] font-semibold text-foreground/80">Gizlilik Politikası</h3>
                <p className="text-[10px] text-foreground/50">HTML formatında içerik girebilirsiniz. Boş bırakırsanız varsayılan içerik gösterilir.</p>
                <textarea value={siteContent.privacyPolicy} onChange={e => setSiteContent({ ...siteContent, privacyPolicy: e.target.value })} rows={10} className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none font-mono" placeholder="<section><h2>Başlık</h2><p>İçerik...</p></section>" />
              </div>

              <div className="glass p-6 space-y-5">
                <h3 className="text-[13px] font-semibold text-foreground/80">Kullanım Ko����ulları</h3>
                <p className="text-[10px] text-foreground/50">HTML formatında içerik girebilirsiniz. Boş bırakırsanız varsayılan içerik gösterilir.</p>
                <textarea value={siteContent.termsOfService} onChange={e => setSiteContent({ ...siteContent, termsOfService: e.target.value })} rows={10} className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none font-mono" placeholder="<section><h2>Başlık</h2><p>İçerik...</p></section>" />
              </div>

              <div className="glass p-6 space-y-5">
                <h3 className="text-[13px] font-semibold text-foreground/80">Çerez Politikası</h3>
                <p className="text-[10px] text-foreground/50">HTML formatında içerik girebilirsiniz. Boş bırakırsanız varsayılan içerik gösterilir.</p>
                <textarea value={siteContent.cookiePolicy || ""} onChange={e => setSiteContent({ ...siteContent, cookiePolicy: e.target.value })} rows={10} className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none font-mono" placeholder="<section><h2>Başlık</h2><p>İçerik...</p></section>" />
              </div>

              <button onClick={saveSiteContent} className="px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity">
                {siteSaved ? "Kaydedildi" : "Site İçeriklerini Kaydet"}
              </button>
            </motion.div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl space-y-6">
              <div className="glass p-6">
                <h3 className="text-[13px] font-semibold text-foreground/80 mb-4">Sistem Bilgisi</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-2 border-b border-border/10">
                    <span className="text-foreground/50">Versiyon</span>
                    <span className="text-foreground">1.0.0</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/10">
                    <span className="text-foreground/50">Kullanıcılar</span>
                    <span className="text-foreground">{users.length}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/10">
                    <span className="text-foreground/50">Siparişler</span>
                    <span className="text-foreground">{orders.length}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-foreground/50">Faturalar</span>
                    <span className="text-foreground">{invoices.length}</span>
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

export default AdminPanelPage;
