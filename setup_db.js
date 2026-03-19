const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://krvdixadkiqawlwtdnjc.supabase.co',
  // service_role key (can create tables)
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydmRpeGFka2lxYXdsd3RkbmpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgwMDE2NCwiZXhwIjoyMDg3Mzc2MTY0fQ.hs6TJVUpEz11RCX3X9sBZCB_zZ2yrHi3vlHNv6WcHT4'
);

async function createTables() {
  console.log('🔧 Criando tabelas no Supabase...');

  const sql = `
    CREATE TABLE IF NOT EXISTS public.clientes (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      nome TEXT NOT NULL,
      email TEXT,
      telefone TEXT,
      cidade TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.produtos (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      nome TEXT NOT NULL,
      categoria TEXT DEFAULT 'Geral',
      preco NUMERIC(10,2) NOT NULL DEFAULT 0,
      estoque INTEGER DEFAULT 0,
      imagem_url TEXT,
      ativo BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.pedidos (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      cliente TEXT NOT NULL,
      cliente_id UUID,
      total_venda NUMERIC(10,2) NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'Aberto',
      items JSONB DEFAULT '[]',
      pagamento TEXT DEFAULT 'Pix',
      entrega TEXT DEFAULT 'Retirada',
      data TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clientes' AND policyname = 'auth_clientes') THEN
        CREATE POLICY "auth_clientes" ON public.clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'produtos' AND policyname = 'auth_produtos') THEN
        CREATE POLICY "auth_produtos" ON public.produtos FOR ALL TO authenticated USING (true) WITH CHECK (true);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pedidos' AND policyname = 'auth_pedidos') THEN
        CREATE POLICY "auth_pedidos" ON public.pedidos FOR ALL TO authenticated USING (true) WITH CHECK (true);
      END IF;
    END $$;
  `;

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(() => ({ data: null, error: { message: 'RPC not available' } }));

  if (error) {
    // Try direct query via pg REST
    console.log('ℹ️ RPC indisponível, tentando criar via insert de teste...');
    
    // Test if tables exist
    const { error: err1 } = await supabase.from('clientes').select('count').limit(1);
    const { error: err2 } = await supabase.from('produtos').select('count').limit(1);
    const { error: err3 } = await supabase.from('pedidos').select('count').limit(1);
    
    console.log('clientes:', err1 ? '❌ ' + err1.message : '✅ OK');
    console.log('produtos:', err2 ? '❌ ' + err2.message : '✅ OK');
    console.log('pedidos:', err3 ? '❌ ' + err3.message : '✅ OK');
    
    if (err1 || err2 || err3) {
      console.log('\n⚠️  As tabelas não existem. Você precisa executar o SQL manualmente.');
      console.log('👉 Acesse: https://supabase.com/dashboard/project/krvdixadkiqawlwtdnjc/sql/new');
    }
  } else {
    console.log('✅ Tabelas criadas com sucesso!');
  }
}

createTables();
