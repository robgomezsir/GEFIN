'use client';

import * as React from 'react';
import { SummaryCard } from './SummaryCard';
import { TransactionForm } from './TransactionForm';
import { TransactionList } from './TransactionList';
import { Button } from '@/components/ui/base';
import { MESES } from '@/utils/format';
import { ChevronLeft, ChevronRight, Plus, LogOut, User } from 'lucide-react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { supabase } from '@/lib/supabase';
import { Transacao } from '@/types';

export const Dashboard = () => {
    const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingTransaction, setEditingTransaction] = React.useState<Transacao | null>(null);

    const mesNome = MESES[currentMonth];
    const { transactions, resumo, saldoTotal, loading, addTransaction, updateTransaction, deleteTransaction } = useFinanceData(mesNome, currentYear);

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
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
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
        saldo: saldoTotal
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

            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard title="Receitas" value={data.receitas} type="receita" />
                <SummaryCard title="Despesas" value={data.despesas} type="despesa" />
                <SummaryCard title="Fluxo" value={data.fluxo} type="fluxo" />
                <SummaryCard title="Saldo Acumulado" value={data.saldo} type="saldo" />
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
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 min-h-[400px]">
                        <h2 className="text-xl font-bold mb-6">Tendência Mensal</h2>
                        <div className="flex items-center justify-center h-[300px] text-slate-400">
                            [Gráfico de Tendência em Breve]
                        </div>
                    </div>

                    <TransactionList transactions={transactions} onSelect={openEdit} />
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 h-fit">
                    <h2 className="text-xl font-bold mb-6">Categorias</h2>
                    <div className="flex items-center justify-center h-[300px] text-slate-400">
                        [Gráfico de Pizza em Breve]
                    </div>
                </div>
            </section>
        </div>
    );
};
