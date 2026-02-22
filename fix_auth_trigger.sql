
-- 0. CORREÇÃO DE SCHEMA: Garante que a tabela configuracoes tenha a estrutura correta (chave/valor)
-- Se a tabela estiver no formato antigo (sem a coluna 'chave'), nós a recriamos.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'configuracoes' AND column_name = 'chave') THEN
        -- Backup básico se existirem dados (opcional, mas seguro)
        -- DROP TABLE IF EXISTS public.configuracoes CASCADE;
        
        -- Recriação com a estrutura correta que o código espera
        CREATE TABLE IF NOT EXISTS public.configuracoes_new (
            id BIGSERIAL PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            chave TEXT NOT NULL,
            valor TEXT NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, chave)
        );

        -- Se a tabela antiga existia, tenta migrar o básico ou apenas deleta
        -- Para evitar erros de foreign key ou tabelas vinculadas, vamos apenas renomear se possível ou dropar
        DROP TABLE IF EXISTS public.configuracoes CASCADE;
        ALTER TABLE public.configuracoes_new RENAME TO configuracoes;
    END IF;
END $$;

-- 1. Garante que a função existe e tem SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Criar perfil
  INSERT INTO public.profiles (id, nome)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Usuário Novo'));

  -- Categorias padrão
  INSERT INTO public.categorias_despesa (user_id, nome)
  VALUES 
    (new.id, 'Casa'), (new.id, 'Obrigações'), (new.id, 'DespesasDiárias'),
    (new.id, 'Assinaturas'), (new.id, 'Sara'), (new.id, 'Filhos'),
    (new.id, 'Poupança'), (new.id, 'Saúde'), (new.id, 'Férias'),
    (new.id, 'Transporte'), (new.id, 'Educação'), (new.id, 'Seguro'),
    (new.id, 'Diverso'), (new.id, 'Caridade'), (new.id, 'AnimaisDeEstimação')
  ON CONFLICT DO NOTHING;

  -- Tipos de receita padrão
  INSERT INTO public.tipos_receita (user_id, nome)
  VALUES 
    (new.id, 'Salário'), (new.id, 'Diárias'), (new.id, 'comissão vendas Zhonet'),
    (new.id, 'IPTV (LUCROS)'), (new.id, 'Dividendos'), (new.id, 'Férias'),
    (new.id, '13 Salário'), (new.id, 'Transferência da poupança'),
    (new.id, 'Valor inicial do Ano'), (new.id, 'Outros')
  ON CONFLICT DO NOTHING;

  -- Configurações padrão
  INSERT INTO public.configuracoes (user_id, chave, valor)
  VALUES 
    (new.id, 'mes_padrao', 'janeiro'),
    (new.id, 'renda_prevista', '0')
  ON CONFLICT (user_id, chave) DO UPDATE SET valor = EXCLUDED.valor;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ativa o Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Correção para usuários que já se cadastraram mas estão sem perfil/dados
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id, raw_user_meta_data FROM auth.users
    LOOP
        -- Cria perfil se não existir
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = r.id) THEN
            INSERT INTO public.profiles (id, nome)
            VALUES (r.id, COALESCE(r.raw_user_meta_data->>'full_name', 'Usuário Antigo'));
        END IF;

        -- Categorias padrão para usuários órfãos (sempre tenta inserir, o ON CONFLICT ignora duplicatas)
        INSERT INTO public.categorias_despesa (user_id, nome)
        SELECT r.id, name FROM (VALUES 
            ('Casa'), ('Obrigações'), ('DespesasDiárias'), ('Assinaturas'), 
            ('Sara'), ('Filhos'), ('Poupança'), ('Saúde'), ('Férias'),
            ('Transporte'), ('Educação'), ('Seguro'), ('Diverso'), ('Caridade')
        ) AS t(name) ON CONFLICT DO NOTHING;
        
        -- Configurações padrão
        INSERT INTO public.configuracoes (user_id, chave, valor)
        VALUES 
            (r.id, 'mes_padrao', 'janeiro'), 
            (r.id, 'renda_prevista', '0')
        ON CONFLICT (user_id, chave) DO NOTHING;
    END LOOP;
END $$;
