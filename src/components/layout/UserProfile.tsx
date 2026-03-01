'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { LogOut, User as UserIcon, Settings, ChevronDown, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/base';

export const UserProfile = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        if (!confirm('Deseja realmente sair do sistema?')) return;
        try {
            await supabase.auth.signOut();
            window.location.href = '/';
        } catch (err) {
            console.error('Erro ao sair:', err);
        }
    };

    const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
    const initials = fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-4 p-2 pr-4 rounded-3xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
            >
                <div className="flex flex-col items-end hidden lg:flex">
                    <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        {fullName}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {user ? 'Premium Account' : 'Visitante'}
                    </span>
                </div>
                <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20 border-2 border-white dark:border-slate-900 transition-transform group-hover:scale-105">
                        {initials}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
                </div>
                <ChevronDown size={16} className={cn("text-slate-400 transition-transform duration-300", isOpen && "rotate-180")} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl shadow-indigo-100 dark:shadow-none p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex flex-col gap-2">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 mb-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Logado como</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user?.email}</p>
                        </div>

                        <button
                            onClick={() => { setIsOpen(false); window.location.href = '/configuracoes'; }}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-all font-bold text-sm"
                        >
                            <Settings size={18} />
                            Configurações
                        </button>

                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/10 text-rose-500 transition-all font-bold text-sm"
                        >
                            <LogOut size={18} />
                            Sair do Sistema
                        </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">GEFIN ONLINE v2.0</span>
                    </div>
                </div>
            )}
        </div>
    );
};
