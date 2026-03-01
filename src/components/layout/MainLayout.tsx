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
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative w-full">
                {/* Desktop Top Header (Hidden on Mobile) */}
                <header className="hidden lg:flex items-center justify-between px-10 h-24 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
                    <div className="flex items-center gap-12">
                        {/* Logo Area */}
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black overflow-hidden shadow-lg shadow-primary/20">
                                G
                            </div>
                            <span className="font-black text-2xl tracking-tighter uppercase italic">
                                GEFIN<span className="text-primary italic">.</span>
                            </span>
                        </div>

                        {/* Horizontal Navigation */}
                        <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                            {navItems.map((item) => {
                                const isActive = pathname === item.path;
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => router.push(item.path)}
                                        className={cn(
                                            "flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all group relative overflow-hidden",
                                            isActive
                                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                        )}
                                    >
                                        <item.icon size={18} className={cn("shrink-0 relative z-10", isActive ? "scale-110" : "group-hover:scale-110 transition-transform")} />
                                        <span className="font-black text-[10px] uppercase tracking-[0.2em] relative z-10">
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Date Selector (Suggested by Stitch) */}
                        <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-900 px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <button className="text-slate-400 hover:text-primary transition-colors">
                                <ChevronLeftIcon size={16} />
                            </button>
                            <div className="flex items-center gap-3">
                                <Calendar size={16} className="text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Março 2026</span>
                            </div>
                            <button className="text-slate-400 hover:text-primary transition-colors">
                                <ChevronRightIcon size={16} />
                            </button>
                        </div>

                        <UserProfile />
                    </div>
                </header>

                {/* Mobile Top Header (Sticky) */}
                <header className="lg:hidden flex items-center justify-between p-4 px-6 h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-black overflow-hidden shadow-lg shadow-primary/20">
                            G
                        </div>
                        <h1 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                            {activeItem.label}
                        </h1>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-12 max-w-[1600px] mx-auto w-full pb-24 lg:pb-12 animate-in fade-in duration-700">
                    {children}
                </div>

                {/* Mobile Bottom Navigation (Hidden on Desktop) */}
                <nav className="fixed bottom-0 left-0 right-0 lg:hidden h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 flex items-center justify-around px-4 z-40">
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
