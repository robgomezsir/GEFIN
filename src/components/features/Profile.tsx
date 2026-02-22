'use client';

import * as React from 'react';
import { Button, Card, Input } from '@/components/ui/base';
import { supabase } from '@/lib/supabase';
import { User, Mail, LogOut, ChevronLeft, Shield, Calendar } from 'lucide-react';

interface ProfileProps {
    onBack: () => void;
}

export const Profile = ({ onBack }: ProfileProps) => {
    const [user, setUser] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        fetchUser();
    }, []);

    const handleLogout = () => supabase.auth.signOut();

    if (loading) return null;

    return (
        <div className="space-y-8 p-4 md:p-8 max-w-2xl mx-auto animate-in slide-in-from-right duration-500 pb-24">
            <header className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="sm" onClick={onBack} className="rounded-xl h-12 w-12 p-0">
                    <ChevronLeft size={24} />
                </Button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Meu Perfil</h1>
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">Informações da sua conta</p>
                </div>
            </header>

            <div className="space-y-6">
                {/* Avatar & Basic Info */}
                <div className="flex flex-col items-center text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="h-24 w-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 border-4 border-emerald-50 dark:border-emerald-900/50">
                        <User size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {user?.user_metadata?.full_name || 'Usuário'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                        <Mail size={16} />
                        {user?.email}
                    </p>
                </div>

                {/* Account Details */}
                <Card className="p-6 space-y-4 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/50">
                        <div className="flex items-center gap-3">
                            <Shield className="text-blue-500" size={20} />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">ID da Conta</span>
                        </div>
                        <span className="text-xs font-mono text-slate-400 truncate max-w-[150px]">{user?.id}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            <Calendar className="text-emerald-500" size={20} />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Membro desde</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {new Date(user?.created_at).toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                </Card>

                {/* Danger Zone */}
                <div className="pt-4">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full h-14 rounded-2xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 font-bold gap-2"
                    >
                        <LogOut size={20} />
                        Sair da Conta
                    </Button>
                </div>
            </div>
        </div>
    );
};
