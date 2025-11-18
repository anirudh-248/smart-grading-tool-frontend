// app/evaluate/layout.tsx
import type { ReactNode } from "react";
// Example: use next/font/google or next/font/local imports that return `variable`
// Adjust imports to your actual font setup.
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Evaluate - SmartGrader",
};

export default function EvaluateLayout({ children }: { children: React.ReactNode }) {
  // replaced nested <html>/<body> with a simple wrapper so only the root layout owns <body>
  return <div className={`${inter.variable} antialiased`}>{children}</div>;
}