'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowUpCircle, ArrowDownCircle, Receipt, MessageCircle, Settings } from "lucide-react";
import { useI18n } from "../context/I18nContext";

export default function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navItems = [
    { href: "/", icon: <LayoutDashboard size={20} />, label: t("nav.dashboard") },
    { href: "/income", icon: <ArrowUpCircle size={20} />, label: t("nav.income") },
    { href: "/assistant", icon: <MessageCircle size={24} />, label: "AI", isMain: true },
    { href: "/expenses", icon: <ArrowDownCircle size={20} />, label: t("nav.expenses") },
    { href: "/transactions", icon: <Receipt size={20} />, label: t("nav.transactions") },
    { href: "/settings", icon: <Settings size={20} />, label: t("nav.settings") },
  ];

  return (
    <nav className="mobile-nav" aria-label="primary">
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            className={`mobile-nav-item ${active ? 'active' : ''} ${item.isMain ? 'mobile-nav-main' : ''}`}
          >
            {item.icon}
            {!item.isMain && (
              <span style={{ fontSize: '0.62rem', marginTop: '2px', maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
