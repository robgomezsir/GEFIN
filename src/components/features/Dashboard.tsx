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
            <header className="space-y-4 mb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                            {getGreeting()}{userName ? `, ${userName}` : ''}!
                        </h1>
                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">
                            Fluxo de Caixa • Controle financeiro familiar
                        </p>
                    </div>

                    {/* Menu Hamburguer (Keep for simple actions like theme/logout if needed) */}
                    <div className="relative lg:hidden">
                        <Button
                            variant="secondary"
                            size="md"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="h-12 w-12 p-0 rounded-2xl shadow-lg border-none bg-white dark:bg-slate-800 hover:scale-105 active:scale-95 transition-all"
                        >
                            {isMenuOpen ? <X size={22} className="text-slate-600 dark:text-slate-400" /> : <Menu size={22} className="text-slate-600 dark:text-slate-400" />}
                        </Button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                                <div className="absolute right-0 mt-3 w-56 py-2 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                    <button onClick={() => { toggleTheme(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300">
                                        {theme === 'light' ? <Moon size={20} className="text-amber-500" /> : <Sun size={20} className="text-blue-400" />}
                                        <span className="font-bold">{theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}</span>
                                    </button>
                                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4" />
                                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-6 py-4 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors text-rose-600 dark:text-rose-400">
                                        <LogOut size={20} />
                                        <span className="font-bold">Sair</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-3">
                    <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-none w-full sm:w-auto">
                        <Button variant="ghost" size="sm" onClick={handlePrevMonth} className="h-10 w-10 p-0 rounded-xl">
                            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
                        </Button>
                        <div className="flex-1 sm:min-w-[120px] text-center flex flex-col">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                {currentYear}
                            </span>
                            <span className="text-base font-black text-slate-800 dark:text-slate-100 uppercase leading-none">
                                {mesNome}
                            </span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleNextMonth} className="h-10 w-10 p-0 rounded-xl">
                            <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
                        </Button>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center gap-3">
                        <Button variant="secondary" size="md" title="Lançamentos" onClick={() => setActiveTab('transactions')} className={cn("h-12 w-12 p-0 rounded-2xl shadow-lg border-none hover:scale-105 active:scale-95 transition-all", activeTab === 'transactions' ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400")}>
                            <ArrowRightLeft size={22} />
                        </Button>

                        <Button variant="secondary" size="md" title="Relatórios" onClick={() => setActiveTab('reports')} className={cn("h-12 w-12 p-0 rounded-2xl shadow-lg border-none hover:scale-105 active:scale-95 transition-all", activeTab === 'reports' ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400")}>
                            <FileText size={22} />
                        </Button>

                        <Button variant="secondary" size="md" onClick={() => setActiveTab('settings')} className={cn("h-12 w-12 p-0 rounded-2xl shadow-lg border-none hover:scale-105 active:scale-95 transition-all", activeTab === 'settings' ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400")}>
                            <SettingsIcon size={22} />
                        </Button>

                        <Button variant="secondary" size="md" onClick={() => setActiveTab('profile')} className={cn("h-12 w-12 p-0 rounded-2xl shadow-lg border-none hover:scale-105 active:scale-95 transition-all", activeTab === 'profile' ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400")}>
                            <User size={22} />
                        </Button>

                        <Button variant="secondary" size="md" onClick={toggleTheme} className="h-12 w-12 p-0 rounded-2xl shadow-lg border-none bg-white dark:bg-slate-800 hover:scale-105 active:scale-95 transition-all">
                            {theme === 'light' ? <Moon size={22} className="text-amber-500" /> : <Sun size={22} className="text-blue-400" />}
                        </Button>

                        <Button variant="secondary" size="md" onClick={handleLogout} className="h-12 w-12 p-0 rounded-2xl shadow-lg border-none bg-white dark:bg-slate-800 hover:scale-105 active:scale-95 transition-all">
                            <LogOut size={22} className="text-slate-600 dark:text-slate-400" />
                        </Button>
                    </div>
                </div>
            </header>

            {loading && (
                <div className="fixed top-4 right-4 z-50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 shadow-lg text-white animate-spin">
                        <Plus size={20} className="rotate-45" />
                    </div>
                </div>
            )}

            <section className="relative mt-6">
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-6 sm:overflow-visible">
                    <SummaryCard title="Receitas" value={data.receitas} type="receita" className="snap-center" />
                    <SummaryCard title="Despesas" value={data.despesas} type="despesa" className="snap-center" />
                    <SummaryCard title="Mês (Fluxo)" value={data.fluxo} type="fluxo" className="snap-center" />
                    <SummaryCard title="Saldo Anterior" value={data.saldoAnterior} type="saldo" className="snap-center" />
                    <SummaryCard title="Acumulado" value={data.saldoDoMes} type="saldo" className="snap-center" />
                    <SummaryCard
                        title="Disponível"
                        value={data.disponivelValor}
                        percent={data.percentualDisponivel}
                        type="disponibilidade"
                        className="snap-center"
                    />
                </div>
            </section>

            <div className="fixed bottom-24 md:bottom-12 right-8 md:right-12 z-40">
                <Button
                    onClick={() => setIsFormOpen(true)}
                    className="rounded-full h-16 w-16 p-0 shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 border-none"
                >
                    <Plus size={32} strokeWidth={2.5} className="text-white" />
                </Button>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
                        <PieIcon className="text-emerald-500" size={20} />
                        <h2 className="text-xl font-bold">Distribuição por Categoria</h2>
                    </div>
                    <CategoryChart transactions={transactions} />
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                            <TrendingDown className="text-rose-500" size={20} />
                            <h2 className="text-xl font-bold">Maiores Despesas</h2>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('transactions')} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-4 rounded-xl">
                            Ver todos
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {topDespesas.length > 0 ? (
                            topDespesas.map((t, idx) => (
                                <div key={t.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 text-xs font-bold">
                                            {idx + 1}º
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                                                {t.conta}
                                            </p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                                {t.categoria}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">
                                        {formatCurrency(Number(t.valor))}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-slate-500 py-4 italic">Nenhuma despesa encontrada.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm lg:col-span-2">
                    <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
                        <BarChart3 className="text-emerald-500" size={20} />
                        <h2 className="text-xl font-bold">Tendência Anual</h2>
                    </div>
                    <TrendChart data={annualData} />
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
            case 'profile':
                return <Profile onBack={() => setActiveTab('dashboard')} />;
            default:
                return renderDashboard();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white">
            <main className="p-4 md:p-8 max-w-7xl mx-auto">
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
            <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-100 dark:border-slate-800 px-6 py-3 pb-8 flex items-center justify-between shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={cn(
                        "flex flex-col items-center gap-1 transition-all duration-300",
                        activeTab === 'dashboard' ? "text-emerald-500 scale-110" : "text-slate-400"
                    )}
                >
                    <Wallet size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Dash</span>
                </button>

                <button
                    onClick={() => setActiveTab('transactions')}
                    className={cn(
                        "flex flex-col items-center gap-1 transition-all duration-300",
                        activeTab === 'transactions' ? "text-emerald-500 scale-110" : "text-slate-400"
                    )}
                >
                    <ArrowRightLeft size={24} strokeWidth={activeTab === 'transactions' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Lançamentos</span>
                </button>

                <button
                    onClick={() => setActiveTab('reports')}
                    className={cn(
                        "flex flex-col items-center gap-1 transition-all duration-300",
                        activeTab === 'reports' ? "text-emerald-500 scale-110" : "text-slate-400"
                    )}
                >
                    <FileText size={24} strokeWidth={activeTab === 'reports' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Relatórios</span>
                </button>

                <button
                    onClick={() => setActiveTab('settings')}
                    className={cn(
                        "flex flex-col items-center gap-1 transition-all duration-300",
                        activeTab === 'settings' ? "text-emerald-500 scale-110" : "text-slate-400"
                    )}
                >
                    <SettingsIcon size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Config</span>
                </button>

                <button
                    onClick={() => setActiveTab('profile')}
                    className={cn(
                        "flex flex-col items-center gap-1 transition-all duration-300",
                        activeTab === 'profile' ? "text-emerald-500 scale-110" : "text-slate-400"
                    )}
                >
                    <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">Perfil</span>
                </button>
            </nav>
        </div>
    );
};
