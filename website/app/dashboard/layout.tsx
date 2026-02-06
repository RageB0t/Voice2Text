"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, LayoutDashboard, CreditCard, User, HelpCircle } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      {/* Glassmorphism Sidebar */}
      <aside className="w-64 glass border-r border-white/10 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-accent" />
            <span className="text-xl font-semibold">Vanta Dictate</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavLink 
            href="/dashboard" 
            icon={<LayoutDashboard size={20} />}
            active={pathname === "/dashboard"}
          >
            Overview
          </NavLink>
          <NavLink 
            href="/dashboard/billing" 
            icon={<CreditCard size={20} />}
            active={pathname === "/dashboard/billing"}
          >
            Billing
          </NavLink>
          <NavLink 
            href="/dashboard/account" 
            icon={<User size={20} />}
            active={pathname === "/dashboard/account"}
          >
            Account
          </NavLink>
          <NavLink 
            href="/dashboard/support" 
            icon={<HelpCircle size={20} />}
            active={pathname === "/dashboard/support"}
          >
            Support
          </NavLink>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 glass-hover rounded-lg">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Account</p>
              <p className="text-xs text-text-secondary">Manage settings</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function NavLink({ 
  href, 
  icon, 
  children,
  active = false
}: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
        active 
          ? "bg-white/10 text-text-primary" 
          : "text-text-secondary hover:text-text-primary hover:bg-white/5"
      }`}
    >
      <span className={`transition-colors ${
        active ? "text-accent" : "text-text-secondary group-hover:text-accent"
      }`}>
        {icon}
      </span>
      <span className="font-medium">{children}</span>
    </Link>
  );
}
