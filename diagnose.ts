import { supabase } from './src/lib/supabase';

async function diagnose() {
    console.log('--- DIAGNÓSTICO DE BANCO DE DADOS ---');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.log('Nenhum usuário logado no Auth.');
        // Tenta listar categorias sem filtro (pode falhar se RLS estiver on)
    } else {
        console.log('Usuário logado:', user.id);
    }

    const { data: catData, error: catErr } = await supabase.from('categorias_despesa').select('*', { count: 'exact' });
    console.log('Categorias (Total):', catData?.length, 'Erro:', catErr?.message);

    const { data: incData, error: incErr } = await supabase.from('tipos_receita').select('*', { count: 'exact' });
    console.log('Receitas (Total):', incData?.length, 'Erro:', incErr?.message);

    if (user) {
        const { data: myCat } = await supabase.from('categorias_despesa').select('*').eq('user_id', user.id);
        console.log('Categorias do usuário:', myCat?.length);
    }
}

diagnose();
