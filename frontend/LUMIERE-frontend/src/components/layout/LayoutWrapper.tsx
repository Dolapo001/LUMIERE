import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AbandonedCartRecovery from "../cart/AbandonedCartRecovery";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AbandonedCartRecovery />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
