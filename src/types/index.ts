export type TipoTransacao = 'Receita' | 'Despesa';

export interface Profile {
    id: string;
    nome: string;
    created_at: string;
}

export interface Transacao {
    id: number;
    user_id: string;
    tipo: TipoTransacao;
    categoria?: string;
    conta: string;
    valor: number;
    mes: string;
    ano: number;
    data_registro: string;
    created_at: string;
    updated_at: string;
}

export interface CategoriaDespesa {
    id: number;
    user_id: string;
    nome: string;
}

export interface TipoReceita {
    id: number;
    user_id: string;
    nome: string;
}

export interface ResumoFluxo {
    user_id: string;
    ano: number;
    mes: string;
    total_receitas: number;
    total_despesas: number;
    fluxo_caixa: number;
    valor_inicial_ano: number;
}
