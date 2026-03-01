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
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    const activeItem = navItems.find(item => item.path === pathname) || navItems[0];

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 sticky top-0 h-screen",
                    isSidebarOpen ? "w-72" : "w-20"
                )}
            >
                {/* Logo Area */}
                <div className="p-6 h-20 flex items-center justify-between">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-3 animate-in fade-in duration-500">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black overflow-hidden shadow-lg shadow-primary/20">
                                G
                            </div>
                            <span className="font-black text-xl tracking-tighter uppercase italic">
                                GEFIN<span className="text-primary italic">.</span>
                            </span>
                        </div>
                    ) : (
                        <div className="w-8 h-8 mx-auto rounded-lg bg-primary flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">
                            G
                        </div>
                    )}
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => router.push(item.path)}
                                className={cn(
                                    "w-full flex items-center gap-4 p-4 rounded-full transition-all group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary text-white shadow-xl shadow-primary/30"
                                        : "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-r from-primary to-indigo-600 opacity-0 transition-opacity duration-300",
                                    isActive && "opacity-100"
                                )} />

                                <item.icon size={20} className={cn("shrink-0 relative z-10", isActive ? "scale-110" : "group-hover:scale-110 transition-transform")} />
                                {isSidebarOpen && (
                                    <span className="font-black text-[11px] uppercase tracking-[0.2em] relative z-10 animate-in slide-in-from-left-2 duration-300">
                                        {item.label}
                                    </span>
                                )}
                                {isActive && !isSidebarOpen && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-l-full z-10" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full h-12 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors"
                    >
                        {isSidebarOpen ? (
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest">Recolher</span>
                                <ChevronRightIcon className="rotate-180" size={16} />
                            </div>
                        ) : (
                            <ChevronRightIcon size={20} />
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative">
                {/* Desktop Top Header (Hidden on Mobile) */}
                <header className="hidden lg:flex items-center justify-between px-8 h-20 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
                    <div className="flex items-center gap-8">
                        <div>
                            <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">
                                GEFIN Workspace
                            </h1>
                            <p className="text-lg font-black text-slate-900 dark:text-white italic">
                                {activeItem.label}
                            </p>
                        </div>

                        {/* Date Selector (Suggested by Stitch) */}
                        <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <button className="text-slate-400 hover:text-primary transition-colors">
                                <ChevronLeftIcon size={16} />
                            </button>
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Março 2026</span>
                            </div>
                            <button className="text-slate-400 hover:text-primary transition-colors">
                                <ChevronRightIcon size={16} />
                            </button>
                        </div>
                    </div>

                    <UserProfile />
                </header>

                {/* Mobile Top Header (Sticky) */}
                <header className="lg:hidden flex items-center justify-between p-4 px-6 h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-black overflow-hidden shadow-lg shadow-primary/20">
                            G
                        </div>
                        <h1 className="text-sm font-black uppercase tracking-widest">
                            {activeItem.label}
                        </h1>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full pb-24 lg:pb-8">
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
