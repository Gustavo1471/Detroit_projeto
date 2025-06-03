const { pool } = require('../database/db');


const sql = require('mssql');


async function listarTodasDevolucoes(req, res) {
    console.log('➡️ Rota /api/gestor/devolucoes acessada');
    try {
        const result = await pool.request().query(`
            SELECT d.idDevolucao, u.nome AS nomeCliente, d.dataSolicitacao, d.status
            FROM Devolucoes d
            JOIN Usuarios u ON u.idUsuario = d.idUsuarioCliente
            ORDER BY d.dataSolicitacao DESC
        `);

        console.log('✅ Devoluções retornadas:', result.recordset.length);
        res.json(result.recordset);
    } catch (err) {
        console.error('❌ Erro ao listar todas as devoluções:', err);
        res.status(500).send('Erro ao buscar devoluções');
    }
}




async function responderDevolucao(req, res) {
    const { idDevolucao, idGestor, mensagemResposta } = req.body;

    if (!idDevolucao || !idGestor || !mensagemResposta) {
        return res.status(400).send('Dados incompletos.');
    }

    try {
        await pool.request()
            .input('idDevolucao', sql.Int, idDevolucao)
            .input('idGestor', sql.Int, idGestor)
            .input('mensagemResposta', sql.NVarChar, mensagemResposta)
            .query(`
                UPDATE Devolucoes
                SET idUsuarioGestor = @idGestor,
                    mensagemResposta = @mensagemResposta,
                    dataResposta = GETDATE(),
                    status = 'Respondido'
                WHERE idDevolucao = @idDevolucao
            `);

        res.json({ sucesso: true });
    } catch (err) {
        console.error('Erro ao responder devolução:', err);
        res.status(500).send('Erro ao responder devolução');
    }
}

async function listarItensDevolucao(req, res) {
    const { id } = req.params;

    try {
        const result = await pool.request()
            .input('idDevolucao', sql.Int, id)
            .query(`
                SELECT p.nomeProduto, i.quantidade, i.motivo
                FROM ItensDevolucao i
                JOIN Produtos p ON p.idProduto = i.idProduto
                WHERE i.idDevolucao = @idDevolucao
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Erro ao buscar itens da devolução:', err);
        res.status(500).send('Erro ao buscar itens da devolução');
    }
}


module.exports = {
    listarTodasDevolucoes,
    responderDevolucao,
    listarItensDevolucao
};