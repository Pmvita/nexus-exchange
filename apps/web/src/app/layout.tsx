import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Nexus Exchange",
  description: "Full-stack crypto exchange with matching engine, order book, and real-time market data"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen selection:bg-nexus-accent selection:text-white">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
