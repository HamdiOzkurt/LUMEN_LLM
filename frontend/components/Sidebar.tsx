'use client';

import {
    LayoutDashboard,
    Activity,
    Database,
    Settings,
    CreditCard,
    Box,
    LogOut,
    Cpu
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Activity, label: 'Live Monitoring', href: '/live' },
    { icon: Database, label: 'Logs & History', href: '/logs' },
    { icon: Box, label: 'Providers', href: '/providers' },
    { icon: CreditCard, label: 'Billing & Cost', href: '/billing' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-800 bg-slate-950 text-slate-300">
            {/* Logo Area */}
            <div className="flex h-16 items-center border-b border-slate-800 px-6">
                <div className="flex items-center gap-2 font-bold text-white text-xl tracking-tight">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                        <Cpu size={18} />
                    </div>
                    <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        LLM Ops
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 p-4">
                <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Platform
                </div>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 
                ${isActive
                                    ? 'bg-indigo-500/10 text-indigo-400'
                                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                                }`}
                        >
                            <item.icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* User / Footer */}
            <div className="absolute bottom-0 w-full border-t border-slate-800 p-4">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-red-400 transition-colors">
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
