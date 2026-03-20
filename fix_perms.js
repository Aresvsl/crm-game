const { Client } = require('pg');

async function fixPermissions() {
  const connectionString = 'postgresql://postgres:Jw94Y2N0kr20nDbq@db.krvdixadkiqawlwtdnjc.supabase.co:5432/postgres';
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Conectando ao Supabase db.krvdixadkiqawlwtdnjc.supabase.co...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    const sql = `
      GRANT USAGE ON SCHEMA public TO anon, authenticated;
      GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
    `;

    console.log('⚙️ Executando GRANTs de permissão no schema public...');
    await client.query(sql);
    console.log('✅ Permissões aplicadas com sucesso!');

  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await client.end();
  }
}

fixPermissions();
