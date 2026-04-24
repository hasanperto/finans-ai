import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, ArrowUpCircle, ArrowDownCircle, Receipt, MessageCircle, Settings } from "lucide-react";
import MobileNav from "./components/MobileNav";

export const metadata: Metadata = {
  title: "FinansAI - Akıllı Finans Yönetimi",
  description: "AI destekli kişisel finans yönetim paneli",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <div className="app-layout">
          {/* Desktop Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-logo">FinansAI</div>
            
            <nav className="sidebar-nav">
              <Link href="/" className="nav-item">
                <LayoutDashboard size={20} />
                Genel Bakış
              </Link>
              <Link href="/income" className="nav-item">
                <ArrowUpCircle size={20} />
                Gelirler
              </Link>
              <Link href="/expenses" className="nav-item">
                <ArrowDownCircle size={20} />
                Giderler
              </Link>
              <Link href="/transactions" className="nav-item">
                <Receipt size={20} />
                İşlemler
              </Link>
              <Link href="/assistant" className="nav-item ai">
                <MessageCircle size={20} />
                AI Asistan
              </Link>
              <Link href="/settings" className="nav-item">
                <Settings size={20} />
                Ayarlar
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          <MobileNav />
        </div>
      </body>
    </html>
  );
}
