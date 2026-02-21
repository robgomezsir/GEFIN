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

export const Dashboard = () => {
    const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
    const [isFormOpen, setIsFormOpen] = React.useState(false);

    const mesNome = MESES[currentMonth];
    const { transactions, resumo, loading, addTransaction } = useFinanceData(mesNome, currentYear);

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
            await addTransaction(newTransaction);
            setIsFormOpen(false);
        } catch (err) {
            alert('Erro ao salvar transação');
        }
    };

    // Dashboard data from Supabase Resumo View
    const data = {
        receitas: resumo?.total_receitas ?? 0,
        despesas: resumo?.total_despesas ?? 0,
        fluxo: resumo?.fluxo_caixa ?? 0,
        saldo: (resumo?.valor_inicial_ano ?? 0) + (resumo?.fluxo_caixa ?? 0) // Simplificado por enquanto, o ideal é o saldo acumulado total
    };

    return (
        <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Fluxo de Caixa</h1>
                    <p className="text-slate-500 dark:text-slate-400">Controle financeiro pessoal e familiar</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                        <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
                            <ChevronLeft size={20} />
                        </Button>
                        <span className="min-w-[140px] text-center font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                            {mesNome} {currentYear}
                        </span>
                        <Button variant="ghost" size="sm" onClick={handleNextMonth}>
                            <ChevronRight size={20} />
                        </Button>
                    </div>

                    <Button variant="secondary" size="sm" onClick={handleLogout} className="h-12 w-12 p-0 rounded-2xl">
                        <LogOut size={20} />
                    </Button>
                </div>
            </header>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

            {isFormOpen && (
                <TransactionForm
                    onClose={() => setIsFormOpen(false)}
                    onSave={handleSaveTransaction}
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

                    <TransactionList transactions={transactions} />
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
