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
import { useTheme } from '@/context/ThemeContext';

export const Dashboard = () => {
    const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
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

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

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
        <div className="space-y-8 animate-in fade-in duration-500 pb-8 mt-4">
            {/* Greeting (Subtle, aligned with Stitch suggestions) */}
            <div className="px-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
                    {getGreeting()}
                </p>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white italic">
                    {userName || 'Explorador'}
                </h2>
            </div>

            {/* Summary Cards Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard title="Receitas" value={data.receitas} type="receita" />
                <SummaryCard title="Despesas" value={data.despesas} type="despesa" />
                <SummaryCard title="Fluxo do Mês" value={data.fluxo} type="fluxo" />
                <SummaryCard title="Saldo Acumulado" value={data.saldoDoMes} type="saldo" />
            </section>

            {/* Middle Section: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Trend Chart */}
                <Card className="lg:col-span-2 p-8 rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <TrendingUp size={22} />
                            </div>
                            <h2 className="text-lg font-black uppercase tracking-tight">Tendência Anual</h2>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Receitas
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-rose-500" /> Despesas
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <TrendChart data={annualData} />
                    </div>
                </Card>

                {/* Category Distribution */}
                <Card className="p-8 rounded-[3rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <PieIcon size={22} />
                        </div>
                        <h2 className="text-lg font-black uppercase tracking-tight">Categorias</h2>
                    </div>
                    <div className="h-[350px] flex items-center justify-center">
                        <CategoryChart transactions={transactions} />
                    </div>
                </Card>
            </div>

            {/* Bottom Section: Transactions & Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Últimos Lançamentos</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] font-black uppercase tracking-widest text-primary"
                            onClick={() => window.location.href = '/transacoes'}
                        >
                            Ver Tudo <ChevronRight size={14} className="ml-1" />
                        </Button>
                    </div>
                    <TransactionList
                        transactions={transactions.slice(0, 5)}
                        onSelect={openEdit}
                    />
                </div>

                <div className="space-y-6">
                    <div className="px-4">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Análise de Rendimento</h2>
                    </div>
                    <Card className="p-8 rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-primary/10 dark:bg-primary/20 backdrop-blur-sm border-2 border-primary/20">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-3xl bg-white dark:bg-slate-900 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                                <Target size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest">Status da Meta</p>
                                <h3 className="text-xl font-black text-primary italic lowercase">Disponibilidade Real</h3>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-sm font-bold text-primary/60 uppercase mb-1">Valor Livre Agora</p>
                                    <h4 className="text-3xl font-black text-primary tracking-tighter">
                                        {formatCurrency(data.disponivelValor)}
                                    </h4>
                                </div>
                                <div className="text-right">
                                    <div className={cn(
                                        "text-xl font-black px-4 py-2 rounded-2xl shadow-sm border",
                                        data.percentualDisponivel > 0
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            : "bg-rose-50 text-rose-600 border-rose-100"
                                    )}>
                                        {data.percentualDisponivel.toFixed(1)}%
                                    </div>
                                </div>
                            </div>

                            <div className="w-full bg-white dark:bg-slate-800 h-4 rounded-full overflow-hidden shadow-inner border border-slate-100/50 dark:border-slate-700/50">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-1000",
                                        data.percentualDisponivel > 30 ? "bg-emerald-500" : data.percentualDisponivel > 0 ? "bg-amber-500" : "bg-rose-500"
                                    )}
                                    style={{ width: `${Math.min(100, Math.max(0, data.percentualDisponivel))}%` }}
                                />
                            </div>

                            <p className="text-[10px] font-black text-slate-400 uppercase leading-relaxed text-center tracking-widest mt-4">
                                Baseado na média salarial vs. despesas acumuladas
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
