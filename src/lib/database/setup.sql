-- 1. Tabelas Principais

-- Perfil do usuário (estende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorias de despesa customizáveis
CREATE TABLE IF NOT EXISTS public.categorias_despesa (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  UNIQUE(user_id, nome)
);

-- Tipos de receita customizáveis
CREATE TABLE IF NOT EXISTS public.tipos_receita (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  UNIQUE(user_id, nome)
);

-- Transações (O Banco de Dados de lançamentos)
CREATE TABLE IF NOT EXISTS public.transacoes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Receita', 'Despesa')),
  categoria TEXT, -- Nome da categoria de despesa (Casa, Saúde, etc)
  conta TEXT NOT NULL, -- Subcategoria ou fonte da receita
  valor DECIMAL(12,2) NOT NULL CHECK (valor > 0),
  mes TEXT NOT NULL, -- janeiro, fevereiro... dezembro (minúsculo)
  ano INTEGER NOT NULL,
  data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configurações do usuário
CREATE TABLE IF NOT EXISTS public.configuracoes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  ano_padrao INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  mes_padrao TEXT DEFAULT 'janeiro',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Row Level Security (RLS) - Segurança

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_despesa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_receita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Usuários veem apenas seus perfis" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Usuários veem suas categorias" ON public.categorias_despesa FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuários veem seus tipos de receita" ON public.tipos_receita FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuários veem suas transações" ON public.transacoes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Usuários veem suas configurações" ON public.configuracoes FOR ALL USING (auth.uid() = user_id);

-- 3. Views para Cálculos Rápidos (Motor do Sistema)

-- View: Resumo mensal de receitas, despesas e fluxo
CREATE OR REPLACE VIEW public.v_resumo_fluxo AS
SELECT
  user_id,
  ano,
  mes,
  SUM(CASE WHEN tipo = 'Receita' AND conta != 'Valor inicial do Ano' THEN valor ELSE 0 END) AS total_receitas,
  SUM(CASE WHEN tipo = 'Despesa' THEN valor ELSE 0 END) AS total_despesas,
  SUM(CASE WHEN tipo = 'Receita' AND conta != 'Valor inicial do Ano' THEN valor ELSE -valor END) AS fluxo_caixa,
  MAX(CASE WHEN conta = 'Valor inicial do Ano' THEN valor ELSE 0 END) AS valor_inicial_ano
FROM public.transacoes
GROUP BY user_id, ano, mes;

-- View: Despesas agrupadas por categoria para gráficos
CREATE OR REPLACE VIEW public.v_despesas_por_categoria AS
SELECT
  user_id,
  categoria,
  ano,
  mes,
  SUM(valor) AS total
FROM public.transacoes
WHERE tipo = 'Despesa'
GROUP BY user_id, categoria, ano, mes;

-- 4. Função para disparar na criação do usuário (Trigger opcional)
-- Popula os dados iniciais do usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Criar perfil
  INSERT INTO public.profiles (id, nome)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');

  -- Categorias padrão
  INSERT INTO public.categorias_despesa (user_id, nome)
  VALUES 
    (new.id, 'Casa'), (new.id, 'Obrigações'), (new.id, 'DespesasDiárias'),
    (new.id, 'Assinaturas'), (new.id, 'Sara'), (new.id, 'Filhos'),
    (new.id, 'Poupança'), (new.id, 'Saúde'), (new.id, 'Férias'),
    (new.id, 'Transporte'), (new.id, 'Educação'), (new.id, 'Seguro'),
    (new.id, 'Diverso'), (new.id, 'Caridade'), (new.id, 'AnimaisDeEstimação');

  -- Tipos de receita padrão
  INSERT INTO public.tipos_receita (user_id, nome)
  VALUES 
    (new.id, 'Salário'), (new.id, 'Diárias'), (new.id, 'comissão vendas Zhonet'),
    (new.id, 'IPTV (LUCROS)'), (new.id, 'Dividendos'), (new.id, 'Férias'),
    (new.id, '13 Salário'), (new.id, 'Transferência da poupança'),
    (new.id, 'Valor inicial do Ano'), (new.id, 'Outros');

  -- Configuração padrão
  INSERT INTO public.configuracoes (user_id, mes_padrao)
  VALUES (new.id, 'janeiro');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger disparado no Auth Signup
-- CREATE TRIGGER on_auth_user_created
-- AFTER INSERT ON auth.users
-- FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
