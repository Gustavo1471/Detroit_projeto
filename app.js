const express = require('express'); // Importa o framework Express para criar o servidor
const path = require('path');     // Módulo para lidar com caminhos de arquivos
const { getConnection, sql } = require('./src/database/db'); // Importa a função de conexão e o objeto sql do seu db.js
require('dotenv').config();       // Carrega as variáveis de ambiente do seu .env

const app = express(); // Cria uma instância do aplicativo Express
const port = process.env.PORT || 3000; // Define a porta do servidor, lendo do .env ou usando 3000 como padrão

// Middleware para processar requisições JSON
// Isso permite que o Express entenda dados enviados em formato JSON no corpo das requisições (como no login e cadastro)
app.use(express.json());

// Middleware para servir arquivos estáticos
// Isso faz com que a pasta 'public' (onde estão seus HTML, CSS, JS do frontend) seja acessível diretamente pelo navegador
app.use(express.static(path.join(__dirname, 'public')));

// =========================================================================================================
// ROTAS DA API
// =========================================================================================================

// Rota de Login (POST)
// URL: /api/login
// Recebe email e senha no corpo da requisição, usa Stored Procedure para autenticar
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body; // Extrai email e senha do corpo da requisição

    if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
        const pool = await getConnection(); // Obtém uma conexão do pool
        // Chama a Stored Procedure spLoginUsuario, passando os parâmetros
        const result = await pool.request()
            .input('email', sql.NVarChar(100), email) // Parâmetro @email da SP
            .input('senha', sql.NVarChar(100), senha) // Parâmetro @senha da SP
            .execute('spLoginUsuario'); // Executa a Stored Procedure

        // Verifica se a Stored Procedure retornou algum registro (usuário encontrado)
        if (result.recordset.length > 0) {
            const usuario = result.recordset[0]; // Pega o primeiro registro encontrado
            res.status(200).json({ // Retorna sucesso
                message: 'Login bem-sucedido!',
                idUsuario: usuario.idUsuario,
                nome: usuario.nome,
                email: usuario.email,
                tipoUsuario: usuario.tipoUsuario
            });
        } else {
            // Nenhum usuário encontrado com as credenciais fornecidas
            res.status(401).json({ message: 'E-mail ou senha incorretos.' });
        }
    } catch (err) {
        console.error('Erro no login:', err);
        // Erro interno do servidor (ex: problema de conexão com BD)
        res.status(500).json({ message: 'Erro interno do servidor ao tentar fazer login.' });
    }
});

// Rota de Cadastro (POST)
// URL: /api/cadastro
// Recebe nome, email, senha e tipoUsuario no corpo da requisição, insere no banco
app.post('/api/cadastro', async (req, res) => {
    const { nome, email, senha, tipoUsuario } = req.body; // Extrai dados do corpo da requisição

    if (!nome || !email || !senha || !tipoUsuario) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios para o cadastro.' });
    }
    // Em um cenário real, tipoUsuario deveria ser validado com mais cuidado no backend

    try {
        const pool = await getConnection(); // Obtém uma conexão do pool
        // Query SQL para inserir um novo usuário
        const result = await pool.request()
            .input('nome', sql.NVarChar(100), nome)
            .input('email', sql.NVarChar(100), email)
            .input('senha', sql.NVarChar(100), senha)
            .input('tipoUsuario', sql.VarChar(20), tipoUsuario)
            .query(`INSERT INTO Usuarios (nome, email, senha, tipoUsuario)
                    VALUES (@nome, @email, @senha, @tipoUsuario);
                    SELECT idUsuario, nome, email, tipoUsuario FROM Usuarios WHERE email = @email;`); // Retorna o usuário cadastrado

        if (result.recordset.length > 0) {
            // Cadastro bem-sucedido
            res.status(201).json({
                message: 'Cadastro realizado com sucesso!',
                usuario: result.recordset[0]
            });
        } else {
            // Este caso geralmente não ocorre se a inserção for bem-sucedida
            res.status(500).json({ message: 'Erro ao cadastrar usuário: nenhum registro retornado.' });
        }
    } catch (err) {
        console.error('Erro no cadastro:', err);
        // Verifica se o erro é por e-mail já cadastrado (UNIQUE KEY constraint)
        if (err.message.includes('UNIQUE KEY constraint') || err.message.includes('duplicate key')) {
            res.status(409).json({ message: 'Este e-mail já está cadastrado. Por favor, use outro.' });
        } else {
            // Outro erro interno do servidor
            res.status(500).json({ message: 'Erro interno do servidor ao tentar cadastrar.' });
        }
    }
});

// Rota para Consulta de Produtos (GET)
// URL: /api/produtos
// Retorna todos os produtos cadastrados
app.get('/api/produtos', async (req, res) => {
    try {
        const pool = await getConnection(); // Obtém uma conexão do pool
        // Query SQL para selecionar todos os produtos
        const result = await pool.request().query('SELECT idProduto, nomeProduto, descricao, preco, categoria FROM Produtos');
        // Retorna os produtos como JSON
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Erro ao consultar produtos:', err);
        // Erro interno do servidor
        res.status(500).json({ message: 'Erro interno do servidor ao buscar produtos para consulta.' });
    }
});

// Rota padrão para servir o login.html
// Ao acessar http://localhost:3000/, ele vai redirecionar para a tela de login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

// =========================================================================================================
// INICIALIZAÇÃO DO SERVIDOR
// =========================================================================================================

// Inicia o servidor Express na porta definida (3000 por padrão)
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`Acesse: http://localhost:${port}/html/login.html`);
});