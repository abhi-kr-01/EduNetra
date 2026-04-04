import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/ToastContext";
import { GoogleAuthWrapper } from "@/components/GoogleAuthWrapper";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "ShikshaNetra – AI Mentor Evaluation",
  description:
    "ShikshaNetra is an AI-powered mentor evaluation platform analyzing teaching sessions with multimodal signals and generative feedback."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased">
        <NextTopLoader 
          color="#0f172a"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #0f172a,0 0 5px #0f172a"
        />
        <GoogleAuthWrapper>
          <ToastProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ToastProvider>
        </GoogleAuthWrapper>
      </body>
    </html>
  );
}


