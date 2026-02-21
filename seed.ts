import { supabase } from './src/lib/supabase';
import { CATEGORIAS_DESPESA, TIPOS_RECEITA } from './src/utils/constants';

async function seed() {
    console.log('Iniciando semeio de dados...');

    // 1. Categorias de Despesa
    for (const nome of CATEGORIAS_DESPESA) {
        const { error } = await supabase
            .from('categorias_despesa')
            .upsert({ nome }, { onConflict: 'nome' });

        if (error) console.error(`Erro ao inserir categoria ${nome}:`, error.message);
        else console.log(`Categoria ${nome} verificada/inserida.`);
    }

    // 2. Tipos de Receita
    for (const nome of TIPOS_RECEITA) {
        const { error } = await supabase
            .from('tipos_receita')
            .upsert({ nome }, { onConflict: 'nome' });

        if (error) console.error(`Erro ao inserir tipo de receita ${nome}:`, error.message);
        else console.log(`Tipo de receita ${nome} verificado/inserido.`);
    }

    console.log('Semeio concluído!');
}

seed();
