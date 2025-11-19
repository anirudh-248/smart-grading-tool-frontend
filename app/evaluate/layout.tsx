import React from "react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function EvaluateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Main Content Area */}
        <main className="w-full max-w-5xl relative z-10">{children}</main>
      </div>
      <Footer />
    </>
  );
}
