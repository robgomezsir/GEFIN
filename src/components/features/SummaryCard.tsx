import * as React from 'react';
import { Card } from '@/components/ui/base';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';
import { TrendingUp, TrendingDown, Wallet, ArrowRightLeft, Plus, Target } from 'lucide-react';

interface SummaryCardProps {
    title: string;
    value: number;
    type: 'receita' | 'despesa' | 'fluxo' | 'saldo' | 'disponibilidade';
    percent?: number;
    className?: string;
}

const icons = {
    receita: <TrendingUp className="text-emerald-500" size={24} />,
    despesa: <TrendingDown className="text-rose-500" size={24} />,
    fluxo: <ArrowRightLeft className="text-blue-500" size={24} />,
    saldo: <Wallet className="text-violet-500" size={24} />,
    disponibilidade: <Target className="text-indigo-500" size={24} />,
};

const colors = {
    receita: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/5",
    despesa: "border-rose-200 bg-rose-50/70 dark:border-rose-500/20 dark:bg-rose-500/5",
    fluxo: "border-blue-200 bg-blue-50/70 dark:border-blue-500/20 dark:bg-blue-500/5",
    saldo: "border-indigo-200 bg-indigo-50/70 dark:border-indigo-500/20 dark:bg-indigo-500/5",
    disponibilidade: "border-indigo-200 bg-indigo-50/70 dark:border-indigo-500/20 dark:bg-indigo-500/5",
};

export const SummaryCard = ({ title, value, type, percent, className }: SummaryCardProps) => {
    // Mock trend for visual consistency with Stitch design if actual trend not available
    const trendValue = type === 'receita' ? 12.5 : type === 'despesa' ? -8.2 : type === 'fluxo' ? 4.1 : 2.5;
    const isPositive = trendValue >= 0;

    return (
        <Card
            className={cn(
                "relative overflow-hidden border border-slate-100 dark:border-slate-800 transition-all duration-500 shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-1 group",
                "bg-white dark:bg-slate-900 px-6 py-7 rounded-[2.5rem]",
                className
            )}
        >
            {/* Background Gradient Glow */}
            <div className={cn(
                "absolute -right-20 -top-20 w-40 h-40 blur-[80px] opacity-20 transition-opacity group-hover:opacity-30",
                type === 'receita' ? "bg-emerald-500" :
                    type === 'despesa' ? "text-rose-500" :
                        "bg-primary"
            )} />

            <div className="flex flex-col relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-500 shadow-lg",
                        type === 'receita' ? "bg-emerald-500 text-white shadow-emerald-200" :
                            type === 'despesa' ? "bg-rose-500 text-white shadow-rose-200" :
                                "bg-primary text-white shadow-primary/20"
                    )}>
                        {React.cloneElement(icons[type] as React.ReactElement<any>, { size: 24, className: "text-white" })}
                    </div>

                    {/* Trend Badge suggested by Stitch */}
                    <div className={cn(
                        "px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1 border",
                        isPositive
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-rose-50 text-rose-600 border-rose-100"
                    )}>
                        {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(trendValue)}%
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {title}
                    </p>
                    <h3 className={cn(
                        "text-3xl font-black tracking-tighter tabular-nums",
                        "text-slate-900 dark:text-white"
                    )}>
                        {type === 'disponibilidade' && percent !== undefined ? `${percent.toFixed(0)}%` : formatCurrency(value)}
                    </h3>

                    {type === 'disponibilidade' && percent !== undefined && (
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden border border-slate-100/50 dark:border-slate-800/50 shadow-inner">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    percent > 20 ? "bg-primary shadow-[0_0_10px_rgba(55,19,236,0.3)]" : "bg-rose-500"
                                )}
                                style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
