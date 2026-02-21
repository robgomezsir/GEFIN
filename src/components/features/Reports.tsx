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
}

export const Reports = ({ transactions, resumo, saldoAnterior, mes, ano, onBack }: ReportsProps) => {
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
        <div className="space-y-8 p-4 md:p-8 max-w-4xl mx-auto animate-in fade-in zoom-in duration-500 print:p-0 print:max-w-none">
            <header className="flex items-center justify-between mb-8 print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={onBack} className="rounded-xl h-12 w-12 p-0">
                        <ChevronLeft size={24} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Relatório Mensal</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium capitalize">{mes} de {ano}</p>
                    </div>
                </div>
            </header>

            {/* Print Header */}
            <div className="hidden print:block mb-8 text-center">
                <h1 className="text-2xl font-bold">Relatório de Fluxo de Caixa</h1>
                <p className="text-slate-600 capitalize">{mes} / {ano}</p>
                <div className="mt-4 border-b pb-4 grid grid-cols-4 gap-4">
                    <div className="text-left">
                        <p className="text-xs text-slate-500 uppercase font-bold">Saldo Anterior</p>
                        <p className="text-lg font-bold text-slate-600">{formatCurrency(saldoAnterior)}</p>
                    </div>
                    <div className="text-left">
                        <p className="text-xs text-slate-500 uppercase font-bold">Receitas</p>
                        <p className="text-lg font-bold text-emerald-600">{formatCurrency(resumo?.total_receitas || 0)}</p>
                    </div>
                    <div className="text-left">
                        <p className="text-xs text-slate-500 uppercase font-bold">Despesas</p>
                        <p className="text-lg font-bold text-rose-600">{formatCurrency(resumo?.total_despesas || 0)}</p>
                    </div>
                    <div className="text-left">
                        <p className="text-xs text-slate-500 uppercase font-bold">Acumulado</p>
                        <p className="text-lg font-bold text-indigo-600">{formatCurrency((resumo?.fluxo_caixa || 0) + saldoAnterior)}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Receitas */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <h2 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            RECEITAS
                        </h2>
                        <span className="font-black text-emerald-700 dark:text-emerald-300">
                            {formatCurrency(resumo?.total_receitas || 0)}
                        </span>
                    </div>

                    <Card className="p-0 overflow-hidden border-slate-100 dark:border-slate-800">
                        <div className="divide-y divide-slate-50 dark:divide-slate-900">
                            {Object.entries(receitasPorConta).length > 0 ? (
                                Object.entries(receitasPorConta)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([conta, valor]) => (
                                        <div key={conta} className="flex justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <span className="text-slate-600 dark:text-slate-400 font-medium">{conta}</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(valor)}</span>
                                        </div>
                                    ))
                            ) : (
                                <div className="p-8 text-center text-slate-400 italic text-sm">Nenhuma receita registrada no período.</div>
                            )}
                        </div>
                    </Card>
                </section>

                {/* Despesas */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            DESPESAS
                        </h2>
                        <span className="font-black text-rose-700 dark:text-rose-300">
                            {formatCurrency(resumo?.total_despesas || 0)}
                        </span>
                    </div>

                    <Card className="p-0 overflow-hidden border-slate-100 dark:border-slate-800">
                        <div className="divide-y divide-slate-50 dark:divide-slate-900">
                            {Object.entries(despesasPorCategoria).length > 0 ? (
                                Object.entries(despesasPorCategoria)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([cat, valor]) => (
                                        <div key={cat} className="flex justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <span className="text-slate-600 dark:text-slate-400 font-medium">{cat}</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(valor)}</span>
                                        </div>
                                    ))
                            ) : (
                                <div className="p-8 text-center text-slate-400 italic text-sm">Nenhuma despesa registrada no período.</div>
                            )}
                        </div>
                    </Card>
                </section>
            </div>

            {/* Resultado Final no App */}
            <Card className="p-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 mt-8 print:hidden">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex gap-4 mb-2">
                            <div>
                                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Saldo Anterior</p>
                                <p className="text-md font-bold">{formatCurrency(saldoAnterior)}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Fluxo do Mês</p>
                                <p className="text-md font-bold">{formatCurrency(resumo?.fluxo_caixa || 0)}</p>
                            </div>
                        </div>
                        <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Saldo Final Acumulado</p>
                        <h3 className="text-3xl font-black">{formatCurrency((resumo?.fluxo_caixa || 0) + saldoAnterior)}</h3>
                    </div>
                    <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center",
                        (resumo?.fluxo_caixa || 0) >= 0 ? "bg-emerald-500/20 text-emerald-500" : "bg-rose-500/20 text-rose-500"
                    )}>
                        <FileText size={32} />
                    </div>
                </div>
            </Card>

            <div className="flex justify-center pt-4 print:hidden">
                <Button variant="secondary" onClick={handlePrint} className="w-full sm:w-auto gap-3 rounded-2xl h-14 font-bold shadow-lg shadow-slate-200/50 dark:shadow-none transition-all active:scale-95">
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
