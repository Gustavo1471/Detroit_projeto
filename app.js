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

// Rota para Visualizar Pedidos do Cliente (GET) - RF03
// URL: /api/pedidos/cliente/:idUsuario
app.get('/api/pedidos/cliente/:idUsuario', async (req, res) => {
    const { idUsuario } = req.params;

    if (!idUsuario) {
        return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
    }

    try {
        const pool = await getConnection(); 
        const query = `
            SELECT
                p.idPedido,
                p.dataPedido,
                p.statusPedido,
                p.valorTotal,
                ip.quantidade,
                ip.precoUnitario,
                prod.idProduto,
                prod.nomeProduto,
                prod.descricao,
                
                av.idAvaliacao 
                
            FROM DetroitSQL.dbo.Pedidos p
            INNER JOIN DetroitSQL.dbo.ItensPedido ip ON p.idPedido = ip.idPedido
            INNER JOIN DetroitSQL.dbo.Produtos prod ON ip.idProduto = prod.idProduto
            
            -- LEFT JOIN para checar a tabela Avaliacoes

            LEFT JOIN DetroitSQL.dbo.Avaliacoes av 
                ON av.idProduto = prod.idProduto 
                AND av.idUsuarioCliente = p.idUsuarioCliente 
            
            WHERE p.idUsuarioCliente = @idUsuario
            ORDER BY p.dataPedido DESC;
        `;

        const result = await pool.request()
            .input('idUsuario', sql.Int, idUsuario) 
            .query(query);

        if (result.recordset.length > 0) {
            res.status(200).json(result.recordset);
        } else {
            res.status(404).json({ message: 'Nenhum pedido encontrado para este usuário.' });
        }

    } catch (err) {
        console.error('Erro ao buscar pedidos do cliente:', err);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar pedidos.' });
    }
});


// Rota para o Dashboard de Resumo do Cliente (GET)
// URL: /api/resumo/cliente/:idUsuario
app.get('/api/resumo/cliente/:idUsuario', async (req, res) => {
    const { idUsuario } = req.params;

    if (!idUsuario) {
        return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
    }

    try {
        const pool = await getConnection();

        // 1. Consulta dos Últimos 3 Pedidos
        const pedidosQuery = `
            SELECT TOP 3
                p.idPedido,
                p.dataPedido,
                p.valorTotal,
                p.statusPedido,
                prod.nomeProduto
            FROM DetroitSQL.dbo.Pedidos p
            INNER JOIN DetroitSQL.dbo.ItensPedido ip ON p.idPedido = ip.idPedido
            INNER JOIN DetroitSQL.dbo.Produtos prod ON ip.idProduto = prod.idProduto
            WHERE p.idUsuarioCliente = @idUsuario
            ORDER BY p.dataPedido DESC;
        `;
        const pedidosResult = await pool.request()
            .input('idUsuario', sql.Int, idUsuario)
            .query(pedidosQuery);

        // 2. Consulta dos Últimos 3 Cupons e Total
        const cuponsQuery = `
            SELECT TOP 3 idCupom, codigoCupom, desconto, dataGeracao, usado
            FROM DetroitSQL.dbo.Cupons
            WHERE idUsuarioCliente = @idUsuario
            ORDER BY dataGeracao DESC;
            
            SELECT COUNT(idCupom) AS TotalCupons
            FROM DetroitSQL.dbo.Cupons
            WHERE idUsuarioCliente = @idUsuario;
        `;
        const cuponsResult = await pool.request()
            .input('idUsuario', sql.Int, idUsuario)
            .query(cuponsQuery);

        // Retorna um objeto de resumo com as duas listas (cupons vêm no segundo recordset)
        res.status(200).json({
            pedidos: pedidosResult.recordset,
            cupons: cuponsResult.recordsets[0],
            totalCupons: cuponsResult.recordsets[1][0].TotalCupons
        });

    } catch (err) {
        console.error('Erro ao buscar resumo do cliente:', err);
        return res.status(500).json({ message: 'Erro interno do servidor ao buscar resumo.' });
    }
});


// Rota de Avaliação (POST) - RF04
app.post('/api/avaliar', async (req, res) => {
    const { idUsuarioCliente, idProduto, nota, comentario } = req.body;

    if (!idUsuarioCliente || !idProduto || !nota) {
        return res.status(400).json({ message: 'Dados de avaliação incompletos.' });
    }

    try {
        const pool = await getConnection();

        // 1. Prevenção de Reavaliação no Back-end (Heurística 5)
        const checkQuery = `
            SELECT idAvaliacao FROM DetroitSQL.dbo.Avaliacoes
            WHERE idUsuarioCliente = @idUsuarioCliente AND idProduto = @idProduto;
        `;
        const checkResult = await pool.request()
            .input('idUsuarioCliente', sql.Int, idUsuarioCliente)
            .input('idProduto', sql.Int, idProduto)
            .query(checkQuery);

        if (checkResult.recordset.length > 0) {
            // Se já avaliou, retorna imediatamente.
            return res.status(409).json({ message: 'Este produto já foi avaliado por você.' });
        }


        // 2. Inserção da Avaliação
        const insertQuery = `
            INSERT INTO DetroitSQL.dbo.Avaliacoes (idUsuarioCliente, idProduto, nota, comentario)
            VALUES (@idUsuarioCliente, @idProduto, @nota, @comentario);
        `;
        
        await pool.request()
            .input('idUsuarioCliente', sql.Int, idUsuarioCliente)
            .input('idProduto', sql.Int, idProduto)
            .input('nota', sql.Int, nota)
            .input('comentario', sql.NVarChar(sql.MAX), comentario)
            .query(insertQuery);
            
        
        // 3. 🚨 LÓGICA DE RECOMPENSA (UC08)
        // Chama a função para verificar se o cliente atingiu a meta de cupom.
        const recompensa = await verificarRecompensa(idUsuarioCliente, pool);

        // 4. Retorno FINAL de Sucesso (apenas uma vez)
        return res.status(201).json({ 
            message: 'Avaliação registrada com sucesso.',
            recompensaConcedida: recompensa.concedida, 
            codigoCupom: recompensa.codigo 
        });

    } catch (err) {
        console.error('Erro ao registrar avaliação:', err);
        // Retorno de ERRO
        return res.status(500).json({ message: 'Erro interno ao tentar salvar a avaliação.' });
    }
});
// Função auxiliar para gerar um código de cupom único
function gerarCodigoCupom(idUsuario) {
    const timestamp = Date.now().toString(36).toUpperCase();
    return `DETROIT-${idUsuario}-${timestamp}`;
}

// Lógica de Negócio: Verifica se o cliente atingiu a meta de cupons (UC08)
async function verificarRecompensa(idUsuarioCliente, pool) {
    // 1. Contar o total de avaliações feitas pelo cliente
    const countQuery = `
        SELECT COUNT(idAvaliacao) AS TotalAvaliacoes
        FROM DetroitSQL.dbo.Avaliacoes
        WHERE idUsuarioCliente = @idUsuarioCliente;
    `;
    const countResult = await pool.request()
        .input('idUsuarioCliente', sql.Int, idUsuarioCliente)
        .query(countQuery);

    const totalAvaliacoes = countResult.recordset[0].TotalAvaliacoes;
    
    // 2. Contar quantos cupons de 10% OFF o cliente JÁ possui
    const cuponsQuery = `
        SELECT COUNT(idCupom) AS TotalCupons
        FROM DetroitSQL.dbo.Cupons
        WHERE idUsuarioCliente = @idUsuarioCliente AND desconto = 0.10;
    `;
    const cuponsResult = await pool.request()
        .input('idUsuarioCliente', sql.Int, idUsuarioCliente)
        .query(cuponsQuery);
    
    const totalCuponsGerados = cuponsResult.recordset[0].TotalCupons;

    // 3. Critério de Recompensa: (Total de Avaliações >= 3) E (Deve ser um novo múltiplo de 3)
    const proximaMetaAvaliacoes = (totalCuponsGerados + 1) * 3;
    
    let recompensaConcedida = false;
    let novoCodigoCupom = null;
    
    if (totalAvaliacoes >= proximaMetaAvaliacoes) {
        // Atingiu uma nova meta (3, 6, 9, etc.) -> Gerar Cupom
        novoCodigoCupom = gerarCodigoCupom(idUsuarioCliente);
        
        const insertCupomQuery = `
            INSERT INTO DetroitSQL.dbo.Cupons (idUsuarioCliente, codigoCupom, desconto)
            VALUES (@idUsuarioCliente, @codigoCupom, @desconto);
        `;
        
        await pool.request()
            .input('idUsuarioCliente', sql.Int, idUsuarioCliente)
            .input('codigoCupom', sql.NVarChar(50), novoCodigoCupom)
            .input('desconto', sql.Decimal(5, 2), 0.10)
            .query(insertCupomQuery);
            
        recompensaConcedida = true;
    }
    
    // Retorna se a recompensa foi concedida e o código (para a notificação no Front-end)
    return {
        concedida: recompensaConcedida,
        codigo: novoCodigoCupom,
        avaliacoesAtuais: totalAvaliacoes
    };
}

// Rota para Visualizar TODOS os Pedidos (Admin/Loja) - Gestão
// URL: /api/pedidos/admin
app.get('/api/pedidos/admin', async (req, res) => {
try {
        const pool = await getConnection(); 
        const query = `
            SELECT
                p.idPedido,
                p.dataPedido,
                p.statusPedido,
                p.valorTotal,
                u.nome AS nomeCliente, 
                u.email AS emailCliente
            FROM dbo.Pedidos p 
            INNER JOIN dbo.Usuarios u ON p.idUsuarioCliente = u.idUsuario 
            ORDER BY p.dataPedido DESC;
        `;

        const result = await pool.request().query(query);

        if (result.recordset.length > 0) {
            res.status(200).json(result.recordset);
        } else {
            res.status(404).json({ message: 'Nenhum pedido encontrado na base de dados.' });
        }

    } catch (err) {
        console.error('Erro ao buscar todos os pedidos (Admin):', err);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar todos os pedidos.' });
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