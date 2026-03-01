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
        <Card className="p-0 overflow-hidden border-slate-100 dark:border-slate-800 rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="p-8 pb-4">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary/60">Últimos Lançamentos</h2>
            </div>

            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {transactions.length === 0 ? (
                    <div className="p-16 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">
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
                            <div className="bg-slate-50/80 dark:bg-slate-800/40 px-8 py-3 sticky top-0 z-10 backdrop-blur-md border-y border-slate-100/50 dark:border-slate-800/50">
                                <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-[0.15em]">
                                    {date === new Date().toLocaleDateString('pt-BR') ? 'Hoje' : date}
                                </span>
                            </div>
                            {group.map((t: Transacao) => (
                                <div
                                    key={t.id}
                                    onClick={() => onSelect(t)}
                                    className="p-6 px-8 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-[0.98] cursor-pointer group border-b border-slate-50 dark:border-slate-800/50 last:border-b-0"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "flex h-14 w-14 items-center justify-center rounded-[1.25rem] transition-all group-hover:scale-110 shadow-sm border-2 border-transparent",
                                            t.tipo === 'Receita'
                                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 group-hover:border-emerald-200"
                                                : "bg-rose-50 text-rose-600 dark:bg-rose-900/20 group-hover:border-rose-200"
                                        )}>
                                            {t.tipo === 'Receita' ? <ArrowUpCircle size={28} /> : <ArrowDownCircle size={28} />}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-wide mb-0.5">
                                                {t.conta}
                                            </p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                                                {t.categoria || 'Receita'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn(
                                            "text-lg font-black tracking-tight",
                                            t.tipo === 'Receita' ? "text-emerald-500" : "text-slate-900 dark:text-white"
                                        )}>
                                            {t.tipo === 'Receita' ? '+ ' : '- '}
                                            {formatCurrency(t.valor)}
                                        </p>
                                        <p className="text-[9px] text-slate-300 dark:text-slate-600 font-black uppercase tracking-tighter">
                                            {new Date(t.data_registro).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};
