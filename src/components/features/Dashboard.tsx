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

    const renderDashboard = () => (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20 md:pb-8">
            <header className="flex items-center justify-between mb-8 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        GEFIN - Fluxo de Caixa
                    </h1>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl">
                    <Button variant="ghost" size="sm" onClick={handlePrevMonth} className="h-8 w-8 p-0">
                        <ChevronLeft size={16} />
                    </Button>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                        {mesNome} {currentYear}
                    </span>
                    <Button variant="ghost" size="sm" onClick={handleNextMonth} className="h-8 w-8 p-0">
                        <ChevronRight size={16} />
                    </Button>
                </div>
            </header>

            {loading && (
                <div className="fixed top-4 right-4 z-50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 shadow-lg text-white animate-spin">
                        <Plus size={20} className="rotate-45" />
                    </div>
                </div>
            )}

            <section className="mt-6">
                <div className="grid grid-cols-2 gap-4">
                    <SummaryCard title="Receitas" value={data.receitas} type="receita" />
                    <SummaryCard title="Despesas" value={data.despesas} type="despesa" />
                    <SummaryCard title="Fluxo" value={data.fluxo} type="fluxo" />
                    <SummaryCard title="Saldo Acumulado" value={data.saldoDoMes} type="saldo" />
                </div>
            </section>

            <div className="fixed bottom-24 right-6 z-40">
                <Button
                    onClick={() => setIsFormOpen(true)}
                    className="rounded-2xl h-14 w-14 p-0 shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all flex items-center justify-center bg-primary hover:bg-primary/90 border-none"
                >
                    <Plus size={28} strokeWidth={3} className="text-white" />
                </Button>
            </div>

            <div className="grid gap-6 mt-8">
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <PieIcon className="text-primary" size={20} />
                        <h2 className="text-lg font-bold">Despesas por Categoria</h2>
                    </div>
                    <CategoryChart transactions={transactions} />
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'transactions':
                return (
                    <TransactionsByYear
                        onBack={() => setActiveTab('dashboard')}
                        onEditTransaction={openEdit}
                        initialYear={currentYear}
                    />
                );
            case 'settings':
                return <Settings onBack={() => setActiveTab('dashboard')} />;
            case 'reports':
                return (
                    <Reports
                        transactions={transactions}
                        resumo={resumo}
                        saldoAnterior={saldoAnterior}
                        mes={mesNome}
                        ano={currentYear}
                        onBack={() => setActiveTab('dashboard')}
                        onPrevMonth={handlePrevMonth}
                        onNextMonth={handleNextMonth}
                    />
                );
            default:
                return renderDashboard();
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white pb-32">
            <main className="p-4 md:p-8 max-w-lg mx-auto">
                {renderContent()}
            </main>

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

            {/* Bottom Navigation for Mobile */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 px-8 py-4 flex items-center justify-between shadow-lg max-w-lg mx-auto">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={cn(
                        "flex flex-col items-center gap-1",
                        activeTab === 'dashboard' ? "text-primary scale-110 font-bold" : "text-slate-400"
                    )}
                >
                    <Wallet size={24} />
                    <span className="text-[10px]">Dashboard</span>
                </button>

                <button
                    onClick={() => setActiveTab('transactions')}
                    className={cn(
                        "flex flex-col items-center gap-1",
                        activeTab === 'transactions' ? "text-primary scale-110 font-bold" : "text-slate-400"
                    )}
                >
                    <ArrowRightLeft size={24} />
                    <span className="text-[10px]">Transações</span>
                </button>

                <button
                    onClick={() => setActiveTab('reports')}
                    className={cn(
                        "flex flex-col items-center gap-1",
                        activeTab === 'reports' ? "text-primary scale-110 font-bold" : "text-slate-400"
                    )}
                >
                    <FileText size={24} />
                    <span className="text-[10px]">Relatórios</span>
                </button>

                <button
                    onClick={() => setActiveTab('settings')}
                    className={cn(
                        "flex flex-col items-center gap-1",
                        activeTab === 'settings' ? "text-primary scale-110 font-bold" : "text-slate-400"
                    )}
                >
                    <SettingsIcon size={24} />
                    <span className="text-[10px]">Configurações</span>
                </button>
            </nav>
        </div>
    );
};
