const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://krvdixadkiqawlwtdnjc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydmRpeGFka2lxYXdsd3RkbmpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgwMDE2NCwiZXhwIjoyMDg3Mzc2MTY0fQ.hs6TJVUpEz11RCX3X9sBZCB_zZ2yrHi3vlHNv6WcHT4';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createAdmin() {
  console.log('--- GAMA CRM: Criando Usuário Diamante ---');
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@gamabones.com',
    password: 'GamaAdmin123!',
    email_confirm: true
  });

  if (error) {
    console.log('❌ Erro:', error.message);
  } else {
    console.log('🚀 SUCESSO! Usuário admin@gamabones.com criado com a senha: GamaAdmin123!');
  }
}

createAdmin();
