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

const ConceptIllustration = ({ type }: { type: string }) => {
    if (type === 'saldo') {
        return (
            <svg viewBox="0 0 100 100" className="w-24 h-24 absolute -right-4 -bottom-4 opacity-10 dark:opacity-20 text-primary transition-transform group-hover:scale-110 duration-700" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M50 20L80 35V65L50 80L20 65V35L50 20Z" />
                <path d="M50 20V50M50 50L80 35M50 50L20 35" />
                <path d="M50 80V50M80 65L50 50M20 65L50 50" strokeDasharray="2 2" />
            </svg>
        );
    }
    if (type === 'receita') {
        return (
            <svg viewBox="0 0 100 100" className="w-24 h-24 absolute -right-4 -bottom-4 opacity-10 dark:opacity-20 text-primary transition-transform group-hover:scale-110 duration-700" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 80L30 40L50 60L80 20" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 80H90" strokeOpacity="0.3" />
                <circle cx="80" cy="20" r="3" fill="currentColor" />
                <path d="M30 40V80M50 60V80" strokeOpacity="0.2" strokeDasharray="4 4" />
            </svg>
        );
    }
    if (type === 'despesa') {
        return (
            <svg viewBox="0 0 100 100" className="w-24 h-24 absolute -right-4 -bottom-4 opacity-10 dark:opacity-20 text-primary transition-transform group-hover:scale-110 duration-700" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 20C20 20 20 50 50 50C80 50 80 80 80 80" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M80 80L70 80M80 80L80 70" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="20" cy="20" r="3" fill="currentColor" />
                <rect x="45" y="45" width="10" height="10" rx="2" strokeOpacity="0.5" />
            </svg>
        );
    }
    return null;
};

const icons = {
    receita: <TrendingUp size={24} />,
    despesa: <TrendingDown size={24} />,
    fluxo: <ArrowRightLeft size={24} />,
    saldo: <Wallet size={24} />,
    disponibilidade: <Target size={24} />,
};

export const SummaryCard = ({ title, value, type, percent, className }: SummaryCardProps) => {
    const trendValue = type === 'receita' ? 12.5 : type === 'despesa' ? -8.2 : type === 'fluxo' ? 4.1 : 2.5;
    const isPositive = trendValue >= 0;

    return (
        <Card
            className={cn(
                "relative overflow-hidden border border-slate-200 dark:border-slate-800 transition-all duration-500 hover:-translate-y-1 group",
                "bg-white dark:bg-slate-900/50 backdrop-blur-md px-6 py-7 rounded-[2rem]",
                className
            )}
        >
            {/* Background Accent Glow */}
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity" />

            {/* Concept Illustration */}
            <ConceptIllustration type={type} />

            <div className="flex flex-col relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm group-hover:scale-110 transition-transform">
                        {icons[type]}
                    </div>

                    <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1 border transition-colors",
                        isPositive
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                    )}>
                        {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {Math.abs(trendValue)}%
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">
                        {title}
                    </p>
                    <h3 className="text-3xl font-black tracking-tighter tabular-nums text-slate-900 dark:text-white">
                        {type === 'disponibilidade' && percent !== undefined ? `${percent.toFixed(0)}%` : formatCurrency(value)}
                    </h3>

                    {type === 'disponibilidade' && percent !== undefined && (
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
                            <div
                                className="h-full bg-primary transition-all duration-1000 shadow-[0_0_8px_rgba(55,19,236,0.5)]"
                                style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
