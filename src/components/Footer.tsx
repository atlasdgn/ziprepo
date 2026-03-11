import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const Footer = () => {
  const [copyright, setCopyright] = useState("2024 Fortext. Tum haklar saklidir.");

  useEffect(() => {
    getDoc(doc(db, "settings", "site")).then((snap) => {
      if (snap.exists() && snap.data().copyright) {
        setCopyright(snap.data().copyright);
      }
    });
  }, []);

  return (
    <footer className="border-t border-border/30 py-10">
      <div className="max-w-5xl mx-auto px-8 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-[12px] text-foreground/50">{copyright}</span>
        <div className="flex items-center gap-6">
          <Link to="/privacy" className="text-[12px] text-foreground/40 hover:text-foreground/70 transition-colors">Gizlilik</Link>
          <Link to="/terms" className="text-[12px] text-foreground/40 hover:text-foreground/70 transition-colors">Kullanim Sartlari</Link>
          <Link to="/cookies" className="text-[12px] text-foreground/40 hover:text-foreground/70 transition-colors">Cerez Politikasi</Link>
          <a href="mailto:destek@fortext.com.tr" className="text-[12px] text-foreground/40 hover:text-foreground/70 transition-colors">Iletisim</a>
          <Link to="/docs" className="text-[12px] text-foreground/40 hover:text-foreground/70 transition-colors">Docs</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
