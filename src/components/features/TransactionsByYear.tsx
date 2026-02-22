'use client';

import * as React from 'react';
import { Button, Card } from '@/components/ui/base';
import { supabase } from '@/lib/supabase';
import { calcularSaldosDoAno } from '@/utils/balances';
import { MESES, formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';
import {
    ChevronLeft, ChevronDown, ChevronRight,
    TrendingUp, TrendingDown,
    Loader2, Wallet
} from 'lucide-react';
import { Transacao } from '@/types';

interface MonthData {
    mes: string;
    receitas: number;
    despesas: number;
    fluxo: number;
    saldoAnterior: number;
    saldoAcumulado: number;
}

interface TransactionsByYearProps {
    onBack: () => void;
    onEditTransaction: (t: Transacao) => void;
    initialYear?: number;
}

const MESES_LABELS: Record<string, string> = {
    janeiro: 'Janeiro', fevereiro: 'Fevereiro', marco: 'Março',
    abril: 'Abril', maio: 'Maio', junho: 'Junho',
    julho: 'Julho', agosto: 'Agosto', setembro: 'Setembro',
    outubro: 'Outubro', novembro: 'Novembro', dezembro: 'Dezembro',
};

function MonthCard({
    data,
    ano,
    onEditTransaction,
}: {
    data: MonthData;
    ano: number;
    onEditTransaction: (t: Transacao) => void;
}) {
    const [expanded, setExpanded] = React.useState(false);
    const [transactions, setTransactions] = React.useState<Transacao[]>([]);
    const [loading, setLoading] = React.useState(false);
    const hasData = data.receitas > 0 || data.despesas > 0;

    const fetchTransactions = async () => {
        if (transactions.length > 0) return; // already fetched
        setLoading(true);
        try {
            const { data: authData } = await supabase.auth.getUser();
            if (!authData.user) return;
            const { data: rows } = await supabase
                .from('transacoes')
                .select('*')
                .eq('user_id', authData.user.id)
                .eq('mes', data.mes)
                .eq('ano', ano)
                .order('data_registro', { ascending: false });
            setTransactions(rows || []);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        if (!expanded) fetchTransactions();
        setExpanded(prev => !prev);
    };

    const fluxoPositivo = data.fluxo >= 0;

    return (
        <div className={cn(
            'rounded-3xl border transition-all duration-300 overflow-hidden',
            expanded
                ? 'border-emerald-200 dark:border-emerald-800/50 shadow-lg shadow-emerald-500/5'
                : 'border-slate-100 dark:border-slate-800',
            !hasData && 'opacity-50'
        )}>
            {/* Header do mês */}
            <button
                onClick={handleToggle}
                className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-left"
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        'h-10 w-10 rounded-2xl flex items-center justify-center text-sm font-black shrink-0',
                        hasData
                            ? fluxoPositivo
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    )}>
                        {MESES.indexOf(data.mes) + 1}
                    </div>
                    <div>
                        <span className="font-bold text-slate-900 dark:text-white text-base">
                            {MESES_LABELS[data.mes]}
                        </span>
                        {hasData && (
                            <p className={cn(
                                'text-xs font-semibold',
                                fluxoPositivo ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            )}>
                                {fluxoPositivo ? '+' : ''}{formatCurrency(data.fluxo)}
                            </p>
                        )}
                        {!hasData && <p className="text-xs text-slate-400 font-medium">Sem lançamentos</p>}
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {hasData && (
                        <div className="hidden sm:flex items-center gap-6 text-right">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Receitas</p>
                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(data.receitas)}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Despesas</p>
                                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                                    {formatCurrency(data.despesas)}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acumulado</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {formatCurrency(data.saldoAcumulado)}
                                </p>
                            </div>
                        </div>
                    )}
                    <ChevronDown
                        size={20}
                        className={cn(
                            'text-slate-400 transition-transform duration-300',
                            expanded && 'rotate-180'
                        )}
                    />
                </div>
            </button>

            {/* Pills mobile dos valores */}
            {hasData && (
                <div className="sm:hidden flex gap-2 px-5 pb-3 -mt-1 bg-white dark:bg-slate-900">
                    <span className="flex-1 text-center text-xs font-bold py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(data.receitas)}
                    </span>
                    <span className="flex-1 text-center text-xs font-bold py-1.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
                        -{formatCurrency(data.despesas)}
                    </span>
                </div>
            )}

            {/* Conteúdo expandido */}
            {expanded && (
                <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 animate-in slide-in-from-top-2 duration-300">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
                            <Loader2 size={20} className="animate-spin" />
                            <span className="text-sm">Carregando lançamentos...</span>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-sm italic">
                            Nenhum lançamento encontrado.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {transactions.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => onEditTransaction(t)}
                                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white dark:hover:bg-slate-900 transition-colors text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            'h-8 w-8 rounded-xl flex items-center justify-center shrink-0',
                                            t.tipo === 'Receita'
                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'
                                                : 'bg-rose-50 dark:bg-rose-900/20 text-rose-500'
                                        )}>
                                            {t.tipo === 'Receita'
                                                ? <TrendingUp size={14} />
                                                : <TrendingDown size={14} />
                                            }
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                                                {t.conta}
                                            </p>
                                            {t.categoria && (
                                                <p className="text-[11px] text-slate-400 font-medium">{t.categoria}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn(
                                            'text-sm font-bold',
                                            t.tipo === 'Receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                        )}>
                                            {t.tipo === 'Receita' ? '+' : '-'}{formatCurrency(Number(t.valor))}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            {new Date(t.data_registro + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export const TransactionsByYear = ({ onBack, onEditTransaction, initialYear }: TransactionsByYearProps) => {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = React.useState(initialYear ?? currentYear);
    const [monthsData, setMonthsData] = React.useState<MonthData[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchYear = React.useCallback(async () => {
        setLoading(true);
        try {
            const data = await calcularSaldosDoAno(year);
            setMonthsData(data);
        } finally {
            setLoading(false);
        }
    }, [year]);

    React.useEffect(() => {
        fetchYear();
    }, [fetchYear]);

    const totalReceitas = monthsData.reduce((s, m) => s + m.receitas, 0);
    const totalDespesas = monthsData.reduce((s, m) => s + m.despesas, 0);
    const totalFluxo = totalReceitas - totalDespesas;

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-24">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={onBack} className="rounded-xl h-12 w-12 p-0">
                        <ChevronLeft size={24} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                            Lançamentos
                        </h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Visão anual por mês</p>
                    </div>
                </div>

                {/* Seletor de Ano */}
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-1.5 shadow-sm">
                    <Button
                        variant="ghost" size="sm"
                        onClick={() => setYear(y => y - 1)}
                        className="h-9 w-9 p-0 rounded-xl"
                    >
                        <ChevronLeft size={18} className="text-slate-500" />
                    </Button>
                    <span className="px-3 font-black text-slate-900 dark:text-white text-base min-w-[56px] text-center">
                        {year}
                    </span>
                    <Button
                        variant="ghost" size="sm"
                        onClick={() => setYear(y => y + 1)}
                        disabled={year >= currentYear}
                        className="h-9 w-9 p-0 rounded-xl disabled:opacity-40"
                    >
                        <ChevronRight size={18} className="text-slate-500" />
                    </Button>
                </div>
            </header>

            {/* Resumo anual */}
            {!loading && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Receitas</p>
                        </div>
                        <p className="text-sm font-black text-emerald-700 dark:text-emerald-300">{formatCurrency(totalReceitas)}</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-4 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingDown size={14} className="text-rose-600 dark:text-rose-400" />
                            <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Despesas</p>
                        </div>
                        <p className="text-sm font-black text-rose-700 dark:text-rose-300">{formatCurrency(totalDespesas)}</p>
                    </div>
                    <div className={cn(
                        'rounded-2xl p-4 text-center',
                        totalFluxo >= 0 ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-orange-50 dark:bg-orange-900/20'
                    )}>
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Wallet size={14} className={totalFluxo >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-orange-600 dark:text-orange-400'} />
                            <p className={cn(
                                'text-[10px] font-bold uppercase tracking-wider',
                                totalFluxo >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-orange-600 dark:text-orange-400'
                            )}>Saldo</p>
                        </div>
                        <p className={cn(
                            'text-sm font-black',
                            totalFluxo >= 0 ? 'text-indigo-700 dark:text-indigo-300' : 'text-orange-700 dark:text-orange-300'
                        )}>{formatCurrency(totalFluxo)}</p>
                    </div>
                </div>
            )}

            {/* Cards mensais */}
            {loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
                    <Loader2 size={24} className="animate-spin" />
                    <span className="font-medium">Carregando dados de {year}...</span>
                </div>
            ) : (
                <div className="space-y-3">
                    {monthsData.map((m) => (
                        <MonthCard
                            key={m.mes}
                            data={m}
                            ano={year}
                            onEditTransaction={onEditTransaction}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
