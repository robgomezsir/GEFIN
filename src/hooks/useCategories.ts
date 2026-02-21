'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useCategories() {
    const [categories, setCategories] = useState<any[]>([]);
    const [incomeTypes, setIncomeTypes] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.log('useCategories: Usuário não autenticado ainda.');
            return;
        }

        console.log('useCategories: Buscando categorias para o usuário:', user.id);
        setLoading(true);
        try {
            const { data: catData, error: catError } = await supabase
                .from('categorias_despesa')
                .select('*')
                .eq('user_id', user.id)
                .order('nome');

            if (catError) console.error('useCategories: Erro catData:', catError);

            const { data: incData, error: incError } = await supabase
                .from('tipos_receita')
                .select('*')
                .eq('user_id', user.id)
                .order('nome');

            if (incError) console.error('useCategories: Erro incData:', incError);

            const { data: subData, error: subError } = await supabase
                .from('contas_despesa')
                .select('*')
                .eq('user_id', user.id)
                .order('nome');

            if (subError) console.error('useCategories: Erro subData:', subError);

            if (!catError) {
                console.log('useCategories: Categorias encontradas:', catData?.length);
                setCategories(catData || []);
            }
            if (!incError) {
                console.log('useCategories: Tipos de receita encontrados:', incData?.length);
                setIncomeTypes(incData || []);
            }
            if (!subError) {
                console.log('useCategories: Subcategorias encontradas:', subData?.length);
                setSubcategories(subData || []);
            }
        } catch (err) {
            console.error('useCategories: Erro fatal ao buscar categorias:', err);
        } finally {
            setLoading(false);
        }
    };

    const addCategory = async (nome: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Usuário não autenticado' } };

        const { error } = await supabase.from('categorias_despesa').insert({ nome, user_id: user.id });
        if (!error) fetchData();
        return { error };
    };

    const addSubcategory = async (categoriaId: number, nome: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Usuário não autenticado' } };

        const { error } = await supabase.from('contas_despesa').insert({
            nome,
            categoria_id: categoriaId,
            user_id: user.id
        });
        if (!error) fetchData();
        return { error };
    };

    const addIncomeType = async (nome: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: { message: 'Usuário não autenticado' } };

        const { error } = await supabase.from('tipos_receita').insert({ nome, user_id: user.id });
        if (!error) fetchData();
        return { error };
    };

    const deleteCategory = async (id: number) => {
        const { error } = await supabase.from('categorias_despesa').delete().eq('id', id);
        if (!error) fetchData();
        return { error };
    };

    const deleteSubcategory = async (id: number) => {
        const { error } = await supabase.from('contas_despesa').delete().eq('id', id);
        if (!error) fetchData();
        return { error };
    };

    const deleteIncomeType = async (id: number) => {
        const { error } = await supabase.from('tipos_receita').delete().eq('id', id);
        if (!error) fetchData();
        return { error };
    };

    useEffect(() => {
        fetchData();

        // Inscrever em mudanças em tempo real
        const catChannel = supabase
            .channel('public:categorias_despesa')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categorias_despesa' }, () => {
                fetchData();
            })
            .subscribe();

        const incChannel = supabase
            .channel('public:tipos_receita')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tipos_receita' }, () => {
                fetchData();
            })
            .subscribe();

        const subChannel = supabase
            .channel('public:contas_despesa')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contas_despesa' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(catChannel);
            supabase.removeChannel(incChannel);
            supabase.removeChannel(subChannel);
        };
    }, []);

    return {
        categories,
        incomeTypes,
        subcategories,
        loading,
        addCategory,
        addIncomeType,
        addSubcategory,
        deleteCategory,
        deleteIncomeType,
        deleteSubcategory,
        refresh: fetchData
    };
}
