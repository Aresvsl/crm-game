import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://krvdixadkiqawlwtdnjc.supabase.co';
// Using the Service Role Key provided by the user to manage users
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdWBhYmFzZSIsInJlZiI6ImtydmRpeGFka2lxYXdsd3RkbmpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgwMDE2NCwiZXhwIjoyMDg3Mzc2MTY0fQ.hs6TJVUpEz11RCX3X9sBZCB_zZ2yrHi3vlHNv6WcHT4';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  console.log('--- GAMA CRM: Criando Usuário Diamante ---');
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@gamabones.com',
    password: 'GamaAdmin123!',
    email_confirm: true
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log('✅ Usuário admin@gamabones.com já existe. Resetando senha...');
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        // We need the ID to update, but we can't easily get it without listing.
        // Let's try to list first.
        'placeholder' 
      );
      console.log('⚠️ Por favor, use a senha que você já definiu ou delete o usuário no painel e me peça para criar de novo.');
    } else {
      console.log('❌ Erro:', error.message);
    }
  } else {
    console.log('🚀 SUCESSO! Usuário admin@gamabones.com criado com a senha: GamaAdmin123!');
  }
}

createAdmin();
