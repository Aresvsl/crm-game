# GUIA DE SETUP - CRM GAMA BONÉS

## 🚀 Passo 1: Inicialização do Projeto
Execute no terminal:
```bash
npx create-next-app@latest crm-gama --typescript --tailwind --eslint
cd crm-gama
```

## 📦 Passo 2: Instalação de Dependências
```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js lucide-react date-fns jspdf recharts
```

## 🔗 Passo 3: Configuração do Supabase
1. Crie um projeto no [Supabase](https://supabase.com).
2. Vá em Project Settings > API e copie a URL e a Anon Key.
3. Crie um arquivo `.env.local` na raiz do seu projeto:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_key_aqui
```

## 📊 Passo 4: Estrutura do Banco de Dados (SQL)
Execute este SQL no Editor de Consultas do Supabase:

```sql
-- TABELA DE CLIENTES
CREATE TABLE clientes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE,
  telefone TEXT,
  cidade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA DE PRODUTOS
CREATE TABLE produtos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL,
  estoque INTEGER DEFAULT 0,
  imagem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA DE PEDIDOS
CREATE TABLE pedidos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id),
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'Aberto',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📂 Passo 5: Estrutura de Pastas Recomendada
```
src/
  app/          # Rotas e Layouts (App Router)
  components/   # Componentes Reutilizáveis
  lib/          # Configuração do Supabase/Prisma
  types/        # Definições de tipos TypeScript
  utils/        # Funções auxiliares (formatters, etc)
```

## 🚀 Passo 6: Desenvolvimento e Deploy
1. Inicie o servidor local: `npm run dev`
2. Configure o repositório no GitHub.
3. Importe o projeto na **Vercel**.
4. Adicione as variáveis de ambiente `.env` na Vercel.

---
**Boa sorte no desenvolvimento!** 🚀
