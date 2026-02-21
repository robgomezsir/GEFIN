export const CATEGORIAS_DESPESA = [
    'Assinaturas', 'Casa', 'DespesasDiárias', 'Sara', 'Férias', 'Filhos',
    'Obrigações', 'Poupança', 'Saúde', 'AnimaisDeEstimação', 'Caridade',
    'Diverso', 'Educação', 'Seguro', 'Transporte'
];

export const TIPOS_RECEITA = [
    'Salário', 'Diárias', 'comissão vendas Zhonet', 'IPTV (LUCROS)',
    'Dividendos', 'Férias', '13 Salário', 'Transferência da poupança',
    'Valor inicial do Ano', 'Outros'
];

export const CONTAS_POR_CATEGORIA: Record<string, string[]> = {
    'Casa': ['Material de Construção', 'Pedreiro', 'Mercado', 'AÇOUGUE', 'Água', 'Luz', 'Gás', 'Melhorias', 'Móveis/eletrodomésticos', 'Outros'],
    'Assinaturas': ['Academia', 'Conta Claro', 'Outros', 'Revistas', 'Taxas de adesão/contribuições'],
    'Sara': ['short', 'roupa meninos'],
    'Filhos': ['Babá', 'Brinquedos e jogos', 'Material escolar', 'Médico', 'Mensalidade da escola', 'Merenda escolar', 'Outros', 'Vestuário'],
    'Obrigações': ['Cartão de crédito itau MAST', 'Cartão NUNBANK', 'INVESTIMENTOS', 'compra de terreno', 'SEGURO DO CARRO', 'Faculdade', 'Cartão SARA', 'JANILDE', 'FERNADA', 'GEANE', 'NINHA', 'GASOLINA', 'ZANE', 'CLAUDETE'],
    'Poupança': ['Investimentos', 'CAIXA CASAL VIAGEM', 'Aposentadoria (fundos, inss)', 'Fundo de emergência', 'Outros', 'Transferência para poupança'],
    'DespesasDiárias': ['GASOLINA', 'CARTÃO - SARA', 'CAIXA DE CASAL'],
    'Saúde': ['Médico/dentista', 'Outros', 'Remédios', 'FERNADA', 'ILMA'],
};
