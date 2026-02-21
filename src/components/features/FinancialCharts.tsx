'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';
import { formatCurrency } from '@/utils/format';

interface TrendChartProps {
    data: any[];
}

export const TrendChart = ({ data }: TrendChartProps) => {
    const chartData = data.map(item => ({
        name: item.mes.substring(0, 3).toUpperCase(),
        receitas: item.receitas,
        despesas: item.despesas,
        saldo: item.saldoAcumulado
    }));

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                        interval={0}
                        dy={10}
                    />
                    <YAxis
                        hide
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            padding: '12px'
                        }}
                        formatter={(value: any) => [formatCurrency(Number(value || 0)), '']}
                    />
                    <Area
                        type="monotone"
                        dataKey="receitas"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorReceitas)"
                    />
                    <Area
                        type="monotone"
                        dataKey="despesas"
                        stroke="#f43f5e"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorDespesas)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

interface CategoryChartProps {
    transactions: any[];
}

export const CategoryChart = ({ transactions }: CategoryChartProps) => {
    // Aggregate expenses by category
    const categoriesMap = transactions
        .filter(t => t.tipo === 'Despesa')
        .reduce((acc: any, t) => {
            const cat = t.categoria || 'Outros';
            acc[cat] = (acc[cat] || 0) + t.valor;
            return acc;
        }, {});

    const data = Object.keys(categoriesMap).map(name => ({
        name,
        value: categoriesMap[name]
    })).sort((a, b) => b.value - a.value);

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

    if (data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-slate-400 italic">
                Sem despesas neste período
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: any) => formatCurrency(Number(value || 0))}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        align="center"
                        layout="horizontal"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
