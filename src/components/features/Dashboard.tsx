'use client';

import * as React from 'react';
import { SummaryCard } from './SummaryCard';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { Button, Input, Card } from '@/components/ui/base';
import { cn } from '@/utils/cn';
import { MESES } from '@/utils/format';
import { ChevronLeft, ChevronRight, Plus, LogOut, User, BarChart3, PieChart as PieIcon, Settings as SettingsIcon, FileText } from 'lucide-react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useAnnualData } from '@/hooks/useAnnualData';
import { TrendChart, CategoryChart } from './FinancialCharts';
import { Settings } from './Settings';
import { Reports } from './Reports';
import { supabase } from '@/lib/supabase';
import { Transacao } from '@/types';

export const Dashboard = () => {
    const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const [isReportsOpen, setIsReportsOpen] = React.useState(false);
    const [editingTransaction, setEditingTransaction] = React.useState<Transacao | null>(null);

    const mesNome = MESES[currentMonth];
    const { transactions, resumo, saldoTotal, rendaPrevista, loading: loadingMonth, addTransaction, updateTransaction, deleteTransaction, refresh: refreshMonth } = useFinanceData(mesNome, currentYear);
    const { annualData, loading: loadingAnnual, refresh: refreshAnnual } = useAnnualData(currentYear);

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

    if (isSettingsOpen) {
        return <Settings onBack={() => setIsSettingsOpen(false)} />;
    }

    if (isReportsOpen) {
        return (
            <Reports
                transactions={transactions}
                resumo={resumo}
                mes={mesNome}
                ano={currentYear}
                onBack={() => setIsReportsOpen(false)}
            />
        );
    }

    // Dashboard data using real values from Supabase
    const data = {
        receitas: resumo?.total_receitas ?? 0,
        despesas: resumo?.total_despesas ?? 0,
        fluxo: resumo?.fluxo_caixa ?? 0,
        saldo: saldoTotal,
        percentualDisponivel: rendaPrevista > 0 ? ((rendaPrevista - (resumo?.total_despesas ?? 0)) / rendaPrevista) * 100 : 0
    };

    return (
        <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        Fluxo de Caixa
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Controle financeiro pessoal e familiar</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-none">
                        <Button variant="ghost" size="sm" onClick={handlePrevMonth} className="hover:bg-slate-100 rounded-xl">
                            <ChevronLeft size={22} className="text-slate-600 dark:text-slate-400" />
                        </Button>
                        <div className="min-w-[160px] text-center flex flex-col">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                {currentYear}
                            </span>
                            <span className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase leading-none">
                                {mesNome}
                            </span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleNextMonth} className="hover:bg-slate-100 rounded-xl">
                            <ChevronRight size={22} className="text-slate-600 dark:text-slate-400" />
                        </Button>
                    </div>

                    <Button variant="secondary" size="md" onClick={() => setIsReportsOpen(true)} className="h-14 w-14 p-0 rounded-2xl shadow-lg border-none bg-white dark:bg-slate-800 hover:scale-105 active:scale-95 transition-all">
                        <FileText size={22} className="text-slate-600 dark:text-slate-400" />
                    </Button>

                    <Button variant="secondary" size="md" onClick={() => setIsSettingsOpen(true)} className="h-14 w-14 p-0 rounded-2xl shadow-lg border-none bg-white dark:bg-slate-800 hover:scale-105 active:scale-95 transition-all">
                        <SettingsIcon size={22} className="text-slate-600 dark:text-slate-400" />
                    </Button>

                    <Button variant="secondary" size="md" onClick={handleLogout} className="h-14 w-14 p-0 rounded-2xl shadow-lg border-none bg-white dark:bg-slate-800 hover:scale-105 active:scale-95 transition-all">
                        <LogOut size={22} className="text-slate-600 dark:text-slate-400" />
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

            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                <SummaryCard title="Receitas" value={data.receitas} type="receita" />
                <SummaryCard title="Despesas" value={data.despesas} type="despesa" />
                <SummaryCard title="Fluxo" value={data.fluxo} type="fluxo" />
                <SummaryCard title="Acumulado" value={data.saldo} type="saldo" />
                <Card className="flex flex-col justify-center p-6 border-slate-100 dark:border-slate-800 bg-indigo-50/30 dark:bg-indigo-900/10">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Disponibilidade</span>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                            {data.percentualDisponivel.toFixed(0)}%
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                data.percentualDisponivel > 20 ? "bg-indigo-500" : "bg-rose-500"
                            )}
                            style={{ width: `${Math.min(100, Math.max(0, data.percentualDisponivel))}%` }}
                        />
                    </div>
                </Card>
            </section>

            <div className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-40">
                <Button
                    size="lg"
                    onClick={() => setIsFormOpen(true)}
                    className="rounded-full h-16 w-16 sm:w-auto sm:px-8 shadow-xl shadow-emerald-500/30 gap-3"
                >
                    <Plus size={28} />
                    <span className="hidden sm:inline text-lg">Novo Lançamento</span>
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

            {/* Charts and List */}
            <section className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
                            <BarChart3 className="text-emerald-500" size={20} />
                            <h2 className="text-xl font-bold">Tendência de Receitas e Despesas</h2>
                        </div>
                        <TrendChart data={annualData} />
                    </div>

                    <TransactionList transactions={transactions} onSelect={openEdit} />
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm h-fit">
                    <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
                        <PieIcon className="text-emerald-500" size={20} />
                        <h2 className="text-xl font-bold">Distribuição por Categoria</h2>
                    </div>
                    <CategoryChart transactions={transactions} />
                </div>
            </section>
        </div>
    );
};
