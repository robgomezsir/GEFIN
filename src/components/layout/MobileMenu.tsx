'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    X, LayoutDashboard, ArrowLeftRight, BarChart3,
    Settings, LogOut, Sun, Moon, User, ChevronRight
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/base';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'Transações', icon: ArrowLeftRight, path: '/transacoes' },
        { label: 'Relatórios', icon: BarChart3, path: '/relatorios' },
        { label: 'Configurações', icon: Settings, path: '/configuracoes' },
    ];

    const handleLogout = async () => {
        if (!confirm('Deseja realmente sair?')) return;
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const navigate = (path: string) => {
        router.push(path);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white dark:bg-slate-950 shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">
                            G
                        </div>
                        <span className="font-black text-lg tracking-tighter">GEFIN<span className="text-primary">.</span></span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl h-10 w-10 p-0">
                        <X size={20} />
                    </Button>
                </div>

                {/* User Info */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 m-4 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-slate-900 dark:text-white truncate max-w-[150px]">
                                {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                                Conta Premium
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="w-full rounded-xl h-10 text-[10px] font-black uppercase tracking-widest gap-2"
                        onClick={() => navigate('/configuracoes')}
                    >
                        <User size={14} /> Ver Perfil
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-2 space-y-1">
                    <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Navegação Principal</p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                                    isActive
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon size={18} />
                                    <span className="font-bold text-sm">{item.label}</span>
                                </div>
                                <ChevronRight size={14} className={cn("opacity-50", isActive && "opacity-100")} />
                            </button>
                        );
                    })}
                </nav>

                {/* Quick Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl text-slate-600 dark:text-slate-400 font-bold text-sm"
                    >
                        <div className="flex items-center gap-3">
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                            {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                        </div>
                        <div className={cn(
                            "w-8 h-4 rounded-full relative transition-colors",
                            theme === 'light' ? "bg-slate-300" : "bg-primary"
                        )}>
                            <div className={cn(
                                "absolute top-1 w-2 h-2 rounded-full bg-white transition-all",
                                theme === 'light' ? "left-1" : "left-5"
                            )} />
                        </div>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-4 text-rose-500 font-bold text-sm hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl transition-all"
                    >
                        <LogOut size={18} />
                        Sair do Sistema
                    </button>
                </div>
            </div>
        </div>
    );
};
