import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Navbar } from "@/components/chrome";
import { Footer } from "@/components/chrome";
import { LuminaProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "LuminaTrack · Streetlight Fault Reporting System · PRJ-118",
  description:
    "Citizen streetlight complaint portal with location tagging, status workflow, proof upload and analytics. PRJ-118 — Public Service Grievance System.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#070b16] text-slate-100 antialiased">
        <LuminaProvider>
          <Navbar />
          <div className="pt-[68px]">{children}</div>
          <Footer />
        </LuminaProvider>
      </body>
    </html>
  );
}
