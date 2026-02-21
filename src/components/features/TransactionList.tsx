'use client';

import * as React from 'react';
import { Card } from '@/components/ui/base';
import { Transacao } from '@/types';
import { formatCurrency, capitalize } from '@/utils/format';
import { ArrowUpCircle, ArrowDownCircle, Search } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TransactionListProps {
    transactions: Transacao[];
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
    return (
        <Card className="p-0 overflow-hidden border-slate-100 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold">Últimos Lançamentos</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="pl-10 pr-4 h-10 rounded-xl bg-slate-50 border-none text-sm focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800"
                    />
                </div>
            </div>

            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {transactions.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        Nenhuma transação encontrada para este período.
                    </div>
                ) : (
                    transactions.map((t) => (
                        <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-2 rounded-full",
                                    t.tipo === 'Receita' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "bg-rose-50 text-rose-600 dark:bg-rose-900/20"
                                )}>
                                    {t.tipo === 'Receita' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                        {t.conta}
                                    </p>
                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                        {t.categoria && <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{t.categoria}</span>}
                                        {new Date(t.data_registro).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={cn(
                                    "font-bold",
                                    t.tipo === 'Receita' ? "text-emerald-600" : "text-slate-900 dark:text-white"
                                )}>
                                    {t.tipo === 'Receita' ? '+ ' : '- '}
                                    {formatCurrency(t.valor)}
                                </p>
                                <p className="text-[10px] text-slate-400 uppercase">
                                    {t.mes} / {t.ano}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};
