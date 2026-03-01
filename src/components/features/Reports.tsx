'use client';

import * as React from 'react';
import { Card, Button } from '@/components/ui/base';
import { Transacao, ResumoFluxo } from '@/types';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';
import { ChevronLeft, FileText, Download, Printer } from 'lucide-react';

interface ReportsProps {
    transactions: Transacao[];
    resumo: ResumoFluxo | null;
    saldoAnterior: number;
    mes: string;
    ano: number;
    onBack: () => void;
    onPrevMonth?: () => void;
    onNextMonth?: () => void;
}

export const Reports = ({ transactions, resumo, saldoAnterior, mes, ano, onBack, onPrevMonth, onNextMonth }: ReportsProps) => {
    // Agrupar Receitas por Conta
    const receitasPorConta = transactions
        .filter(t => t.tipo === 'Receita')
        .reduce((acc, current) => {
            acc[current.conta] = (acc[current.conta] || 0) + Number(current.valor);
            return acc;
        }, {} as Record<string, number>);

    // Agrupar Despesas por Categoria
    const despesasPorCategoria = transactions
        .filter(t => t.tipo === 'Despesa')
        .reduce((acc, current) => {
            const cat = current.categoria || 'Sem Categoria';
            acc[cat] = (acc[cat] || 0) + Number(current.valor);
            return acc;
        }, {} as Record<string, number>);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-8 p-4 lg:p-0 max-w-[1400px] mx-auto animate-in fade-in zoom-in duration-500 print:p-0 print:max-w-none">
            <header className="flex flex-col gap-4 mb-8 print:hidden">
                {/* Linha 1: Voltar + Título */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={onBack} className="rounded-2xl h-14 w-14 p-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:text-primary transition-all">
                        <ChevronLeft size={24} />
                    </Button>
                    <div>
                        <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">
                            Análise Detalhada
                        </h1>
                        <p className="text-3xl font-black text-slate-900 dark:text-white italic">
                            Relatórios <span className="text-primary">—</span> {mes} {ano}
                        </p>
                    </div>
                </div>
            </header>

            {/* Print Header */}
            <div className="hidden print:block mb-8 text-center">
                <h1 className="text-2xl font-black">Relatório de Fluxo de Caixa</h1>
                <p className="text-slate-500 capitalize">{mes} / {ano}</p>
                <div className="mt-8 border-b pb-8 grid grid-cols-4 gap-4">
                    <div className="text-left">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Saldo Anterior</p>
                        <p className="text-lg font-black text-slate-600">{formatCurrency(saldoAnterior)}</p>
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Receitas</p>
                        <p className="text-lg font-black text-emerald-600">{formatCurrency(resumo?.total_receitas || 0)}</p>
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Despesas</p>
                        <p className="text-lg font-black text-rose-600">{formatCurrency(resumo?.total_despesas || 0)}</p>
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Acumulado</p>
                        <p className="text-lg font-black text-primary">{formatCurrency((resumo?.fluxo_caixa || 0) + saldoAnterior)}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Receitas */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-black text-emerald-600 flex items-center gap-2 uppercase tracking-widest">
                            Receitas
                        </h2>
                        <span className="font-black text-emerald-600">
                            {formatCurrency(resumo?.total_receitas || 0)}
                        </span>
                    </div>

                    <Card className="p-0 overflow-hidden border-slate-100 dark:border-slate-800 rounded-3xl">
                        <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {Object.entries(receitasPorConta).length > 0 ? (
                                Object.entries(receitasPorConta)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([conta, valor]) => (
                                        <div key={conta} className="flex justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <span className="text-slate-600 dark:text-slate-400 font-bold">{conta}</span>
                                            <span className="font-black text-slate-900 dark:text-white">{formatCurrency(valor)}</span>
                                        </div>
                                    ))
                            ) : (
                                <div className="p-10 text-center text-slate-400 italic text-sm">Nenhuma receita registrada no período.</div>
                            )}
                        </div>
                    </Card>
                </section>

                {/* Despesas */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-black text-rose-600 flex items-center gap-2 uppercase tracking-widest">
                            Despesas
                        </h2>
                        <span className="font-black text-rose-600">
                            {formatCurrency(resumo?.total_despesas || 0)}
                        </span>
                    </div>

                    <Card className="p-0 overflow-hidden border-slate-100 dark:border-slate-800 rounded-3xl">
                        <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {Object.entries(despesasPorCategoria).length > 0 ? (
                                Object.entries(despesasPorCategoria)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([cat, valor]) => (
                                        <div key={cat} className="flex justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <span className="text-slate-600 dark:text-slate-400 font-bold">{cat}</span>
                                            <span className="font-black text-slate-900 dark:text-white">{formatCurrency(valor)}</span>
                                        </div>
                                    ))
                            ) : (
                                <div className="p-10 text-center text-slate-400 italic text-sm">Nenhuma despesa registrada no período.</div>
                            )}
                        </div>
                    </Card>
                </section>
            </div>

            {/* Resultado Final no App */}
            <Card className="p-10 bg-slate-900 border-none rounded-[3rem] shadow-2xl shadow-indigo-200 dark:shadow-none mt-8 print:hidden overflow-hidden relative group">
                {/* Background Gradient Glow */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                Status Final do Período
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-10">
                            <div>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Saldo Anterior</p>
                                <p className="text-xl font-black text-white tabular-nums">{formatCurrency(saldoAnterior)}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Fluxo do Mês</p>
                                <p className={cn(
                                    "text-xl font-black tabular-nums",
                                    (resumo?.fluxo_caixa || 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                                )}>
                                    {(resumo?.fluxo_caixa || 0) >= 0 ? '+' : ''}{formatCurrency(resumo?.fluxo_caixa || 0)}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em] mb-2">Saldo Final Acumulado</p>
                            <h3 className="text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">
                                {formatCurrency((resumo?.fluxo_caixa || 0) + saldoAnterior)}
                            </h3>
                        </div>
                    </div>

                    <div className="h-24 w-24 bg-gradient-to-br from-primary to-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-primary/40 active:scale-95 transition-transform cursor-pointer">
                        <FileText size={40} strokeWidth={2.5} />
                    </div>
                </div>
            </Card>

            <div className="flex justify-center pt-8 print:hidden">
                <Button variant="secondary" onClick={handlePrint} className="w-full h-16 gap-3 rounded-3xl font-black shadow-lg shadow-slate-100 dark:shadow-none transition-all active:scale-95 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                    <Printer size={20} />
                    Gerar PDF / Imprimir Relatório
                </Button>
            </div>

            <footer className="pt-8 text-center print:mt-12">
                <p className="text-slate-400 text-xs font-medium">Relatório gerado automaticamente • {new Date().toLocaleDateString('pt-BR')}</p>
            </footer>
        </div>
    );
};
