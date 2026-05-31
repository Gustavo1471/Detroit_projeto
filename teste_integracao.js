// teste_integração.js
const { getConnection, sql } = require('./src/database/db'); // Importa a conexão real do seu projeto

async function testarIntegracaoBanco() {
    console.log("--- TESTE DE INTEGRAÇÃO: COMUNICAÇÃO COM SQL SERVER ---");
    
    try {
        console.log("Tentando estabelecer conexão com o pool do banco DetroitSQL...");
        const pool = await getConnection(); // Tenta conectar de verdade usando o seu .env
        console.log("✅ Conexão estabelecida com sucesso!");

        console.log("Executando query de integração na tabela Pedidos para o usuário 1...");
        const result = await pool.request()
            .input('idUsuario', sql.Int, 1)
            .query('SELECT TOP 1 idPedido FROM DetroitSQL.dbo.Pedidos WHERE idUsuarioCliente = @idUsuario');

        // Se a consulta rodar sem quebrar (mesmo que venha vazia), a integração de código + banco funcionou
        console.log("✅ Passou: O back-end Node.js integrou e realizou consultas no SQL Server perfeitamente.");
    } catch (error) {
        console.log("❌ Falhou: Erro na integração entre o código Node.js e o SQL Server.");
        console.log("Detalhe do erro técnico:", error.message);
    } finally {
        // Encerra o processo de teste
        process.exit();
    }
}

testarIntegracaoBanco();