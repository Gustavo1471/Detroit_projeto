const express = require('express');
const router = express.Router();

const { listarDevolucoesCliente, criarNovaDevolucao, listarProdutos, verRespostaDevolucao } = require('../controllers/clienteController');


// Buscar devoluções do cliente
router.get('/devolucoes/:idCliente', listarDevolucoesCliente);

// Criar nova solicitação de devolução
router.post('/nova-devolucao', criarNovaDevolucao);

router.get('/produtos', listarProdutos);

router.get('/devolucao/:id/resposta', verRespostaDevolucao);

router.get('/devolucao/:id/resposta', verRespostaDevolucao);



module.exports = router;