const sql = require('mssql');
require('dotenv').config(); // Garante que as variáveis do .env sejam carregadas

const dbConfig = {
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: false, // Use 'true' em produção se o SQL Server exigir SSL/TLS. Para ambiente local, 'false' é comum.
        trustServerCertificate: true // Mudar para 'false' em produção. Para desenvolvimento local, 'true' pode ser necessário para certificados autoassinados.
    }
};

const pool = new sql.ConnectionPool(dbConfig);
let isConnected = false; // Flag para controlar o estado da conexão

// Função assíncrona para garantir que a conexão seja estabelecida
async function getConnection() {
    if (!isConnected) {
        try {
            await pool.connect(); // Tenta conectar
            isConnected = true;
            console.log('Conectado ao SQL Server.');
        } catch (err) {
            isConnected = false;
            console.error('Erro ao conectar ao SQL Server:', err.message);
            throw err; // Relança o erro para que quem chamou possa tratá-lo
        }
    }
    return pool; // Retorna o pool de conexões (já conectado ou tentando conectar)
}

pool.on('error', err => {
    // Isso captura erros que ocorrem no pool após a conexão inicial (ex: conexão perdida)
    console.error('Erro no pool de conexão:', err);
    isConnected = false; // Define a flag como false para tentar reconectar na próxima vez
});

module.exports = {
    getConnection, // Exporta a nova função para obter a conexão
    sql // Exporta o objeto sql para usar tipos de dados, etc.
};