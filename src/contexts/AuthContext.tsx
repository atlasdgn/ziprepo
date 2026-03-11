import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";

// Auth persistence'ı ayarla - tarayıcı kapatılsa bile oturum korunsun
setPersistence(auth, browserLocalPersistence).catch(console.error);

export interface User {
  id: string;
  email: string;
  name: string;
  apiKey: string;
  plan: "free" | "pro" | "enterprise";
  // Kredi sistemi
  freeCredits: number; // Ucretsiz verilen 100 kredi
  proCredits: number; // Pro paket kredileri
  requestsUsed: number;
  requestsLimit: number;
  // Abonelik
  subscription?: {
    status: "active" | "suspended" | "cancelled";
    startDate: string;
    endDate: string;
    lastPaymentDate?: string;
    autoRenew: boolean;
  };
  createdAt: string;
  role?: string;
  // Fatura bilgileri
  billingInfo?: {
    fullName: string;
    address: string;
    city: string;
    taxNumber?: string;
    companyName?: string;
  };
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const generateApiKey = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "ftx_live_";
  for (let i = 0; i < 24; i++) key += chars[Math.floor(Math.random() * chars.length)];
  return key;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubUser: (() => void) | null = null;
    
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const userDocRef = doc(db, "users", fbUser.uid);
        unsubUser = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            // Firestore verisini User tipine map et - eski ve yeni veri yapilarini destekle
            const userData: User = {
              id: data.id || fbUser.uid,
              email: data.email || fbUser.email || "",
              name: data.name || "",
              apiKey: data.apiKey || "",
              plan: data.plan || "free",
              freeCredits: data.freeCredits ?? data.credits ?? 100,
              proCredits: data.proCredits ?? 0,
              requestsUsed: data.requestsUsed ?? data.usedRequests ?? 0,
              requestsLimit: data.requestsLimit ?? 100,
              subscription: data.subscription || undefined,
              createdAt: data.createdAt || new Date().toISOString(),
              role: data.role || "user",
              billingInfo: data.billingInfo || undefined,
            };
            setUser(userData);
          }
          setIsLoading(false);
        }, (error) => {
          console.error("User snapshot error:", error);
          setIsLoading(false);
        });
      } else {
        if (unsubUser) {
          unsubUser();
          unsubUser = null;
        }
        setFirebaseUser(null);
        setUser(null);
        setIsLoading(false);
      }
    });
    
    return () => {
      unsubscribe();
      if (unsubUser) unsubUser();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (snap.exists()) {
        setUser(snap.data() as User);
      }
      return true;
    } catch {
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: User = {
        id: cred.user.uid,
        email,
        name,
        apiKey: generateApiKey(),
        plan: "free",
        freeCredits: 100, // Yeni kayit = 100 ucretsiz kredi
        proCredits: 0,
        requestsUsed: 0,
        requestsLimit: 100,
        createdAt: new Date().toISOString(),
        role: "user",
      };
      await setDoc(doc(db, "users", cred.user.uid), newUser);
      setUser(newUser);
      
      // Log kayit islemi
      await setDoc(doc(db, "logs", `${Date.now()}_register`), {
        type: "user_register",
        userId: cred.user.uid,
        userEmail: email,
        userName: name,
        timestamp: new Date().toISOString(),
        details: "Yeni kullanici kaydi - 100 ucretsiz kredi verildi"
      });
      
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    setFirebaseUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.id), data);
  };

  const refreshUser = async () => {
    if (!firebaseUser) return;
    const snap = await getDoc(doc(db, "users", firebaseUser.uid));
    if (snap.exists()) {
      setUser(snap.data() as User);
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, login, register, logout, isLoading, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
