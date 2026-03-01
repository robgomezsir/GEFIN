'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    ArrowLeftRight,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Calendar
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/base';
import { UserProfile } from './UserProfile';

interface NavItem {
    label: string;
    icon: React.ElementType;
    path: string;
}

const navItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Transações', icon: ArrowLeftRight, path: '/transacoes' },
    { label: 'Relatórios', icon: BarChart3, path: '/relatorios' },
    { label: 'Configurações', icon: Settings, path: '/configuracoes' },
];

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const router = useRouter();

    const activeItem = navItems.find(item => item.path === pathname) || navItems[0];

    return (
        <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 selection:bg-primary/20">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative w-full">
                {/* Desktop Top Header (Hidden on Mobile) */}
                <header className="hidden lg:flex items-center justify-between px-12 h-24 bg-white/50 dark:bg-slate-950/50 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50">
                    <div className="flex items-center gap-16">
                        {/* Logo Area */}
                        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => router.push('/')}>
                            <div className="w-11 h-11 rounded-[14px] bg-primary flex items-center justify-center text-white font-black overflow-hidden shadow-xl shadow-primary/30 group-hover:scale-105 transition-transform duration-300">
                                G
                            </div>
                            <span className="font-black text-2xl tracking-tighter uppercase italic group-hover:text-primary transition-colors">
                                <span className="text-slate-900 dark:text-white">GE</span>FIN<span className="text-primary italic">.</span>
                            </span>
                        </div>

                        {/* Horizontal Navigation (Capsule Style) */}
                        <nav className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-[1.25rem] border border-slate-200 dark:border-slate-800/80 shadow-inner">
                            {navItems.map((item) => {
                                const isActive = pathname === item.path;
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => router.push(item.path)}
                                        className={cn(
                                            "flex items-center gap-3 px-6 py-2.5 rounded-[1rem] transition-all group relative overflow-hidden",
                                            isActive
                                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        <item.icon size={16} className={cn("shrink-0 relative z-10", isActive ? "scale-110" : "group-hover:scale-110 transition-transform")} />
                                        <span className="font-black text-[10px] uppercase tracking-[0.25em] relative z-10">
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-10">
                        {/* Date Selector (Technical Style) */}
                        <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-900/80 px-6 py-2.5 rounded-[1.25rem] border border-slate-200 dark:border-slate-800/80">
                            <button className="text-slate-400 hover:text-primary transition-colors p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
                                <ChevronLeftIcon size={14} />
                            </button>
                            <div className="flex items-center gap-3">
                                <Calendar size={14} className="text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-mono">MAR_2026</span>
                            </div>
                            <button className="text-slate-400 hover:text-primary transition-colors p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
                                <ChevronRightIcon size={14} />
                            </button>
                        </div>

                        <UserProfile />
                    </div>
                </header>

                {/* Mobile Top Header */}
                <header className="lg:hidden flex items-center justify-between p-5 px-6 h-20 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white text-base font-black overflow-hidden shadow-lg shadow-primary/20">
                            G
                        </div>
                        <h1 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white italic">
                            {activeItem.label}
                        </h1>
                    </div>
                    <button className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500">
                        <Menu size={20} />
                    </button>
                </header>

                {/* Page Content */}
                <div className="relative z-10">
                    {children}
                </div>

                {/* Mobile Bottom Navigation */}
                <nav className="fixed bottom-0 left-0 right-0 lg:hidden h-22 bg-white/90 dark:bg-[#020617]/90 backdrop-blur-2xl border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-around px-6 pb-2 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => router.push(item.path)}
                                className={cn(
                                    "flex flex-col items-center gap-1 transition-all",
                                    isActive ? "text-primary scale-110" : "text-slate-400"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-xl transition-all",
                                    isActive ? "bg-primary/10" : ""
                                )}>
                                    <item.icon size={22} className={cn(isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tighter">
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </main>
        </div>
    );
};
