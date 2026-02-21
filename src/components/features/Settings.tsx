'use client';

import * as React from 'react';
import { Button, Input, Card } from '@/components/ui/base';
import { useCategories } from '@/hooks/useCategories';
import { ChevronLeft, Plus, Trash2, Settings as SettingsIcon, Wallet, Tags, Target, RefreshCw, ChevronDown, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CATEGORIAS_DESPESA, TIPOS_RECEITA, CONTAS_POR_CATEGORIA } from '@/utils/constants';
import { cn } from '@/utils/cn';

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
    const [expandedDespesas, setExpandedDespesas] = React.useState(true);
    const [expandedReceitas, setExpandedReceitas] = React.useState(true);
    const [expandedCategories, setExpandedCategories] = React.useState<Record<number, boolean>>({});
    const [confirmDelete, setConfirmDelete] = React.useState<{
        id: number;
        nome: string;
        type: 'category' | 'subcategory' | 'incomeType';
    } | null>(null);

    const toggleCategory = (id: number) => {
        setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
    };

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

    const onConfirmDelete = async () => {
        if (!confirmDelete) return;

        try {
            if (confirmDelete.type === 'category') {
                await deleteCategory(confirmDelete.id);
            } else if (confirmDelete.type === 'subcategory') {
                await deleteSubcategory(confirmDelete.id);
            } else if (confirmDelete.type === 'incomeType') {
                await deleteIncomeType(confirmDelete.id);
            }
        } finally {
            setConfirmDelete(null);
        }
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

            <div className="grid gap-8 md:grid-cols-2 lg:items-start">
                {/* Despesas */}
                <section className="space-y-4">
                    <button
                        onClick={() => setExpandedDespesas(!expandedDespesas)}
                        className="flex items-center justify-between w-full text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 p-2 rounded-xl transition-all"
                    >
                        <div className="flex items-center gap-2">
                            <Tags size={20} />
                            <h2 className="text-xl font-bold">Despesas</h2>
                        </div>
                        <ChevronDown size={24} className={cn("transition-transform duration-300", !expandedDespesas && "-rotate-90")} />
                    </button>

                    {expandedDespesas && (
                        <Card className="p-4 border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300 overflow-hidden">
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

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {loadingCats ? (
                                    <div className="h-20 flex items-center justify-center text-slate-400 text-sm">Carregando...</div>
                                ) : categories.length === 0 ? (
                                    <div className="h-20 flex items-center justify-center text-slate-400 text-sm italic">Nenhuma categoria cadastrada</div>
                                ) : (
                                    categories.map(cat => (
                                        <div key={cat.id} className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 transition-all hover:shadow-md">
                                            <div className="flex items-center justify-between group">
                                                <button
                                                    onClick={() => toggleCategory(cat.id)}
                                                    className="flex-1 flex items-center gap-2 text-left"
                                                >
                                                    <ChevronDown size={18} className={cn("transition-transform text-slate-400", !expandedCategories[cat.id] && "-rotate-90")} />
                                                    <span className="font-bold text-slate-900 dark:text-white text-lg">{cat.nome}</span>
                                                </button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setConfirmDelete({ id: cat.id, nome: cat.nome, type: 'category' })}
                                                    className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>

                                            {expandedCategories[cat.id] && (
                                                <div className="pl-4 space-y-2 border-l-2 border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    {subcategories
                                                        .filter(sub => sub.categoria_id === cat.id)
                                                        .map(sub => (
                                                            <div key={sub.id} className="flex items-center justify-between group/sub py-1">
                                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{sub.nome}</span>
                                                                <button
                                                                    onClick={() => setConfirmDelete({ id: sub.id, nome: sub.nome, type: 'subcategory' })}
                                                                    className="text-rose-400 opacity-0 group-hover/sub:opacity-100 transition-opacity hover:text-rose-600"
                                                                >
                                                                    <Plus size={14} className="rotate-45" />
                                                                </button>
                                                            </div>
                                                        ))}

                                                    <div className="flex gap-2 pt-2">
                                                        <Input
                                                            placeholder="Nova sub..."
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
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    )}
                </section>

                {/* Receitas */}
                <section className="space-y-4">
                    <button
                        onClick={() => setExpandedReceitas(!expandedReceitas)}
                        className="flex items-center justify-between w-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 p-2 rounded-xl transition-all"
                    >
                        <div className="flex items-center gap-2">
                            <Wallet size={20} />
                            <h2 className="text-xl font-bold">Receitas</h2>
                        </div>
                        <ChevronDown size={24} className={cn("transition-transform duration-300", !expandedReceitas && "-rotate-90")} />
                    </button>

                    {expandedReceitas && (
                        <Card className="p-4 border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300 overflow-hidden">
                            <form onSubmit={handleAddInc} className="flex gap-2 mb-6">
                                <Input
                                    placeholder="Fonte de receita..."
                                    value={newInc}
                                    onChange={e => setNewInc(e.target.value)}
                                    className="rounded-xl"
                                />
                                <Button type="submit" size="sm" className="rounded-xl px-4">
                                    <Plus size={20} />
                                </Button>
                            </form>

                            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {loadingCats ? (
                                    <div className="h-20 flex items-center justify-center text-slate-400 text-sm">Carregando...</div>
                                ) : incomeTypes.length === 0 ? (
                                    <div className="h-20 flex items-center justify-center text-slate-400 text-sm italic">Nenhum tipo cadastrado</div>
                                ) : (
                                    incomeTypes.map(inc => (
                                        <div key={inc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl group transition-all hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                            <span className="font-medium text-slate-700 dark:text-slate-200">{inc.nome}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setConfirmDelete({ id: inc.id, nome: inc.nome, type: 'incomeType' })}
                                                className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    )}
                </section>
            </div>

            {/* Modal de Confirmação */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-sm p-6 shadow-2xl border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                <AlertTriangle size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Confirmar Exclusão?</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
                                    Você está prestes a excluir <span className="font-bold text-slate-900 dark:text-white">"{confirmDelete.nome}"</span>.
                                    Esta ação não pode ser desfeita e pode afetar transações já existentes.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full pt-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 rounded-xl h-12"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={onConfirmDelete}
                                    className="flex-1 rounded-xl h-12 bg-rose-600 hover:bg-rose-700"
                                >
                                    Excluir
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            <div className="pt-12 pb-8 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-3xl max-w-md">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Restaurar Dados Padrão</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Clique abaixo para preencher automaticamente as categorias e subcategorias essenciais para o seu controle financeiro.
                        </p>
                        <Button
                            variant="secondary"
                            onClick={handleSeedData}
                            loading={seeding}
                            className="w-full gap-2 rounded-2xl h-14 font-bold text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800"
                        >
                            <RefreshCw size={20} className={cn(seeding && "animate-spin")} />
                            Popular Padrões do Sistema
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
