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
        <div className="space-y-8 p-4 md:p-8 max-w-4xl mx-auto animate-in fade-in zoom-in duration-500 print:p-0 print:max-w-none">
            <header className="flex flex-col gap-4 mb-8 print:hidden">
                {/* Linha 1: Voltar + Título */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={onBack} className="rounded-xl h-12 w-12 p-0">
                        <ChevronLeft size={24} />
                    </Button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Relatórios</h1>
                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">Fluxo de caixa mensal</p>
                    </div>
                </div>

                {/* Linha 2: Seletor de Mês/Ano */}
                {/* Linha 2: Seletor de Mês/Ano */}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800 w-fit">
                    <Button variant="ghost" size="sm" onClick={onPrevMonth} className="h-8 w-8 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                        <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400" />
                    </Button>
                    <div className="px-2 text-center flex flex-col min-w-[100px]">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-tight">
                            {ano}
                        </span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase leading-tight">
                            {mes}
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onNextMonth} className="h-8 w-8 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                        <ChevronLeft size={18} className="text-slate-600 dark:text-slate-400 rotate-180" />
                    </Button>
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
            <Card className="p-8 bg-primary text-white rounded-[2rem] shadow-xl shadow-primary/20 mt-8 print:hidden overflow-hidden relative">
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <div className="flex gap-8 mb-4">
                            <div>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Saldo Anterior</p>
                                <p className="text-md font-black">{formatCurrency(saldoAnterior)}</p>
                            </div>
                            <div>
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Fluxo do Mês</p>
                                <p className="text-md font-black">{formatCurrency(resumo?.fluxo_caixa || 0)}</p>
                            </div>
                        </div>
                        <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-1">Saldo Final Acumulado</p>
                        <h3 className="text-4xl font-black">{formatCurrency((resumo?.fluxo_caixa || 0) + saldoAnterior)}</h3>
                    </div>
                    <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        <FileText size={32} />
                    </div>
                </div>
                {/* Decorative element */}
                <div className="absolute -right-8 -bottom-8 bg-white/10 w-32 h-32 rounded-full blur-3xl"></div>
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
