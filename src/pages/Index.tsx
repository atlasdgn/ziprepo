import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import CarriersSection from "@/components/CarriersSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import DocsSection from "@/components/DocsSection";
import PricingSection from "@/components/PricingSection";
import FaqSection from "@/components/FaqSection";
import FooterCta from "@/components/FooterCta";
import Footer from "@/components/Footer";
import Toast from "@/components/Toast";

const Index = () => {
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.replace(/<[^>]*>/g, "").trim()).then(() => {
      setToastMessage("Kopyalandı");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection onCopy={copyToClipboard} />
      <StatsSection />
      <CarriersSection />
      <HowItWorksSection />
      <DocsSection onCopy={copyToClipboard} />
      <PricingSection />
      <FaqSection />
      <FooterCta />
      <Footer />
      <Toast message={toastMessage} show={showToast} />
    </div>
  );
};

export default Index;
