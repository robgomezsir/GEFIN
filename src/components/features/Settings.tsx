'use client';

import * as React from 'react';
import { Button, Input, Card } from '@/components/ui/base';
import { useCategories } from '@/hooks/useCategories';
import { ChevronLeft, Plus, Trash2, Settings as SettingsIcon, Wallet, Tags, Target, RefreshCw, ChevronDown, AlertTriangle, Download, Lock, LogOut } from 'lucide-react';
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
    const [migrating, setMigrating] = React.useState(false);
    const [clearing, setClearing] = React.useState(false);
    const [exporting, setExporting] = React.useState(false);
    const [showResetModal, setShowResetModal] = React.useState(false);
    const [resetPasswordInput, setResetPasswordInput] = React.useState('');
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

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: rows, error } = await supabase
                .from('transacoes')
                .select('categoria, conta, tipo, valor, mes, ano, data_registro')
                .eq('user_id', user.id)
                .order('ano', { ascending: true })
                .order('mes', { ascending: true })
                .order('data_registro', { ascending: true });

            if (error) throw error;
            if (!rows || rows.length === 0) {
                alert('Nenhuma transação encontrada para exportar.');
                return;
            }

            const headers = ['Categoria da Conta', 'Conta/Subcategoria', 'Tipo', 'Valor', 'Mês', 'Ano', 'Data do Registro'];

            const formatValue = (v: number) =>
                v.toFixed(2).replace('.', ',');

            const formatDate = (dateStr: string | null) => {
                if (!dateStr) return '';
                try {
                    const d = new Date(dateStr);
                    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                } catch { return dateStr; }
            };

            const escapeCell = (v: unknown): string => {
                const s = String(v ?? '');
                if (s.includes(';') || s.includes('"') || s.includes('\n')) {
                    return `"${s.replace(/"/g, '""')}"`;
                }
                return s;
            };

            const csvRows = [
                headers.map(escapeCell).join(';'),
                ...rows.map(r =>
                    [
                        escapeCell(r.categoria ?? ''),
                        escapeCell(r.conta ?? ''),
                        escapeCell(r.tipo ?? ''),
                        escapeCell(formatValue(Number(r.valor))),
                        escapeCell(r.mes ?? ''),
                        escapeCell(r.ano ?? ''),
                        escapeCell(formatDate(r.data_registro)),
                    ].join(';')
                ),
            ].join('\r\n');

            // UTF-8 BOM so Excel opens correctly
            const bom = '\uFEFF';
            const blob = new Blob([bom + csvRows], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const now = new Date();
            const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
            link.href = url;
            link.download = `gefin_transacoes_${stamp}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Erro ao exportar:', err);
            alert('Erro ao exportar. Tente novamente.');
        } finally {
            setExporting(false);
        }
    };

    const handleClearTransactions = () => {
        setResetPasswordInput('');
        setShowResetModal(true);
    };

    const confirmClearTransactions = async () => {
        if (resetPasswordInput !== 'admin123') {
            alert('Senha incorreta. Operação cancelada.');
            setResetPasswordInput('');
            return;
        }
        setShowResetModal(false);
        setClearing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('transacoes')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;
            alert('Todas as transações foram apagadas com sucesso!');
            refresh();
        } catch (err: any) {
            console.error('Erro ao limpar transações:', err);
            alert('Erro ao limpar dados: ' + err.message);
        } finally {
            setClearing(false);
        }
    };

    const handleMigrateHistoricalData = async () => {
        if (!confirm('Deseja realmente carregar os dados históricos? (Dados antigos deste período serão substituídos para evitar duplicatas)')) return;

        setMigrating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Limpar dados do período de migração para evitar duplicatas
            const periodos = [
                { mes: 'julho', ano: 2025 },
                { mes: 'agosto', ano: 2025 },
                { mes: 'setembro', ano: 2025 },
                { mes: 'outubro', ano: 2025 },
                { mes: 'janeiro', ano: 2026 },
                { mes: 'fevereiro', ano: 2026 }
            ];

            for (const p of periodos) {
                await supabase
                    .from('transacoes')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('mes', p.mes)
                    .eq('ano', p.ano);
            }

            const HISTORICAL_DATA = [
                // JULHO 2025
                { tipo: 'Receita', categoria: null, conta: 'Salário', valor: 2457.87, mes: 'julho', ano: 2025, data_registro: '2025-07-04' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'Luz', valor: 123.61, mes: 'julho', ano: 2025, data_registro: '2025-07-04' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'Gás', valor: 125.00, mes: 'julho', ano: 2025, data_registro: '2025-07-04' },
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'Faculdade', valor: 166.55, mes: 'julho', ano: 2025, data_registro: '2025-07-07' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'AÇOUGUE', valor: 408.63, mes: 'julho', ano: 2025, data_registro: '2025-07-07' },
                { tipo: 'Receita', categoria: null, conta: 'comissão vendas Zhonet', valor: 93.57, mes: 'julho', ano: 2025, data_registro: '2025-07-07' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'Luz', valor: 161.05, mes: 'julho', ano: 2025, data_registro: '2025-07-07' },
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'Cartão de crédito itau MA!', valor: 984.47, mes: 'julho', ano: 2025, data_registro: '2025-07-07' },
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'Cartão NUNBANK', valor: 451.64, mes: 'julho', ano: 2025, data_registro: '2025-07-07' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'Outros', valor: 12.99, mes: 'julho', ano: 2025, data_registro: '2025-07-07' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'Outros', valor: 17.50, mes: 'julho', ano: 2025, data_registro: '2025-07-07' },
                { tipo: 'Despesa', categoria: 'Filhos', conta: 'Vestuário', valor: 50.00, mes: 'julho', ano: 2025, data_registro: '2025-07-07' },
                { tipo: 'Despesa', categoria: 'Sara', conta: 'Sara', valor: 50.00, mes: 'julho', ano: 2025, data_registro: '2025-07-07' },

                // AGOSTO 2025
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'Cartão NUNBANK', valor: 1169.24, mes: 'agosto', ano: 2025, data_registro: '2025-08-05' },
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'Cartão de crédito itau MA!', valor: 1134.90, mes: 'agosto', ano: 2025, data_registro: '2025-08-08' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'Gás', valor: 125.00, mes: 'agosto', ano: 2025, data_registro: '2025-08-08' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'Luz', valor: 183.50, mes: 'agosto', ano: 2025, data_registro: '2025-08-08' },
                { tipo: 'Receita', categoria: null, conta: 'Salário', valor: 2612.64, mes: 'agosto', ano: 2025, data_registro: '2025-08-08' },

                // SETEMBRO 2025
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'Cartão de crédito itau MA!', valor: 257.29, mes: 'setembro', ano: 2025, data_registro: '2025-09-01' },
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'Cartão NUNBANK', valor: 1113.77, mes: 'setembro', ano: 2025, data_registro: '2025-09-01' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'Gás', valor: 125.00, mes: 'setembro', ano: 2025, data_registro: '2025-09-01' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'Luz', valor: 184.00, mes: 'setembro', ano: 2025, data_registro: '2025-09-01' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'AÇOUGUE', valor: 488.13, mes: 'setembro', ano: 2025, data_registro: '2025-09-01' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'Material de Contrução', valor: 198.00, mes: 'setembro', ano: 2025, data_registro: '2025-09-01' },
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'INVESTIMENTOS', valor: 144.57, mes: 'setembro', ano: 2025, data_registro: '2025-09-01' },
                { tipo: 'Despesa', categoria: 'Assinaturas', conta: 'Conta Claro', valor: 63.21, mes: 'setembro', ano: 2025, data_registro: '2025-09-04' },
                { tipo: 'Despesa', categoria: 'Sara', conta: 'short', valor: 50.00, mes: 'setembro', ano: 2025, data_registro: '2025-09-04' },
                { tipo: 'Despesa', categoria: 'Sara', conta: 'roupa meninos', valor: 50.00, mes: 'setembro', ano: 2025, data_registro: '2025-09-04' },
                { tipo: 'Receita', categoria: null, conta: 'Salário', valor: 2800.00, mes: 'setembro', ano: 2025, data_registro: '2025-09-04' },
                { tipo: 'Receita', categoria: null, conta: 'comissão vendas Zhonet', valor: 115.00, mes: 'setembro', ano: 2025, data_registro: '2025-09-04' },
                { tipo: 'Despesa', categoria: 'Filhos', conta: 'Outros', valor: 241.03, mes: 'setembro', ano: 2025, data_registro: '2025-09-21' },

                // OUTUBRO 2025
                { tipo: 'Despesa', categoria: 'Assinaturas', conta: 'Conta Claro', valor: 30.00, mes: 'outubro', ano: 2025, data_registro: '2025-10-21' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'Mercado', valor: 800.00, mes: 'outubro', ano: 2025, data_registro: '2025-10-21' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'AÇOUGUE', valor: 450.00, mes: 'outubro', ano: 2025, data_registro: '2025-10-21' },
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'Cartão de crédito itau MA!', valor: 269.00, mes: 'outubro', ano: 2025, data_registro: '2025-10-21' },
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'Cartão NUNBANK', valor: 500.00, mes: 'outubro', ano: 2025, data_registro: '2025-10-21' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'Luz', valor: 136.00, mes: 'outubro', ano: 2025, data_registro: '2025-10-21' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'Gás', valor: 125.00, mes: 'outubro', ano: 2025, data_registro: '2025-10-21' },
                { tipo: 'Despesa', categoria: 'Férias', conta: 'Férias', valor: 230.00, mes: 'outubro', ano: 2025, data_registro: '2025-10-21' },
                { tipo: 'Receita', categoria: null, conta: 'Salário', valor: 2500.00, mes: 'outubro', ano: 2025, data_registro: '2025-10-21' },
                { tipo: 'Receita', categoria: null, conta: 'comissão vendas Zhonet', valor: 150.00, mes: 'outubro', ano: 2025, data_registro: '2025-10-21' },
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'Cartão NUNBANK', valor: 1157.00, mes: 'outubro', ano: 2025, data_registro: '2025-10-21' },
                { tipo: 'Receita', categoria: null, conta: 'Diárias', valor: 1265.00, mes: 'outubro', ano: 2025, data_registro: '2025-10-30' },
                { tipo: 'Receita', categoria: null, conta: 'Diárias', valor: 2485.00, mes: 'outubro', ano: 2025, data_registro: '2025-10-30' },
                { tipo: 'Receita', categoria: null, conta: 'Diárias', valor: 414.40, mes: 'outubro', ano: 2025, data_registro: '2025-10-30' },
                { tipo: 'Receita', categoria: null, conta: 'Diárias', valor: 185.00, mes: 'outubro', ano: 2025, data_registro: '2025-10-30' },

                // JANEIRO 2026
                { tipo: 'Receita', categoria: null, conta: 'Valor inicial do Ano', valor: 500.00, mes: 'janeiro', ano: 2026, data_registro: '2026-01-02' },
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'Cartão NUNBANK', valor: 629.39, mes: 'janeiro', ano: 2026, data_registro: '2026-01-02' },
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'Cartão de crédito itau MA!', valor: 102.45, mes: 'janeiro', ano: 2026, data_registro: '2026-01-02' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'Luz', valor: 155.92, mes: 'janeiro', ano: 2026, data_registro: '2026-01-02' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'Mercado', valor: 750.00, mes: 'janeiro', ano: 2026, data_registro: '2026-01-02' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'AÇOUGUE', valor: 400.00, mes: 'janeiro', ano: 2026, data_registro: '2026-01-02' },
                { tipo: 'Receita', categoria: null, conta: 'Salário', valor: 2500.00, mes: 'janeiro', ano: 2026, data_registro: '2026-01-02' },
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'INVESTIMENTOS', valor: 200.00, mes: 'janeiro', ano: 2026, data_registro: '2026-01-02' },
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'compra de terreno', valor: 350.00, mes: 'janeiro', ano: 2026, data_registro: '2026-01-02' },
                { tipo: 'Receita', categoria: null, conta: 'IPTV (LUCROS)', valor: 500.00, mes: 'janeiro', ano: 2026, data_registro: '2026-01-02' },
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'CAIXA DE CASAL', valor: 200.00, mes: 'janeiro', ano: 2026, data_registro: '2026-01-02' },

                // FEVEREIRO 2026
                { tipo: 'Despesa', categoria: 'Assinaturas', conta: 'Conta Claro', valor: 40.00, mes: 'fevereiro', ano: 2026, data_registro: '2026-02-26' },
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'Cartão de crédito itau MA!', valor: 102.45, mes: 'fevereiro', ano: 2026, data_registro: '2026-02-26' },
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'Cartão NUNBANK', valor: 1038.15, mes: 'fevereiro', ano: 2026, data_registro: '2026-02-26' },
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'compra de terreno', valor: 350.00, mes: 'fevereiro', ano: 2026, data_registro: '2026-02-26' },
                { tipo: 'Despesa', categoria: 'DespesasDiárias', conta: 'GASOLINA', valor: 300.00, mes: 'fevereiro', ano: 2026, data_registro: '2026-02-26' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'Mercado', valor: 700.00, mes: 'fevereiro', ano: 2026, data_registro: '2026-02-26' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'Gás', valor: 125.00, mes: 'fevereiro', ano: 2026, data_registro: '2026-02-26' },
                { tipo: 'Despesa', categoria: 'Casa', conta: 'Luz', valor: 196.00, mes: 'fevereiro', ano: 2026, data_registro: '2026-02-26' },
                { tipo: 'Despesa', categoria: 'Poupança', conta: 'Investimentos', valor: 150.00, mes: 'fevereiro', ano: 2026, data_registro: '2026-02-26' },
                { tipo: 'Despesa', categoria: 'Poupança', conta: 'CAIXA CASAL VIAGEM', valor: 100.00, mes: 'fevereiro', ano: 2026, data_registro: '2026-02-26' },
                { tipo: 'Receita', categoria: null, conta: 'Salário', valor: 2400.00, mes: 'fevereiro', ano: 2026, data_registro: '2026-02-26' },
                { tipo: 'Receita', categoria: null, conta: 'IPTV (LUCROS)', valor: 800.00, mes: 'fevereiro', ano: 2026, data_registro: '2026-02-26' },
                { tipo: 'Despesa', categoria: 'Obrigações', conta: 'SEGURO DO CARRO', valor: 188.00, mes: 'fevereiro', ano: 2026, data_registro: '2026-02-26' },
                { tipo: 'Receita', categoria: null, conta: 'Outros', valor: 360.00, mes: 'fevereiro', ano: 2026, data_registro: '2026-02-26' },
            ];

            const transactionsWithUser = HISTORICAL_DATA.map(t => ({
                ...t,
                user_id: user.id
            }));

            const { error } = await supabase.from('transacoes').insert(transactionsWithUser);
            if (error) throw error;

            alert('Migração concluída com sucesso!');
        } catch (err: any) {
            console.error('Erro na migração:', err);
            alert('Erro ao migrar dados: ' + err.message);
        } finally {
            setMigrating(false);
        }
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

    const handleLogout = async () => {
        if (!confirm('Deseja realmente sair do sistema?')) return;
        try {
            await supabase.auth.signOut();
            window.location.href = '/'; // Forçar recarregamento para limpar estados
        } catch (err) {
            console.error('Erro ao sair:', err);
            alert('Erro ao sair. Tente novamente.');
        }
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
        <div className="space-y-8 p-4 lg:p-0 max-w-[1400px] mx-auto animate-in slide-in-from-right duration-500">
            <header className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="sm" onClick={onBack} className="rounded-xl h-12 w-12 p-0">
                    <ChevronLeft size={24} />
                </Button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Configurações</h1>
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">Personalize suas metas e categorias</p>
                </div>
            </header>

            {/* Metas Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-primary px-2">
                    <Target size={20} className="font-black" />
                    <h2 className="text-sm font-black uppercase tracking-widest">Metas e Perfil</h2>
                </div>
                <Card className="p-8 border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex flex-col sm:flex-row gap-6 items-end">
                        <div className="flex-1 space-y-3 w-full">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Renda Mensal Prevista</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                                <input
                                    type="number"
                                    value={rendaPrevista}
                                    onChange={e => setRendaPrevista(e.target.value)}
                                    className="w-full h-14 pl-14 pr-6 rounded-3xl border border-slate-200 bg-white px-6 font-bold dark:border-slate-800 dark:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder="0,00"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button onClick={handleSaveRenda} loading={savingConfig} className="h-14 px-10 rounded-3xl font-black flex-1 sm:flex-none shadow-lg shadow-primary/20">
                                Salvar Meta
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleLogout}
                                className="h-14 px-6 rounded-3xl font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 border-none bg-white dark:bg-slate-800"
                                title="Sair do Sistema"
                            >
                                <LogOut size={24} />
                            </Button>
                        </div>
                    </div>
                </Card>
            </section>

            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
                {/* Despesas */}
                <section className="space-y-4">
                    <button
                        onClick={() => setExpandedDespesas(!expandedDespesas)}
                        className="flex items-center justify-between w-full text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 p-2 rounded-2xl transition-all"
                    >
                        <div className="flex items-center gap-2">
                            <Tags size={20} className="font-black" />
                            <h2 className="text-sm font-black uppercase tracking-widest px-2">Despesas</h2>
                        </div>
                        <ChevronDown size={24} className={cn("transition-transform duration-300", !expandedDespesas && "-rotate-90")} />
                    </button>

                    {expandedDespesas && (
                        <Card className="p-6 border-slate-100 dark:border-slate-800 rounded-3xl animate-in slide-in-from-top-2 duration-300">
                            <form onSubmit={handleAddCat} className="flex gap-2 mb-8">
                                <input
                                    placeholder="Nova categoria..."
                                    value={newCat}
                                    onChange={e => setNewCat(e.target.value)}
                                    className="flex-1 h-12 px-6 rounded-2xl border border-slate-200 bg-slate-50 font-bold dark:border-slate-800 dark:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                />
                                <Button type="submit" size="sm" className="rounded-2xl w-12 h-12 p-0 shadow-lg shadow-primary/20">
                                    <Plus size={24} />
                                </Button>
                            </form>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {loadingCats ? (
                                    <div className="h-20 flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">Carregando...</div>
                                ) : categories.length === 0 ? (
                                    <div className="h-20 flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest italic">Nenhuma categoria</div>
                                ) : (
                                    categories.map(cat => (
                                        <div key={cat.id} className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 transition-all">
                                            <div className="flex items-center justify-between group">
                                                <button
                                                    onClick={() => toggleCategory(cat.id)}
                                                    className="flex-1 flex items-center gap-3 text-left"
                                                >
                                                    <ChevronDown size={18} className={cn("transition-transform text-slate-400", !expandedCategories[cat.id] && "-rotate-90")} />
                                                    <span className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-wide">{cat.nome}</span>
                                                </button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setConfirmDelete({ id: cat.id, nome: cat.nome, type: 'category' })}
                                                    className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl"
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>

                                            {expandedCategories[cat.id] && (
                                                <div className="pl-6 space-y-3 border-l-2 border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-1 duration-200 mt-2">
                                                    {subcategories
                                                        .filter(sub => sub.categoria_id === cat.id)
                                                        .map(sub => (
                                                            <div key={sub.id} className="flex items-center justify-between group/sub py-1">
                                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{sub.nome}</span>
                                                                <button
                                                                    onClick={() => setConfirmDelete({ id: sub.id, nome: sub.nome, type: 'subcategory' })}
                                                                    className="text-rose-400 opacity-0 group-hover/sub:opacity-100 transition-opacity hover:text-rose-600"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        ))}

                                                    <div className="flex gap-2 pt-2">
                                                        <input
                                                            placeholder="Nova sub..."
                                                            value={newSub[cat.id] || ''}
                                                            onChange={e => setNewSub(prev => ({ ...prev, [cat.id]: e.target.value }))}
                                                            onKeyDown={e => e.key === 'Enter' && handleAddSub(cat.id)}
                                                            className="flex-1 h-10 px-4 text-sm rounded-xl border border-slate-100 bg-white font-bold dark:border-slate-800 dark:bg-slate-900 outline-none focus:border-primary transition-all"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAddSub(cat.id)}
                                                            className="h-10 w-10 p-0 rounded-xl shrink-0"
                                                        >
                                                            <Plus size={18} />
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
                        className="flex items-center justify-between w-full text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 p-2 rounded-2xl transition-all"
                    >
                        <div className="flex items-center gap-2">
                            <Wallet size={20} className="font-black" />
                            <h2 className="text-sm font-black uppercase tracking-widest px-2">Receitas</h2>
                        </div>
                        <ChevronDown size={24} className={cn("transition-transform duration-300", !expandedReceitas && "-rotate-90")} />
                    </button>

                    {expandedReceitas && (
                        <Card className="p-6 border-slate-100 dark:border-slate-800 rounded-3xl animate-in slide-in-from-top-2 duration-300">
                            <form onSubmit={handleAddInc} className="flex gap-2 mb-8">
                                <input
                                    placeholder="Fonte de receita..."
                                    value={newInc}
                                    onChange={e => setNewInc(e.target.value)}
                                    className="flex-1 h-12 px-6 rounded-2xl border border-slate-200 bg-slate-50 font-bold dark:border-slate-800 dark:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                />
                                <Button type="submit" size="sm" className="rounded-2xl w-12 h-12 p-0 shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600">
                                    <Plus size={24} />
                                </Button>
                            </form>

                            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {loadingCats ? (
                                    <div className="h-20 flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest">Carregando...</div>
                                ) : incomeTypes.length === 0 ? (
                                    <div className="h-20 flex items-center justify-center text-slate-400 text-sm font-bold uppercase tracking-widest italic">Nenhum tipo</div>
                                ) : (
                                    incomeTypes.map(inc => (
                                        <div key={inc.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                                            <span className="font-black text-slate-700 dark:text-slate-200 uppercase text-xs tracking-wide">{inc.nome}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setConfirmDelete({ id: inc.id, nome: inc.nome, type: 'incomeType' })}
                                                className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all rounded-xl"
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-sm p-8 shadow-2xl border-slate-200 dark:border-slate-800 rounded-[2.5rem] animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 rounded-3xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
                                <AlertTriangle size={40} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Confirmar Exclusão?</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-bold leading-relaxed">
                                    Apagar <span className="text-slate-900 dark:text-white">"{confirmDelete.nome}"</span>? Esta ação é irreversível.
                                </p>
                            </div>
                            <div className="flex gap-4 w-full">
                                <Button
                                    variant="ghost"
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 rounded-2xl h-14 font-black"
                                >
                                    Sair
                                </Button>
                                <Button
                                    onClick={onConfirmDelete}
                                    className="flex-1 rounded-2xl h-14 bg-rose-600 hover:bg-rose-700 font-black shadow-lg shadow-rose-600/20"
                                >
                                    Apagar
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Modal de Senha para Reset/Limpeza */}
            {showResetModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-sm bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                                <Lock size={36} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Ação Restrita</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-bold">
                                    Digite a senha 'admin123' para resetar o sistema.
                                </p>
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={resetPasswordInput}
                                onChange={e => setResetPasswordInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && confirmClearTransactions()}
                                className="w-full px-6 py-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-center text-xl font-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                autoFocus
                            />
                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={() => { setShowResetModal(false); setResetPasswordInput(''); }}
                                    className="flex-1 h-14 rounded-2xl font-black text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                >
                                    Sair
                                </button>
                                <button
                                    onClick={confirmClearTransactions}
                                    disabled={clearing || resetPasswordInput.length === 0}
                                    className="flex-1 h-14 rounded-2xl font-black text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg shadow-primary/20"
                                >
                                    {clearing ? 'Wait...' : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Utilitários Section */}
            <div className="pt-12 pb-12 border-t border-slate-100 dark:border-slate-800">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Export */}
                    <Card className="p-8 rounded-[2rem] border-slate-100 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-950/10 h-full flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mb-4">
                            <Download size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase mb-2">Exportar CSV</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-8">
                            Baixe suas transações para usar no Excel ou Google Sheets.
                        </p>
                        <Button
                            onClick={handleExportCSV}
                            loading={exporting}
                            className="w-full rounded-2xl h-14 font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                        >
                            Exportar Geral
                        </Button>
                    </Card>

                    {/* System */}
                    <Card className="p-8 rounded-[2rem] border-slate-100 dark:border-slate-800 bg-primary/5 dark:bg-primary/10 h-full flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                            <RefreshCw size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase mb-2">Sistema</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-8">
                            Ações globais de dados e restauração de padrões.
                        </p>
                        <div className="grid grid-cols-1 w-full gap-3">
                            <Button
                                variant="secondary"
                                onClick={handleSeedData}
                                loading={seeding}
                                className="w-full rounded-2xl h-12 font-black text-xs"
                            >
                                Iniciar Semeio
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleMigrateHistoricalData}
                                loading={migrating}
                                className="w-full rounded-2xl h-12 font-black text-[10px] text-slate-400"
                            >
                                Importar Histórico
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleClearTransactions}
                                loading={clearing}
                                className="w-full rounded-2xl h-12 font-black text-[10px] text-rose-300"
                            >
                                Resetar Tudo
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            <footer className="pb-12 text-center">
                <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">GEFIN PWA · Premium Cloud Edition</p>
            </footer>
        </div>
    );
};
