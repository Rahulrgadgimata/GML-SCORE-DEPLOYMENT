import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AppProvider } from "@/lib/context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GM League 2026 | Season 3 · Sports Championship",
  description: "Live scores and updates for GM League — Men's Cricket, Men's Volleyball, and Women's Throwball",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ background: '#030712', minHeight: '100vh' }}>
        <AppProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
