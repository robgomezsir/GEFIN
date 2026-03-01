'use client';

import * as React from 'react';
import { Button, Input, Card } from '@/components/ui/base';
import { supabase } from '@/lib/supabase';
import { LogIn, UserPlus, ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, Chrome } from 'lucide-react';
import { cn } from '@/utils/cn';

export const AuthForm = () => {
    const [isLogin, setIsLogin] = React.useState(true);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [fullName, setFullName] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName }
                    }
                });
                if (error) throw error;
                alert('Cadastro realizado! Verifique seu e-mail para confirmar.');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao processar autenticação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
            {/* Esquerda: Branding & Visual (Desktop Only) */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-primary items-center justify-center p-16">
                {/* Background Decorativo */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-indigo-600 to-primary/80" />
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />

                <div className="relative z-10 text-white max-w-lg space-y-8 animate-in fade-in slide-in-from-left duration-1000">
                    <div className="flex flex-col items-start gap-4">
                        <div className="h-20 w-20 bg-white/20 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/30">
                            <ShieldCheck size={44} className="text-white" />
                        </div>
                        <h1 className="text-7xl font-black tracking-tight leading-none italic uppercase">
                            GEFIN
                        </h1>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight text-white/90">
                            Sua gestão financeira inteligente em um só lugar.
                        </h2>
                        <p className="text-lg text-white/60 font-medium leading-relaxed">
                            Organize suas contas, acompanhe seu fluxo de caixa e tenha o controle total do seu futuro financeiro com uma interface premium e intuitiva.
                        </p>
                    </div>

                    <div className="pt-8 flex gap-6">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black">100%</span>
                            <span className="text-xs uppercase tracking-widest font-bold text-white/50">Seguro</span>
                        </div>
                        <div className="w-px h-10 bg-white/20" />
                        <div className="flex flex-col">
                            <span className="text-2xl font-black">Cloud</span>
                            <span className="text-xs uppercase tracking-widest font-bold text-white/50">Sincronizado</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Direita: Formulário */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-20 relative">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center lg:text-left space-y-2">
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                                <ShieldCheck size={32} />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                            {isLogin ? 'Bem-vindo' : 'Comece Agora'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                            {isLogin ? 'Acesse sua conta para continuar' : 'Crie sua conta premium gratuita'}
                        </p>
                    </div>

                    <Card className="p-8 border-slate-100 dark:border-slate-800 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-xl shadow-indigo-100 dark:shadow-none relative overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
                        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                            {!isLogin && (
                                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Nome Completo</label>
                                    <div className="relative group">
                                        <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Ex: Anderson Silva"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            className="w-full h-14 pl-14 pr-6 rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 px-6 font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dark:text-white text-sm"
                                            required={!isLogin}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">E-mail</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full h-14 pl-14 pr-6 rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 px-6 font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dark:text-white text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 focus-within:text-primary transition-colors">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Senha</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full h-14 pl-14 pr-6 rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 px-6 font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all dark:text-white text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-100 dark:border-rose-900/30 animate-in shake duration-500">
                                    {error}
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {isLogin ? 'Entrar no Sistema' : 'Criar minha Conta'}
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="relative py-4 flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                                </div>
                                <span className="relative bg-white dark:bg-slate-900 px-4 text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">OU</span>
                            </div>

                            <button
                                type="button"
                                className="w-full h-14 bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98]"
                            >
                                <Chrome size={18} />
                                Continuar com Google
                            </button>
                        </form>
                    </Card>

                    <div className="text-center italic">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] hover:text-primary transition-colors group"
                        >
                            {isLogin ? (
                                <>Ainda não tem conta? <span className="text-primary group-hover:underline underline-offset-4 decoration-2">Comece agora</span></>
                            ) : (
                                <>Já tem uma conta? <span className="text-primary group-hover:underline underline-offset-4 decoration-2">Entre agora</span></>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <footer className="absolute bottom-8 right-8 text-center pointer-events-none hidden lg:block opacity-20">
                <p className="text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.3em] text-[10px]">Premium Cloud Edition · 2026</p>
            </footer>
        </div>
    );
};
