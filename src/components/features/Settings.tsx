'use client';

import * as React from 'react';
import { Button, Input, Card } from '@/components/ui/base';
import { useCategories } from '@/hooks/useCategories';
import { ChevronLeft, Plus, Trash2, Settings as SettingsIcon, Wallet, Tags, Target, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CATEGORIAS_DESPESA, TIPOS_RECEITA } from '@/utils/constants';

interface SettingsProps {
    onBack: () => void;
}

export const Settings = ({ onBack }: SettingsProps) => {
    const { categories, incomeTypes, loading: loadingCats, addCategory, addIncomeType, deleteCategory, deleteIncomeType, refresh } = useCategories();
    const [newCat, setNewCat] = React.useState('');
    const [newInc, setNewInc] = React.useState('');
    const [rendaPrevista, setRendaPrevista] = React.useState('');
    const [savingConfig, setSavingConfig] = React.useState(false);
    const [seeding, setSeeding] = React.useState(false);

    const handleSeedData = async () => {
        setSeeding(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Popular Categorias
            for (const nome of CATEGORIAS_DESPESA) {
                await supabase.from('categorias_despesa').upsert({
                    nome,
                    user_id: user.id
                }, { onConflict: 'nome,user_id' });
            }
            // Popular Tipos de Receita
            for (const nome of TIPOS_RECEITA) {
                await supabase.from('tipos_receita').upsert({
                    nome,
                    user_id: user.id
                }, { onConflict: 'nome,user_id' });
            }
            alert('Dados padrão populados com sucesso!');
            refresh();
        } catch (err) {
            console.error('Erro ao semear dados:', err);
        } finally {
            setSeeding(false);
        }
    };

    React.useEffect(() => {
        const fetchConfig = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('configuracoes')
                .select('valor')
                .eq('user_id', user.id)
                .eq('chave', 'renda_prevista')
                .single();

            if (data) setRendaPrevista(data.valor);
        };
        fetchConfig();
    }, []);

    const handleSaveRenda = async () => {
        setSavingConfig(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase.from('configuracoes').upsert({
                user_id: user.id,
                chave: 'renda_prevista',
                valor: rendaPrevista
            });
        } finally {
            setSavingConfig(false);
        }
    };

    const handleAddCat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCat.trim()) return;
        await addCategory(newCat);
        setNewCat('');
    };

    const handleAddInc = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newInc.trim()) return;
        await addIncomeType(newInc);
        setNewInc('');
    };

    return (
        <div className="space-y-8 p-4 md:p-8 max-w-4xl mx-auto animate-in slide-in-from-right duration-500">
            <header className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="sm" onClick={onBack} className="rounded-xl h-12 w-12 p-0">
                    <ChevronLeft size={24} />
                </Button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Configurações</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Personalize suas metas e categorias</p>
                </div>
                <div className="ml-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSeedData}
                        loading={seeding}
                        className="gap-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    >
                        <RefreshCw size={18} />
                        Popular Padrões
                    </Button>
                </div>
            </header>

            {/* Metas Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <Target size={20} />
                    <h2 className="text-xl font-bold">Metas e Perfil</h2>
                </div>
                <Card className="p-6 border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium text-slate-500">Renda Mensal Prevista (Média Salarial)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                                <Input
                                    type="number"
                                    value={rendaPrevista}
                                    onChange={e => setRendaPrevista(e.target.value)}
                                    className="pl-12 rounded-xl h-12"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>
                        <Button onClick={handleSaveRenda} loading={savingConfig} className="h-12 px-8 rounded-xl">
                            Salvar Meta
                        </Button>
                    </div>
                </Card>
            </section>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Despesas */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                        <Tags size={20} />
                        <h2 className="text-xl font-bold">Categorias de Despesa</h2>
                    </div>

                    <Card className="p-4 border-slate-100 dark:border-slate-800">
                        <form onSubmit={handleAddCat} className="flex gap-2 mb-6">
                            <Input
                                placeholder="Nova categoria..."
                                value={newCat}
                                onChange={e => setNewCat(e.target.value)}
                                className="rounded-xl"
                            />
                            <Button type="submit" size="sm" className="rounded-xl px-4">
                                <Plus size={20} />
                            </Button>
                        </form>

                        <div className="space-y-2">
                            {loadingCats ? (
                                <div className="h-20 flex items-center justify-center text-slate-400 text-sm">Carregando...</div>
                            ) : categories.length === 0 ? (
                                <div className="h-20 flex items-center justify-center text-slate-400 text-sm italic">Nenhuma categoria cadastrada</div>
                            ) : (
                                categories.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl group transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <span className="font-medium text-slate-700 dark:text-slate-200">{cat.nome}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteCategory(cat.id)}
                                            className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </section>

                {/* Receitas */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <Wallet size={20} />
                        <h2 className="text-xl font-bold">Fontes de Receita</h2>
                    </div>

                    <Card className="p-4 border-slate-100 dark:border-slate-800">
                        <form onSubmit={handleAddInc} className="flex gap-2 mb-6">
                            <Input
                                placeholder="Novo tipo de receita..."
                                value={newInc}
                                onChange={e => setNewInc(e.target.value)}
                                className="rounded-xl"
                            />
                            <Button type="submit" size="sm" className="rounded-xl px-4">
                                <Plus size={20} />
                            </Button>
                        </form>

                        <div className="space-y-2">
                            {loadingCats ? (
                                <div className="h-20 flex items-center justify-center text-slate-400 text-sm">Carregando...</div>
                            ) : incomeTypes.length === 0 ? (
                                <div className="h-20 flex items-center justify-center text-slate-400 text-sm italic">Nenhum tipo cadastrado</div>
                            ) : (
                                incomeTypes.map(inc => (
                                    <div key={inc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl group transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <span className="font-medium text-slate-700 dark:text-slate-200">{inc.nome}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteIncomeType(inc.id)}
                                            className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </section>
            </div>
        </div>
    );
};
