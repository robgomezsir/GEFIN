'use client';

import * as React from 'react';
import { Button, Input, Card } from '@/components/ui/base';
import { CATEGORIAS_DESPESA, TIPOS_RECEITA, CONTAS_POR_CATEGORIA } from '@/utils/constants';
import { MESES } from '@/utils/format';
import { X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TransactionFormProps {
    onClose: () => void;
    onSave: (data: any) => void;
}

export const TransactionForm = ({ onClose, onSave }: TransactionFormProps) => {
    const [tipo, setTipo] = React.useState<'Receita' | 'Despesa'>('Despesa');
    const [categoria, setCategoria] = React.useState('');
    const [conta, setConta] = React.useState('');
    const [valor, setValor] = React.useState('');
    const [mes, setMes] = React.useState(MESES[new Date().getMonth()]);
    const [ano, setAno] = React.useState(new Date().getFullYear().toString());
    const [data, setData] = React.useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            tipo,
            categoria: tipo === 'Despesa' ? categoria : null,
            conta,
            valor: parseFloat(valor),
            mes,
            ano: parseInt(ano),
            data_registro: data
        });
    };

    const contasDisponiveis = tipo === 'Receita'
        ? TIPOS_RECEITA
        : (categoria ? CONTAS_POR_CATEGORIA[categoria] || ['Outros'] : []);

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center p-4">
            <Card className="w-full max-w-lg rounded-b-none sm:rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Novo Lançamento</h2>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X size={24} />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setTipo('Receita')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 h-10 rounded-lg font-medium transition-all",
                                tipo === 'Receita' ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400" : "text-slate-500"
                            )}
                        >
                            <ArrowUpCircle size={18} /> Receita
                        </button>
                        <button
                            type="button"
                            onClick={() => setTipo('Despesa')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 h-10 rounded-lg font-medium transition-all",
                                tipo === 'Despesa' ? "bg-white text-rose-600 shadow-sm dark:bg-slate-700 dark:text-rose-400" : "text-slate-500"
                            )}
                        >
                            <ArrowDownCircle size={18} /> Despesa
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500">Mês</label>
                            <select
                                value={mes}
                                onChange={(e) => setMes(e.target.value)}
                                className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950"
                            >
                                {MESES.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500">Ano</label>
                            <Input type="number" value={ano} onChange={(e) => setAno(e.target.value)} />
                        </div>
                    </div>

                    {tipo === 'Despesa' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500">Categoria</label>
                            <select
                                value={categoria}
                                onChange={(e) => {
                                    setCategoria(e.target.value);
                                    setConta('');
                                }}
                                className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950"
                                required
                            >
                                <option value="">Selecione uma categoria</option>
                                {CATEGORIAS_DESPESA.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-500">
                            {tipo === 'Receita' ? 'Fonte da Receita' : 'Conta / Subcategoria'}
                        </label>
                        <select
                            value={conta}
                            onChange={(e) => setConta(e.target.value)}
                            className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950"
                            required
                        >
                            <option value="">Selecione uma opção</option>
                            {contasDisponiveis.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-500">Valor</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                                className="pl-12 text-lg font-bold"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-500">Data do Registro</label>
                        <Input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1">
                            Salvar Lançamento
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
