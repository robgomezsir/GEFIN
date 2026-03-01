'use client';

import * as React from 'react';
import { Card } from '@/components/ui/base';
import { Transacao } from '@/types';
import { formatCurrency, capitalize } from '@/utils/format';
import { ArrowUpCircle, ArrowDownCircle, Search } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TransactionListProps {
    transactions: Transacao[];
    onSelect: (transaction: Transacao) => void;
}

export const TransactionList = ({ transactions, onSelect }: TransactionListProps) => {
    return (
        <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/50">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Data</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Descrição</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Categoria</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Conta</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 font-bold">
                        {transactions.map((t) => (
                            <tr
                                key={t.id}
                                onClick={() => onSelect(t)}
                                className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all"
                            >
                                <td className="px-8 py-5">
                                    <span className="text-xs text-slate-500 font-bold">{new Date(t.data_registro).toLocaleDateString('pt-BR')}</span>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm",
                                            t.tipo === 'Receita' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "bg-rose-50 text-rose-600 dark:bg-rose-900/20"
                                        )}>
                                            {t.tipo === 'Receita' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                                        </div>
                                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.conta}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 uppercase">
                                    <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 tracking-widest">
                                        {t.categoria || (t.tipo === 'Receita' ? 'Geral' : 'Sem Categoria')}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="text-xs text-slate-400 uppercase tracking-widest">{t.conta || '-'}</span>
                                </td>
                                <td className="px-8 py-5 text-right font-black italic">
                                    <span className={cn(
                                        "text-base tracking-tighter",
                                        t.tipo === 'Receita' ? "text-emerald-500" : "text-slate-900 dark:text-white"
                                    )}>
                                        {t.tipo === 'Receita' ? '+ ' : '- '}
                                        {formatCurrency(t.valor)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-8 py-24 text-center">
                                    <div className="flex flex-col items-center gap-4 opacity-20 grayscale">
                                        <Search size={48} />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nenhum registro encontrado</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile List View (Existing Logic) */}
            <div className="lg:hidden">
                <Card className="p-0 overflow-hidden border-slate-100 dark:border-slate-800 rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm">
                    <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {transactions.length === 0 ? (
                            <div className="p-16 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest italic grayscale opacity-30">
                                Nada por aqui ainda...
                            </div>
                        ) : (
                            Object.entries(
                                transactions.reduce((groups: any, t) => {
                                    const date = new Date(t.data_registro).toLocaleDateString('pt-BR');
                                    if (!groups[date]) groups[date] = [];
                                    groups[date].push(t);
                                    return groups;
                                }, {})
                            ).map(([date, group]: [string, any]) => (
                                <div key={date} className="space-y-0">
                                    <div className="bg-slate-50/80 dark:bg-slate-800/40 px-6 py-3 sticky top-0 z-10 backdrop-blur-md border-y border-slate-100/50 dark:border-slate-800/50">
                                        <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-[0.15em]">
                                            {date === new Date().toLocaleDateString('pt-BR') ? 'Hoje' : date}
                                        </span>
                                    </div>
                                    {group.map((t: Transacao) => (
                                        <div
                                            key={t.id}
                                            onClick={() => onSelect(t)}
                                            className="p-5 px-6 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-[0.98] cursor-pointer group border-b border-slate-50 dark:border-slate-800/50 last:border-b-0"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "flex h-12 w-12 items-center justify-center rounded-2xl transition-all group-hover:scale-110 shadow-sm border border-transparent",
                                                    t.tipo === 'Receita'
                                                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 group-hover:border-emerald-200"
                                                        : "bg-rose-50 text-rose-600 dark:bg-rose-900/20 group-hover:border-rose-200"
                                                )}>
                                                    {t.tipo === 'Receita' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white uppercase text-[11px] tracking-wide mb-0.5">
                                                        {t.conta}
                                                    </p>
                                                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                                                        {t.categoria || 'Receita'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={cn(
                                                    "text-base font-black tracking-tight italic",
                                                    t.tipo === 'Receita' ? "text-emerald-500" : "text-slate-900 dark:text-white"
                                                )}>
                                                    {t.tipo === 'Receita' ? '+ ' : '- '}
                                                    {formatCurrency(t.valor)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};
