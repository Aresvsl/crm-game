const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://krvdixadkiqawlwtdnjc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdWJhc2FzZSIsInJlZiI6ImtydmRpeGFka2lxYXdsd3RkbmpjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgwMDE2NCwiZXhwIjoyMDg3Mzc2MTY0fQ.hs6TJVUpEz11RCX3X9sBZCB_zZ2yrHi3vlHNv6WcHT4';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function resetPassword() {
  console.log('--- GAMA CRM: Resetando Senha Diamante ---');
  
  // 1. Get user ID
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.log('❌ Erro ao listar:', listError.message);
    return;
  }

  const user = users.find(u => u.email === 'admin@gamabones.com');
  
  if (!user) {
    console.log('❌ Usuário admin@gamabones.com não encontrado!');
    return;
  }

  // 2. Update password
  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: 'GamaAdmin123!' }
  );

  if (error) {
    console.log('❌ Erro no reset:', error.message);
  } else {
    console.log('🚀 SUCESSO! Senha do admin@gamabones.com resetada para: GamaAdmin123!');
  }
}

resetPassword();
