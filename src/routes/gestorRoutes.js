const express = require('express');
const router = express.Router();
const { listarTodasDevolucoes, responderDevolucao, listarItensDevolucao } = require('../controllers/gestorController');

// Listar todas as devoluções
router.get('/devolucoes', listarTodasDevolucoes);

// Responder uma devolução
router.post('/responder', responderDevolucao);

router.get('/devolucoes/:id/itens', listarItensDevolucao);


module.exports = router;