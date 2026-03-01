'use client';

import * as React from 'react';
import { SummaryCard } from './SummaryCard';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { Button, Input, Card } from '@/components/ui/base';
import { cn } from '@/utils/cn';
import { MESES, formatCurrency } from '@/utils/format';
import {
    TrendingUp, TrendingDown, Wallet, ArrowRightLeft, Plus,
    Settings as SettingsIcon, LogOut, ChevronLeft, ChevronRight,
    FileText, BarChart3, PieChart as PieIcon, Target, Sun, Moon,
    Menu, X, User
} from "lucide-react";
import { useFinanceData } from '@/hooks/useFinanceData';
import { useAnnualData } from '@/hooks/useAnnualData';
import { TrendChart, CategoryChart } from './FinancialCharts';
import { Settings } from './Settings';
import { Profile } from './Profile';
import { Reports } from './Reports';
import { TransactionsByYear } from './TransactionsByYear';
import { supabase } from '@/lib/supabase';
import { Transacao } from '@/types';
import { useDate } from '@/context/DateContext';
import { useTheme } from '@/context/ThemeContext';

export const Dashboard = () => {
    const { currentMonth, currentYear } = useDate();
    const [activeTab, setActiveTab] = React.useState<'dashboard' | 'transactions' | 'reports' | 'settings' | 'profile'>('dashboard');
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingTransaction, setEditingTransaction] = React.useState<Transacao | null>(null);
    const [userName, setUserName] = React.useState<string | null>(null);

    React.useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const name = user.user_metadata?.full_name;
                if (name) {
                    setUserName(name.split(' ')[0]);
                } else {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('nome')
                        .eq('id', user.id)
                        .maybeSingle();
                    if (profile?.nome) {
                        setUserName(profile.nome.split(' ')[0]);
                    }
                }
            }
        };
        getUser();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Bom dia';
        if (hour >= 12 && hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const mesNome = MESES[currentMonth];
    const {
        transactions,
        resumo,
        saldoTotal,
        saldoAnterior,
        rendaPrevista,
        loading: loadingMonth,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        refresh: refreshMonth
    } = useFinanceData(mesNome, currentYear);
    const { annualData, loading: loadingAnnual, refresh: refreshAnnual } = useAnnualData(currentYear);
    const { theme, toggleTheme } = useTheme();

    const loading = loadingMonth || loadingAnnual;

    const handleLogout = () => supabase.auth.signOut();

    const handleSaveTransaction = async (newTransaction: any) => {
        try {
            if (editingTransaction) {
                await updateTransaction(editingTransaction.id, newTransaction);
            } else {
                await addTransaction(newTransaction);
            }
            setIsFormOpen(false);
            setEditingTransaction(null);
            refreshMonth();
            refreshAnnual();
        } catch (err) {
            alert('Erro ao salvar transação');
        }
    };

    const handleDeleteTransaction = async () => {
        if (!editingTransaction) return;
        if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

        try {
            await deleteTransaction(editingTransaction.id);
            setIsFormOpen(false);
            setEditingTransaction(null);
            refreshMonth();
            refreshAnnual();
        } catch (err) {
            alert('Erro ao excluir transação');
        }
    };

    const openEdit = (t: Transacao) => {
        setEditingTransaction(t);
        setIsFormOpen(true);
    };

    // Dashboard data using real values from Supabase
    const data = {
        receitas: resumo?.total_receitas ?? 0,
        despesas: resumo?.total_despesas ?? 0,
        fluxo: resumo?.fluxo_caixa ?? 0,
        saldoAnterior: saldoAnterior,
        saldoDoMes: (resumo?.fluxo_caixa ?? 0) + saldoAnterior,
        disponivelValor: (rendaPrevista > 0 ? (rendaPrevista + saldoAnterior) : (resumo?.total_receitas ?? 0 + saldoAnterior)) - (resumo?.total_despesas ?? 0),
        percentualDisponivel: (rendaPrevista + saldoAnterior) > 0 ? (((rendaPrevista + saldoAnterior) - (resumo?.total_despesas ?? 0)) / (rendaPrevista + saldoAnterior)) * 100 :
            (resumo?.total_receitas ?? 0 + saldoAnterior) > 0 ? (((resumo?.total_receitas ?? 0 + saldoAnterior) - (resumo?.total_despesas ?? 0)) / (resumo?.total_receitas ?? 0 + saldoAnterior)) * 100 : 0
    };

    const topDespesas = transactions
        .filter(t => t.tipo === 'Despesa')
        .sort((a, b) => Number(b.valor) - Number(a.valor))
        .slice(0, 5);

    return (
        <div className="min-h-screen bg-grid-pattern space-y-10 animate-in fade-in duration-700 pb-12 pt-6 px-4 lg:px-12">
            {/* Greeting (Technical Header) */}
            <div className="max-w-[1600px] mx-auto w-full">
                <p className="text-[10px] font-black text-primary/60 dark:text-primary/40 uppercase tracking-[0.4em] mb-2 px-1">
                    {getGreeting()}, Rob
                </p>
                <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                    Painel <span className="text-primary italic">Financeiro.</span>
                </h2>
            </div>

            {/* Summary Cards Grid */}
            <section className="max-w-[1600px] mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <SummaryCard title="Receitas Mensais" value={data.receitas} type="receita" />
                <SummaryCard title="Despesas Mensais" value={data.despesas} type="despesa" />
                <SummaryCard title="Fluxo de Caixa" value={data.fluxo} type="fluxo" />
                <SummaryCard title="Patrimônio Líquido" value={data.saldoDoMes} type="saldo" />
            </section>

            {/* Middle Section: Charts */}
            <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Trend Chart */}
                <Card className="lg:col-span-2 p-10 rounded-[2rem] border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BarChart3 size={120} />
                    </div>
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-black uppercase tracking-tight italic">Evolução Anual</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Análise de Performance</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" /> Receitas
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" /> Despesas
                            </div>
                        </div>
                    </div>
                    <div className="h-[380px] relative z-10">
                        <TrendChart data={annualData} />
                    </div>
                </Card>

                {/* Category Distribution */}
                <Card className="p-10 rounded-[2rem] border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl shadow-slate-200/50 dark:shadow-none">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <PieIcon size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black uppercase tracking-tight italic">Distribuição</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Por Categoria</p>
                        </div>
                    </div>
                    <div className="h-[380px] flex items-center justify-center">
                        <CategoryChart transactions={transactions} />
                    </div>
                </Card>
            </div>

            {/* Bottom Section: Transactions & Analysis */}
            <div className="max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/60 dark:text-primary/40 font-mono">_Lançamentos_Recentes</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl h-10"
                            onClick={() => window.location.href = '/transacoes'}
                        >
                            Log Completo <ChevronRight size={14} className="ml-2" />
                        </Button>
                    </div>
                    <TransactionList
                        transactions={transactions.slice(0, 5)}
                        onSelect={openEdit}
                    />
                </div>

                <div className="space-y-6">
                    <div className="px-2">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/60 dark:text-primary/40 font-mono">_Health_Check_AI</h2>
                    </div>
                    <Card className="p-10 rounded-[2rem] border-none bg-primary/5 dark:bg-primary/10 relative overflow-hidden group">
                        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity" />
                        <div className="flex items-center gap-5 mb-8 relative z-10">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-slate-900 flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                                <Target size={32} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest mb-1">Status da Meta</p>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter lowercase">Liquidez Disponível</h3>
                            </div>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Ponto de Equilíbrio</p>
                                    <h4 className="text-4xl font-black text-primary tracking-tighter tabular-nums">
                                        {formatCurrency(data.disponivelValor)}
                                    </h4>
                                </div>
                                <div className="text-right">
                                    <span className={cn(
                                        "text-2xl font-black px-5 py-3 rounded-2xl border backdrop-blur-md shadow-sm",
                                        data.percentualDisponivel > 0
                                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                            : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                    )}>
                                        {data.percentualDisponivel > 0 ? '+' : ''}{data.percentualDisponivel.toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            <div className="relative pt-2">
                                <div className="w-full bg-slate-200/50 dark:bg-slate-800/50 h-2.5 rounded-full overflow-hidden shadow-inner flex">
                                    <div
                                        className={cn(
                                            "h-full transition-all duration-1000 relative",
                                            data.percentualDisponivel > 30 ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" :
                                                data.percentualDisponivel > 0 ? "bg-primary shadow-[0_0_15px_rgba(55,19,236,0.5)]" : "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                                        )}
                                        style={{ width: `${Math.min(100, Math.max(0, data.percentualDisponivel))}%` }}
                                    >
                                        <div className="absolute top-0 right-0 h-full w-2 bg-white/30 skew-x-[-20deg] blur-[1px]" />
                                    </div>
                                </div>
                            </div>

                            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase leading-relaxed text-center tracking-[0.4em] mt-6 font-mono">
                                [ SYSTEM_ALGORITHM: REAL_TIME_CASH_FLOW_ANALYSIS ]
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Floating Action Button (Android Standard Refinement) */}
            <div className="fixed bottom-24 right-4 lg:bottom-10 lg:right-10 z-50">
                <Button
                    onClick={() => setIsFormOpen(true)}
                    className={cn(
                        "rounded-[1.5rem] lg:rounded-[2.5rem] p-0 shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center bg-primary hover:bg-primary/90 border-none group",
                        "h-14 w-14 lg:h-20 lg:w-20"
                    )}
                >
                    <Plus
                        className="text-white group-hover:rotate-90 transition-transform duration-300 w-7 h-7 lg:w-10 lg:h-10"
                        strokeWidth={3}
                    />
                </Button>
            </div>

            {(isFormOpen || editingTransaction) && (
                <TransactionForm
                    onClose={() => {
                        setIsFormOpen(false);
                        setEditingTransaction(null);
                    }}
                    onSave={handleSaveTransaction}
                    initialData={editingTransaction}
                    onDelete={handleDeleteTransaction}
                />
            )}
        </div>
    );
};
