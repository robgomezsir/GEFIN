'use client';

import * as React from 'react';
import { Button, Input, Card } from '@/components/ui/base';
import { useCategories } from '@/hooks/useCategories';
import { ChevronLeft, Plus, Trash2, Settings as SettingsIcon, Wallet, Tags, Target, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CATEGORIAS_DESPESA, TIPOS_RECEITA, CONTAS_POR_CATEGORIA } from '@/utils/constants';

interface SettingsProps {
    onBack: () => void;
}

export const Settings = ({ onBack }: SettingsProps) => {
    const {
        categories,
        incomeTypes,
        subcategories,
        loading: loadingCats,
        addCategory,
        addIncomeType,
        addSubcategory,
        deleteCategory,
        deleteIncomeType,
        deleteSubcategory,
        refresh
    } = useCategories();
    const [newCat, setNewCat] = React.useState('');
    const [newInc, setNewInc] = React.useState('');
    const [newSub, setNewSub] = React.useState<Record<number, string>>({});
    const [rendaPrevista, setRendaPrevista] = React.useState('');
    const [savingConfig, setSavingConfig] = React.useState(false);
    const [seeding, setSeeding] = React.useState(false);

    const handleSeedData = async () => {
        setSeeding(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Usuário não autenticado!');
                return;
            }

            console.log('Iniciando semeio para:', user.id);

            // Popular Categorias e Subcategorias
            for (const catNome of CATEGORIAS_DESPESA) {
                const { data: catData, error: catError } = await supabase.from('categorias_despesa').upsert({
                    nome: catNome,
                    user_id: user.id
                }, { onConflict: 'nome,user_id' }).select().single();

                if (catError) {
                    console.error(`Erro ao semear categoria ${catNome}:`, catError);
                    continue;
                }

                if (catData) {
                    const subsPadrao = CONTAS_POR_CATEGORIA[catNome] || [];
                    for (const subNome of subsPadrao) {
                        const { error: subError } = await supabase.from('contas_despesa').upsert({
                            nome: subNome,
                            categoria_id: catData.id,
                            user_id: user.id
                        }, { onConflict: 'nome,categoria_id,user_id' });
                        if (subError) console.error(`Erro ao semear subcategoria ${subNome} para ${catNome}:`, subError);
                    }
                }
            }

            // Popular Tipos de Receita
            for (const nome of TIPOS_RECEITA) {
                const { error } = await supabase.from('tipos_receita').upsert({
                    nome,
                    user_id: user.id
                }, { onConflict: 'nome,user_id' });
                if (error) console.error(`Erro ao semear receita ${nome}:`, error);
            }

            alert('Processo de semeio finalizado! Verifique as listas.');
            refresh();
        } catch (err: any) {
            console.error('Erro fatal no semeio:', err);
            alert('Erro ao semear dados: ' + err.message);
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

    const handleAddSub = async (catId: number) => {
        const subName = newSub[catId];
        if (!subName?.trim()) return;
        await addSubcategory(catId, subName);
        setNewSub(prev => ({ ...prev, [catId]: '' }));
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

                        <div className="space-y-4">
                            {loadingCats ? (
                                <div className="h-20 flex items-center justify-center text-slate-400 text-sm">Carregando...</div>
                            ) : categories.length === 0 ? (
                                <div className="h-20 flex items-center justify-center text-slate-400 text-sm italic">Nenhuma categoria cadastrada</div>
                            ) : (
                                categories.map(cat => (
                                    <div key={cat.id} className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                        <div className="flex items-center justify-between group">
                                            <span className="font-bold text-slate-900 dark:text-white text-lg">{cat.nome}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteCategory(cat.id)}
                                                className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl"
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>

                                        <div className="pl-4 space-y-2 border-l-2 border-slate-100 dark:border-slate-800">
                                            {subcategories
                                                .filter(sub => sub.categoria_id === cat.id)
                                                .map(sub => (
                                                    <div key={sub.id} className="flex items-center justify-between group/sub py-1">
                                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{sub.nome}</span>
                                                        <button
                                                            onClick={() => deleteSubcategory(sub.id)}
                                                            className="text-rose-400 opacity-0 group-hover/sub:opacity-100 transition-opacity hover:text-rose-600"
                                                        >
                                                            <Plus size={14} className="rotate-45" />
                                                        </button>
                                                    </div>
                                                ))}

                                            <div className="flex gap-2 pt-2">
                                                <Input
                                                    placeholder="Nova subcategoria..."
                                                    value={newSub[cat.id] || ''}
                                                    onChange={e => setNewSub(prev => ({ ...prev, [cat.id]: e.target.value }))}
                                                    onKeyDown={e => e.key === 'Enter' && handleAddSub(cat.id)}
                                                    className="h-8 text-xs rounded-lg"
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAddSub(cat.id)}
                                                    className="h-8 w-8 p-0 rounded-lg shrink-0"
                                                >
                                                    <Plus size={14} />
                                                </Button>
                                            </div>
                                        </div>
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
