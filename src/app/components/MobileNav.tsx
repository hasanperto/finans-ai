'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowUpCircle, ArrowDownCircle, Receipt, MessageCircle } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();
  
  const navItems = [
    { href: "/", icon: <LayoutDashboard size={22} />, label: "Dashboard" },
    { href: "/income", icon: <ArrowUpCircle size={22} />, label: "Gelir" },
    { href: "/assistant", icon: <MessageCircle size={26} />, label: "AI", isMain: true },
    { href: "/expenses", icon: <ArrowDownCircle size={22} />, label: "Gider" },
    { href: "/transactions", icon: <Receipt size={22} />, label: "İşlem" },
  ];

  return (
    <nav className="mobile-nav">
      {navItems.map((item) => (
        <Link 
          key={item.href} 
          href={item.href} 
          className={`mobile-nav-item ${pathname === item.href ? 'active' : ''} ${item.isMain ? 'mobile-nav-main' : ''}`}
        >
          {item.icon}
          <span style={{ fontSize: '0.65rem', marginTop: '2px' }}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
