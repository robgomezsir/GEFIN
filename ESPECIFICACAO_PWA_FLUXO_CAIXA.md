# Especificação Técnica — PWA Fluxo de Caixa
> Documento para replicação do sistema Excel `FLUXO_CAIXA_-.xlsm` como Progressive Web App com Supabase

---

## 1. ANÁLISE DO SISTEMA ORIGINAL

### 1.1 Visão Geral

O arquivo é um sistema de controle de fluxo de caixa pessoal/familiar com 5 abas:

| Aba | Função |
|-----|--------|
| **PAINEL** | Interface de entrada de dados e controles visuais |
| **CONFIG** | Listas de configuração (meses, anos, categorias, subcategorias) |
| **Dados** | Banco de dados bruto de todas as transações (`tblbancodedados`) |
| **TABELA** | Motor de cálculo — agrega dados por mês/categoria via SUMIFS |
| **RELATORIO** | Visualização filtrada por mês/ano das transações |

### 1.2 Modelo de Dados (aba `Dados` — `tblbancodedados`)

Cada registro possui os seguintes campos:

| Campo | Tipo | Exemplo | Notas |
|-------|------|---------|-------|
| `Cod` | Inteiro | `68` | ID autoincrementado |
| `Categoria da Conta` | String | `"Casa"`, `"Obrigações"` | Categoria de 1º nível (só para despesas) |
| `Conta` | String | `"Salário"`, `"Luz"` | Subcategoria / nome da conta |
| `Tipo` | Enum | `"Receita"` / `"Despesa"` | Tipo da transação |
| `Valor` | Decimal | `2400.00` | Sempre positivo |
| `Mês` | String | `"fevereiro"` | Nome do mês em minúsculas PT-BR |
| `Ano` | Inteiro | `2026` | Ano da competência |
| `Data do Registro` | Data | `26/01/2026` | Data de lançamento |

**Observação crítica:** Receitas **não** possuem `Categoria da Conta` (campo vazio). A `Conta` para receitas é o nome direto (ex: "Salário", "Diárias", "IPTV (LUCROS)").

### 1.3 Listas de Configuração (aba `CONFIG`)

#### Tipos de Receita (`tblReceitas`)
```
comissão vendas Zhonet | Diárias | Dividendos | Férias | Outros |
IPTV (LUCROS) | SALARIO + AUXILIO - SARA | 13 Salário | Salário |
Transferência da poupança | Valor inicial do Ano
```

#### Categorias de Despesa (`tblCategoriaDespesas`)
```
Assinaturas | Casa | DespesasDiárias | Sara | Férias | Filhos |
Obrigações | Poupança | Saúde | AnimaisDeEstimação | Caridade |
Diverso | Educação | Seguro | Transporte
```

#### Subcategorias por Categoria

**Casa:** Material de Construção, Pedreiro, Mercado, AÇOUGUE, Água, Luz, Gás, Melhorias, Móveis/eletrodomésticos, Outros

**Assinaturas:** Academia, Conta Claro, Outros, Revistas, Taxas de adesão/contribuições

**Sara:** short, roupa meninos

**Filhos:** Babá, Brinquedos e jogos, Material escolar, Médico, Mensalidade da escola, Merenda escolar, Outros, Vestuário

**Obrigações:** Cartão de crédito itau MAST, Cartão NUNBANK, INVESTIMENTOS, compra de terreno, SEGURO DO CARRO, Faculdade, Cartão SARA, JANILDE, FERNADA, GEANE, NINHA, GASOLINA, ZANE, CLAUDETE

**Poupança:** Investimentos, CAIXA CASAL VIAGEM, Aposentadoria (fundos, inss), Fundo de emergência, Outros, Transferência para poupança

**DespesasDiárias:** GASOLINA, CARTÃO - SARA, CAIXA DE CASAL

**Saúde:** Médico/dentista, Outros, Remédios, FERNADA, ILMA

#### Anos disponíveis: 2019 a 2028
#### Meses: Janeiro a Dezembro

### 1.4 Lógica de Cálculo (aba `TABELA`)

O motor de cálculo usa `SUMIFS` para agregar por múltiplos critérios. Há três tabelas pivô:

#### Tabela 1 — Receitas por Conta × Mês (`tblReceitaGeral`)
```
SUMIFS(Valor, Tipo="Receita", Conta=X, Mês=M, Ano=AnoFluxo)
```

#### Tabela 2 — Despesas por Categoria × Mês (`tbldespesasGeral`)
```
SUMIFS(Valor, Tipo="Despesa", Categoria=X, Mês=M, Ano=AnoFluxo)
```

#### Tabela 3 — Resumo do Fluxo de Caixa (`tblFluxo`)
```
VALOR_INICIAL        → Transação especial com Conta="Valor inicial do Ano"
TOTAL RECEITAS       → SUM de todas as receitas do mês
TOTAL DESPESAS       → SUM de todas as despesas do mês
FLUXO DE CAIXA       → TOTAL RECEITAS - TOTAL DESPESAS
SALDO ANTERIOR       → SALDO ACUMULADO do mês anterior
SALDO ACUMULADO      → SALDO ANTERIOR + FLUXO DE CAIXA
```

### 1.5 Funcionalidades de Visualização

- **PAINEL:** Formulário de entrada rápida de lançamentos (Tipo, Categoria, Conta, Valor, Mês, Ano)
- **RELATORIO:** Filtro por Mês + Ano, exibindo todas as transações do período com subtotal
- **Gráficos (7 charts):**
  1. Fluxo de Caixa do Mês (Receitas × Despesas × Saldo)
  2. Consumo do Mês por Categoria
  3. Fluxo de Caixa do Ano (mensal)
  4. Fluxo de Caixa Acumulado do Ano
  5. Consumo do Ano por Categoria
  6-7. Variações adicionais

- **Indicador de Disponibilidade:** Cálculo `DispFCaixa / MédiaSalário` — percentual do fluxo disponível em relação à média salarial

---

## 2. ARQUITETURA DO PWA

### 2.1 Stack Tecnológica Recomendada

```
Frontend:  React + Vite  (ou Next.js para SSR)
Styling:   Tailwind CSS
Charts:    Recharts (ou Chart.js)
DB/Auth:   Supabase (PostgreSQL + Auth + Realtime)
PWA:       Vite PWA Plugin (service worker, manifest)
State:     Zustand ou React Query (TanStack Query)
```

### 2.2 Sincronização em Tempo Real

Para que **qualquer alteração entre mobile e web seja compartilhada automaticamente**, use o **Supabase Realtime**:

```javascript
// Assinar mudanças na tabela de transações
const channel = supabase
  .channel('transacoes-changes')
  .on('postgres_changes', {
    event: '*',          // INSERT, UPDATE, DELETE
    schema: 'public',
    table: 'transacoes',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    // Atualizar estado local automaticamente
    refreshTransacoes(payload);
  })
  .subscribe();
```

---

## 3. SCHEMA DO BANCO DE DADOS (SUPABASE / POSTGRESQL)

### 3.1 Tabelas Principais

```sql
-- Usuários (gerenciado pelo Supabase Auth)
-- auth.users já existe automaticamente

-- Perfil do usuário
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transações (equivalente à aba "Dados")
CREATE TABLE transacoes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Receita', 'Despesa')),
  categoria TEXT,            -- NULL para Receitas
  conta TEXT NOT NULL,       -- Nome da subconta/fonte
  valor DECIMAL(12,2) NOT NULL CHECK (valor > 0),
  mes TEXT NOT NULL,         -- 'janeiro', 'fevereiro', ... 'dezembro'
  ano INTEGER NOT NULL,
  data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorias customizáveis (equivalente à aba "CONFIG")
CREATE TABLE categorias_despesa (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  nome TEXT NOT NULL,
  UNIQUE(user_id, nome)
);

CREATE TABLE contas_despesa (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  categoria_id INTEGER REFERENCES categorias_despesa(id),
  nome TEXT NOT NULL,
  UNIQUE(user_id, categoria_id, nome)
);

CREATE TABLE tipos_receita (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  nome TEXT NOT NULL,
  UNIQUE(user_id, nome)
);

-- Configurações gerais do usuário
CREATE TABLE configuracoes (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  ano_padrao INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  mes_padrao TEXT DEFAULT 'janeiro',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Row Level Security (RLS) — OBRIGATÓRIO

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_despesa ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_despesa ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_receita ENABLE ROW LEVEL SECURITY;

-- Política: usuário só vê seus próprios dados
CREATE POLICY "users_own_transacoes"
  ON transacoes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Repetir para as demais tabelas...
```

### 3.3 Índices para Performance

```sql
CREATE INDEX idx_transacoes_user_ano ON transacoes(user_id, ano);
CREATE INDEX idx_transacoes_user_mes_ano ON transacoes(user_id, mes, ano);
CREATE INDEX idx_transacoes_tipo ON transacoes(tipo);
```

### 3.4 Views SQL (equivalentes ao SUMIFS do Excel)

```sql
-- View: Receitas por conta × mês (equivalente a tblReceitaGeral)
CREATE VIEW v_receitas_por_conta AS
SELECT
  user_id,
  conta,
  ano,
  mes,
  SUM(valor) AS total
FROM transacoes
WHERE tipo = 'Receita'
GROUP BY user_id, conta, ano, mes;

-- View: Despesas por categoria × mês (equivalente a tbldespesasGeral)
CREATE VIEW v_despesas_por_categoria AS
SELECT
  user_id,
  categoria,
  ano,
  mes,
  SUM(valor) AS total
FROM transacoes
WHERE tipo = 'Despesa'
GROUP BY user_id, categoria, ano, mes;

-- View: Resumo mensal do fluxo de caixa
CREATE VIEW v_resumo_fluxo AS
SELECT
  user_id,
  ano,
  mes,
  SUM(CASE WHEN tipo = 'Receita' THEN valor ELSE 0 END) AS total_receitas,
  SUM(CASE WHEN tipo = 'Despesa' THEN valor ELSE 0 END) AS total_despesas,
  SUM(CASE WHEN tipo = 'Receita' THEN valor ELSE -valor END) AS fluxo_caixa
FROM transacoes
WHERE conta != 'Valor inicial do Ano'
GROUP BY user_id, ano, mes;
```

---

## 4. ESTRUTURA DO PWA (COMPONENTES)

### 4.1 Rotas / Telas

```
/                    → Dashboard (PAINEL)
/lancamentos         → Lista de transações com filtro mês/ano
/novo-lancamento     → Formulário de entrada
/editar/:id          → Editar transação
/relatorio           → Relatório filtrado (equivalente à aba RELATORIO)
/graficos            → Visualizações gráficas
/configuracoes       → Gerenciar categorias, contas, preferências
/auth/login          → Login
/auth/cadastro       → Cadastro
```

### 4.2 Componentes Principais

#### Dashboard (`/`)
```
┌─────────────────────────────┐
│  FLUXO DE CAIXA  [Mês][Ano] │
├─────────────────────────────┤
│  💰 Receitas: R$ 3.560,00   │
│  💸 Despesas: R$ 2.941,15   │
│  📊 Fluxo:    R$   618,85   │
│  🏦 Saldo:    R$ 1.601,49   │
├─────────────────────────────┤
│  [Gráfico Pizza Categorias] │
├─────────────────────────────┤
│  [+ Novo Lançamento]        │
└─────────────────────────────┘
```

#### Formulário de Novo Lançamento
```
Campos obrigatórios:
  - Tipo: [Receita | Despesa]  ← toggle/radio
  - Se Despesa: Categoria (dropdown das categorias)
  - Conta/Subcategoria (dropdown filtrado pela categoria)
  - Valor (input numérico, teclado monetário no mobile)
  - Mês (dropdown, padrão = mês atual)
  - Ano (dropdown, padrão = ano atual)
  - Data do Registro (date picker, padrão = hoje)
```

**Lógica de Categoria:**
- Quando `tipo = "Receita"`: mostrar apenas o campo `Conta` (lista de tipos de receita)
- Quando `tipo = "Despesa"`: mostrar `Categoria` + `Conta` (filtrada pela categoria)

#### Relatório
```
Filtros: [Mês ▼] [Ano ▼]

RECEITAS
  Salário             R$ 2.400,00
  IPTV (LUCROS)       R$   800,00
  Outros              R$   360,00
  ─────────────────────────────
  TOTAL               R$ 3.560,00

DESPESAS
  Assinaturas         R$    40,00
  Obrigações          R$ 1.690,60
  Casa                R$ 1.021,00
  Poupança            R$   250,00
  DespesasDiárias     R$   300,00
  ─────────────────────────────
  TOTAL               R$ 3.301,60

RESULTADO             R$   258,40
```

### 4.3 Lógica de Cálculo do Saldo Acumulado (JavaScript)

```javascript
// Equivalente às fórmulas da linha 41 da aba TABELA
async function calcularFluxoAnual(userId, ano) {
  const meses = ['janeiro','fevereiro','março','abril','maio','junho',
                 'julho','agosto','setembro','outubro','novembro','dezembro'];

  // Buscar valor inicial do ano
  const { data: valorInicial } = await supabase
    .from('transacoes')
    .select('valor')
    .eq('user_id', userId)
    .eq('conta', 'Valor inicial do Ano')
    .eq('ano', ano)
    .single();

  let saldoAnterior = valorInicial?.valor ?? 0;
  const resultado = [];

  for (const mes of meses) {
    const { data } = await supabase
      .from('v_resumo_fluxo')
      .select('total_receitas, total_despesas, fluxo_caixa')
      .eq('user_id', userId)
      .eq('ano', ano)
      .eq('mes', mes)
      .single();

    const receitas = data?.total_receitas ?? 0;
    const despesas = data?.total_despesas ?? 0;
    const fluxo = receitas - despesas;
    const saldoAcumulado = saldoAnterior + fluxo;

    resultado.push({
      mes,
      saldoAnterior,
      receitas,
      despesas,
      fluxo,
      saldoAcumulado
    });

    saldoAnterior = saldoAcumulado; // propaga para o próximo mês
  }

  return resultado;
}
```

---

## 5. CONFIGURAÇÃO DO SUPABASE

### 5.1 Instalação no Projeto

```bash
npm install @supabase/supabase-js
```

### 5.2 Cliente Supabase (`src/lib/supabase.js`)

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 5.3 Variáveis de Ambiente (`.env`)

```
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 6. OPERAÇÕES CRUD NAS TRANSAÇÕES

### 6.1 Inserir Nova Transação

```javascript
async function inserirTransacao(dados) {
  const { data, error } = await supabase
    .from('transacoes')
    .insert({
      user_id: supabase.auth.getUser().id,
      tipo: dados.tipo,              // 'Receita' ou 'Despesa'
      categoria: dados.categoria,    // null se Receita
      conta: dados.conta,
      valor: parseFloat(dados.valor),
      mes: dados.mes.toLowerCase(),
      ano: parseInt(dados.ano),
      data_registro: dados.data_registro
    })
    .select()
    .single();

  return { data, error };
}
```

### 6.2 Buscar Transações por Mês/Ano

```javascript
async function buscarTransacoes(mes, ano) {
  const { data, error } = await supabase
    .from('transacoes')
    .select('*')
    .eq('mes', mes.toLowerCase())
    .eq('ano', ano)
    .order('data_registro', { ascending: false });

  return { data, error };
}
```

### 6.3 Atualizar Transação

```javascript
async function atualizarTransacao(id, campos) {
  const { data, error } = await supabase
    .from('transacoes')
    .update({ ...campos, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}
```

### 6.4 Deletar Transação

```javascript
async function deletarTransacao(id) {
  const { error } = await supabase
    .from('transacoes')
    .delete()
    .eq('id', id);

  return { error };
}
```

### 6.5 Resumo do Mês (Receitas, Despesas, Fluxo)

```javascript
async function buscarResumoMes(mes, ano) {
  const { data, error } = await supabase
    .from('v_resumo_fluxo')
    .select('*')
    .eq('mes', mes.toLowerCase())
    .eq('ano', ano)
    .single();

  return { data, error };
}
```

### 6.6 Despesas Agrupadas por Categoria

```javascript
async function buscarDespesasPorCategoria(mes, ano) {
  const { data, error } = await supabase
    .from('v_despesas_por_categoria')
    .select('categoria, total')
    .eq('mes', mes.toLowerCase())
    .eq('ano', ano)
    .order('total', { ascending: false });

  return { data, error };
}
```

---

## 7. SINCRONIZAÇÃO REALTIME (MOBILE ↔ WEB)

```javascript
// Hook React para sincronização em tempo real
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useTransacoesRealtime(mes, ano) {
  const [transacoes, setTransacoes] = useState([]);

  useEffect(() => {
    // Busca inicial
    buscarTransacoes(mes, ano).then(({ data }) => setTransacoes(data ?? []));

    // Canal realtime
    const channel = supabase
      .channel(`transacoes-${mes}-${ano}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transacoes',
        filter: `mes=eq.${mes}`
      }, (payload) => {
        setTransacoes(prev => [payload.new, ...prev]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'transacoes'
      }, (payload) => {
        setTransacoes(prev =>
          prev.map(t => t.id === payload.new.id ? payload.new : t)
        );
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'transacoes'
      }, (payload) => {
        setTransacoes(prev => prev.filter(t => t.id !== payload.old.id));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [mes, ano]);

  return transacoes;
}
```

---

## 8. CONFIGURAÇÃO DO PWA

### 8.1 `vite.config.js` com Plugin PWA

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Fluxo de Caixa',
        short_name: 'FluxoCaixa',
        description: 'Controle de Fluxo de Caixa Familiar',
        theme_color: '#1e40af',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        // Cache das páginas para uso offline
        runtimeCaching: [{
          urlPattern: /^https:\/\/.*\.supabase\.co\//,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'supabase-cache',
            expiration: { maxEntries: 100, maxAgeSeconds: 86400 }
          }
        }]
      }
    })
  ]
});
```

---

## 9. DADOS INICIAIS (SEED) — Categorias do Sistema Original

```sql
-- Popular categorias padrão para novos usuários (via Supabase Function ou trigger)

-- Categorias de despesa
INSERT INTO categorias_despesa (user_id, nome) VALUES
  ($USER_ID, 'Casa'),
  ($USER_ID, 'Obrigações'),
  ($USER_ID, 'DespesasDiárias'),
  ($USER_ID, 'Assinaturas'),
  ($USER_ID, 'Sara'),
  ($USER_ID, 'Filhos'),
  ($USER_ID, 'Poupança'),
  ($USER_ID, 'Saúde'),
  ($USER_ID, 'Férias'),
  ($USER_ID, 'Transporte'),
  ($USER_ID, 'Educação'),
  ($USER_ID, 'Seguro'),
  ($USER_ID, 'Diverso'),
  ($USER_ID, 'Caridade'),
  ($USER_ID, 'AnimaisDeEstimação');

-- Tipos de receita
INSERT INTO tipos_receita (user_id, nome) VALUES
  ($USER_ID, 'Salário'),
  ($USER_ID, 'Diárias'),
  ($USER_ID, 'comissão vendas Zhonet'),
  ($USER_ID, 'IPTV (LUCROS)'),
  ($USER_ID, 'Dividendos'),
  ($USER_ID, 'Férias'),
  ($USER_ID, '13 Salário'),
  ($USER_ID, 'Transferência da poupança'),
  ($USER_ID, 'Valor inicial do Ano'),
  ($USER_ID, 'Outros');
```

---

## 10. FLUXO DE MIGRAÇÃO DOS DADOS EXISTENTES

Para importar os dados históricos do arquivo Excel para o Supabase:

```javascript
// Script de migração (Node.js)
import { createClient } from '@supabase/supabase-js';

const dadosExcel = [
  // Copiar todos os registros extraídos da aba "Dados"
  { cod: 11, conta: 'Salário', tipo: 'Receita', valor: 2457.87, mes: 'julho', ano: 2025, data: '2025-07-01' },
  { cod: 10, categoria: 'Casa', conta: 'Luz', tipo: 'Despesa', valor: 123.61, mes: 'julho', ano: 2025, data: '2025-07-01' },
  // ... todos os demais registros
];

async function migrar() {
  const supabase = createClient(URL, KEY);
  const userId = 'id-do-usuario-anderson-silva';

  const registros = dadosExcel.map(r => ({
    user_id: userId,
    tipo: r.tipo,
    categoria: r.categoria ?? null,
    conta: r.conta,
    valor: r.valor,
    mes: r.mes,
    ano: r.ano,
    data_registro: r.data
  }));

  const { error } = await supabase.from('transacoes').insert(registros);
  if (error) console.error(error);
  else console.log('Migração concluída:', registros.length, 'registros');
}

migrar();
```

---

## 11. CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1 — Infraestrutura
- [ ] Criar projeto no Supabase
- [ ] Executar SQL de criação das tabelas e views
- [ ] Configurar RLS em todas as tabelas
- [ ] Criar índices de performance
- [ ] Habilitar Realtime nas tabelas `transacoes`

### Fase 2 — Backend/API
- [ ] Implementar autenticação (Supabase Auth)
- [ ] Criar funções CRUD para transações
- [ ] Criar hook `useTransacoesRealtime`
- [ ] Implementar função `calcularFluxoAnual` com saldo encadeado
- [ ] Testar sincronização entre duas abas/dispositivos

### Fase 3 — Frontend Mobile-First
- [ ] Configurar Vite + React + Tailwind
- [ ] Implementar rota `/` com cards de resumo do mês
- [ ] Implementar formulário de novo lançamento com validações
- [ ] Implementar seletor de Mês/Ano
- [ ] Implementar tela de Relatório filtrado
- [ ] Implementar tela de Histórico de transações
- [ ] Adicionar confirmação antes de deletar

### Fase 4 — Gráficos
- [ ] Gráfico de barras: Receitas × Despesas × Saldo por mês (anual)
- [ ] Gráfico de pizza: Distribuição de despesas por categoria (mensal)
- [ ] Gráfico de linha: Saldo acumulado ao longo do ano
- [ ] Indicador: % disponível em relação à média salarial

### Fase 5 — PWA
- [ ] Configurar `vite-plugin-pwa` com manifest
- [ ] Adicionar ícones (192x192 e 512x512)
- [ ] Configurar service worker para cache offline
- [ ] Testar instalação no Android e iOS (Safari)
- [ ] Testar comportamento offline com dados em cache

### Fase 6 — Configurações
- [ ] Tela de gerenciamento de categorias de despesa
- [ ] Tela de gerenciamento de subcategorias
- [ ] Tela de gerenciamento de tipos de receita
- [ ] Migração dos dados históricos do Excel

---

## 12. REGRAS DE NEGÓCIO IMPORTANTES

1. **Valor inicial do ano:** Transação especial com `conta = 'Valor inicial do Ano'` e `tipo = 'Receita'`. Não deve aparecer no total de receitas do mês, apenas inicializar o saldo. Filtrar esta conta nos cálculos de total.

2. **Saldo encadeado:** O `SALDO_ACUMULADO` de um mês **depende** do mês anterior. Não calcular isoladamente — sempre recalcular a cadeia completa do ano.

3. **Receitas sem categoria:** Campo `categoria` é `NULL` para receitas. O formulário deve ocultar o campo categoria quando `tipo = 'Receita'`.

4. **Meses em português minúsculo:** Armazenar meses sempre em minúsculas sem acento: `janeiro`, `fevereiro`, `marco`, `abril`, `maio`, `junho`, `julho`, `agosto`, `setembro`, `outubro`, `novembro`, `dezembro`.

5. **Múltiplos lançamentos do mesmo tipo no mês:** Normal e esperado (ex: duas cobranças de "Luz" em julho). O sistema soma automaticamente.

6. **Isolamento por usuário:** Todo dado é filtrado por `user_id` via RLS. Nunca expor dados de outros usuários.
