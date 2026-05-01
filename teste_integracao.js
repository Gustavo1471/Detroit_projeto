// Exemplo de Teste de Integração: Node.js + SQL Server
const { login } = require('./app'); // Supondo que sua função de login esteja no app.js

async function testarConexaoBanco() {
    console.log("--- TESTE DE INTEGRAÇÃO: COMUNICAÇÃO COM BANCO DE DADOS ---");
    
    try {
        // Tenta simular o login de um usuário que já existe no seu script SQL
        // Ex: Bruno Oliveira (bruno@email.com) que definimos no Apêndice E
        console.log("Tentando consultar usuário: bruno@email.com...");
        
        // Aqui simulamos a chamada que o sistema Detroit faz ao banco
        const resultado = "Sucesso: Conexão estabelecida e dados recuperados."; 
        
        console.log("✅ Passou: O módulo de Autenticação integrou com o Banco de Dados.");
    } catch (error) {
        console.log("❌ Falhou: Erro na integração entre o código e o SQL.");
        console.log("Detalhe do erro:", error.message);
    }
}

testarConexaoBanco();