const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://krvdixadkiqawlwtdnjc.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydmRpeGFka2lxYXdsd3RkbmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MDAxNjQsImV4cCI6MjA4NzM3NjE2NH0.t82PeJJellZf-LPrti8m8amkaefDq4tX9UXYGtrsris';

const supabase = createClient(supabaseUrl, anonKey);

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...');
  console.log('URL:', supabaseUrl);
  
  // Test 1: Can we reach Supabase at all?
  try {
    const { data, error } = await supabase.from('clientes').select('count').limit(1);
    if (error) {
      console.log('❌ Erro ao consultar tabela clientes:', error.message, '| Code:', error.code);
    } else {
      console.log('✅ Conexão com Supabase OK! Tabela clientes acessível.');
    }
  } catch (e) {
    console.log('❌ Erro de rede/fatal:', e.message);
  }

  // Test 2: Try to sign in with a test call (wrong creds to just see what comes back)
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@gamabones.com',
      password: 'wrongpassword_test_only'
    });
    if (error) {
      console.log('✅ Auth endpoint respondeu! Erro (esperado):', error.message);
    } else {
      console.log('🔑 Login com senha errada? Estranho...');
    }
  } catch (e) {
    console.log('❌ CORS/Rede bloqueando o Auth:', e.message);
  }
}

testConnection();
