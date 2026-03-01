'use client';

import * as React from 'react';
import { Button, Input, Card } from '@/components/ui/base';
import { useCategories } from '@/hooks/useCategories';
import { CATEGORIAS_DESPESA, TIPOS_RECEITA, CONTAS_POR_CATEGORIA } from '@/utils/constants';
import { MESES } from '@/utils/format';
import { X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TransactionFormProps {
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
    onDelete?: () => void;
}

export const TransactionForm = ({ onClose, onSave, initialData, onDelete }: TransactionFormProps) => {
    const { categories, incomeTypes, subcategories, loading: loadingCats } = useCategories();
    const [tipo, setTipo] = React.useState<'Receita' | 'Despesa'>(initialData?.tipo || 'Despesa');
    const [categoria, setCategoria] = React.useState(initialData?.categoria || '');
    const [conta, setConta] = React.useState(initialData?.conta || '');
    const [valor, setValor] = React.useState(initialData?.valor?.toString() || '');
    const [mes, setMes] = React.useState(initialData?.mes || MESES[new Date().getMonth()]);
    const [ano, setAno] = React.useState(initialData?.ano?.toString() || new Date().getFullYear().toString());
    const [data, setData] = React.useState(initialData?.data_registro || new Date().toISOString().split('T')[0]);

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

    const getContasDisponiveis = () => {
        if (tipo === 'Receita') {
            return incomeTypes.length > 0 ? incomeTypes.map(it => it.nome) : TIPOS_RECEITA;
        }

        if (!categoria) return [];

        const catObj = categories.find(c => c.nome === categoria);
        if (catObj) {
            const subs = subcategories.filter(s => s.categoria_id === catObj.id);
            if (subs.length > 0) return subs.map(s => s.nome);
        }

        return CONTAS_POR_CATEGORIA[categoria] || ['Geral'];
    };

    const contasDisponiveis = getContasDisponiveis();
    const categoriasExibicao = categories.length > 0 ? categories.map(c => c.nome) : CATEGORIAS_DESPESA;

    const formatValue = (v: string) => {
        const num = parseFloat(v) || 0;
        return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-black overflow-y-auto">
            <div className="w-full max-w-lg h-full flex flex-col p-6 animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center justify-between mb-8">
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-10 w-10 p-0 rounded-full bg-slate-50 dark:bg-slate-800">
                        <X size={20} />
                    </Button>
                    <h2 className="text-lg font-black uppercase tracking-widest text-slate-400">
                        {initialData ? 'Editar Lançamento' : 'Novo Lançamento'}
                    </h2>
                    <div className="w-10" />
                </div>

                <div className="flex flex-col items-center justify-center mb-10">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Valor do Lançamento</span>
                    <div className="relative w-full flex justify-center">
                        <input
                            type="number"
                            step="0.01"
                            value={valor}
                            onChange={(e) => setValor(e.target.value)}
                            className="bg-transparent text-5xl font-black text-center outline-none w-full text-slate-900 dark:text-white"
                            placeholder="0,00"
                            autoFocus
                        />
                    </div>
                    <span className="text-sm font-bold text-primary mt-2">{formatValue(valor)}</span>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 space-y-6">
                    <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-3xl shrink-0">
                        <button
                            type="button"
                            onClick={() => setTipo('Receita')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl font-bold transition-all",
                                tipo === 'Receita' ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400" : "text-slate-500"
                            )}
                        >
                            <ArrowUpCircle size={20} /> Receita
                        </button>
                        <button
                            type="button"
                            onClick={() => setTipo('Despesa')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl font-bold transition-all",
                                tipo === 'Despesa' ? "bg-white text-rose-600 shadow-sm dark:bg-slate-700 dark:text-rose-400" : "text-slate-500"
                            )}
                        >
                            <ArrowDownCircle size={20} /> Despesa
                        </button>
                    </div>

                    <div className="space-y-4">
                        {tipo === 'Despesa' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Categoria</label>
                                <select
                                    value={categoria}
                                    onChange={(e) => {
                                        setCategoria(e.target.value);
                                        setConta('');
                                    }}
                                    className="w-full h-14 rounded-3xl border border-slate-100 bg-slate-50 px-6 font-bold dark:border-slate-800 dark:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    required
                                >
                                    <option value="">{loadingCats ? 'Carregando...' : 'Selecione uma categoria'}</option>
                                    {categoriasExibicao.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                                {tipo === 'Receita' ? 'Fonte / Conta' : 'Subcategoria / Conta'}
                            </label>
                            <select
                                value={conta}
                                onChange={(e) => setConta(e.target.value)}
                                className="w-full h-14 rounded-3xl border border-slate-100 bg-slate-50 px-6 font-bold dark:border-slate-800 dark:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                required
                            >
                                <option value="">Selecione uma opção</option>
                                {contasDisponiveis.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Data</label>
                                <Input type="date" value={data} onChange={(e) => setData(e.target.value)} required className="h-14 bg-slate-50 border-slate-100 dark:bg-slate-900 border-none px-6 font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Mês Referência</label>
                                <select
                                    value={mes}
                                    onChange={(e) => setMes(e.target.value)}
                                    className="w-full h-14 rounded-3xl border border-slate-100 bg-slate-50 px-6 font-bold dark:border-slate-800 dark:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                >
                                    {MESES.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-6 mt-auto">
                        <Button type="submit" size="lg" className="w-full h-16 rounded-3xl text-lg shadow-xl shadow-primary/20">
                            {initialData ? 'Atualizar Lançamento' : 'Salvar Lançamento'}
                        </Button>

                        {initialData && onDelete && (
                            <Button type="button" variant="ghost" className="w-full text-rose-500 font-bold" onClick={onDelete}>
                                Excluir Lançamento
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};
