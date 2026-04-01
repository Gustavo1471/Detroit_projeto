// Arquivo: public/js/historicoPedidos.js

let notaSelecionada = 0;
// Variável global para armazenar a fila de itens a serem avaliados no modal
let filaItensAvaliar = []; 
// Variável global para rastrear o ID do pedido atual
let pedidoAtualId = null; 
// Cache para armazenar os dados brutos dos pedidos carregados
let cachePedidos = new Map(); 

// ===========================================
// FUNÇÃO PRINCIPAL: CARREGAR LISTA DE PEDIDOS (RF03)
// ===========================================
async function carregarHistoricoPedidos() {
    // Busca o ID do usuário no sessionStorage (consistente com o login.js)
    const idUsuario = sessionStorage.getItem('idUsuario');
    const container = document.getElementById('listaPedidosContainer');

    if (!idUsuario) {
        container.innerHTML = '<p>Erro: ID do usuário não encontrado. Faça login novamente.</p>';
        return;
    }
    
    container.innerHTML = ''; 

    try {
        // Chamada à rota do Back-end (que agora retorna o status da avaliação)
        const response = await fetch(`/api/pedidos/cliente/${idUsuario}`);
        const data = await response.json();

        if (response.status === 404) {
            container.innerHTML = '<p>Você ainda não realizou nenhum pedido. Comece a comprar!</p>';
            return;
        }

        if (!response.ok) {
             container.innerHTML = `<p>Erro ao carregar pedidos: ${data.message || 'Falha na comunicação com o servidor.'}</p>`;
             return;
        }

        // Agrupa os itens e armazena os dados no cache
        const pedidosAgrupados = agruparItens(data);

        pedidosAgrupados.forEach(pedido => {
            const pedidoElement = document.createElement('div');
            pedidoElement.className = 'pedido-card'; 
            
            const dataFormatada = new Date(pedido.dataPedido).toLocaleDateString('pt-BR');
            
            let itensHtml = '';
            let itensPendentes = false; // Flag para determinar se o botão 'Avaliar' deve aparecer

            pedido.itens.forEach(item => {
                const statusAvaliacao = item.idAvaliacao ? 'Avaliado' : 'Pendente';
                const statusClass = item.idAvaliacao ? 'item-avaliado' : 'item-pendente';
                
                itensHtml += `
                    <li class="${statusClass}">
                        ${item.nomeProduto} (1x) - R$ ${item.precoUnitario} 
                        <span class="status-avaliacao">(${statusAvaliacao})</span>
                    </li>
                `;
                
                if (!item.idAvaliacao) {
                    itensPendentes = true; // Se há pelo menos um item sem idAvaliacao, o botão deve aparecer
                }
            });


            pedidoElement.innerHTML = `
                <div class="pedido-header">
                    <h4>Pedido #${pedido.idPedido}</h4>
                    <span class="status-badge status-${pedido.statusPedido.toLowerCase()}">${pedido.statusPedido}</span>
                </div>
                <p>Data: ${dataFormatada}</p>
                <p>Total: R$ ${pedido.valorTotal.toFixed(2)}</p>
                <p><strong>Itens:</strong></p>
                <ul>${itensHtml}</ul>
                
                ${itensPendentes ? 
                    `<button class="btn-avaliar" onclick="iniciarAvaliacaoSequencial(${pedido.idPedido})">Avaliar</button>` :
                    `<button class="btn-avaliar btn-avaliar-disabled" disabled>Avaliação Completa</button>`
                }
            `;
            
            container.appendChild(pedidoElement);
        });

    } catch (error) {
        console.error('Falha na conexão ou na busca de pedidos:', error);
        container.innerHTML = '<p>Não foi possível conectar ao servidor para buscar os pedidos.</p>';
    }
}

/**
 * Função utilitária para agrupar itens em pedidos e armazenar no cache global.
 */
function agruparItens(dados) {
    const pedidosMap = new Map();
    cachePedidos = new Map(); // Limpa o cache a cada carregamento

    dados.forEach(item => {
        if (!pedidosMap.has(item.idPedido)) {
            pedidosMap.set(item.idPedido, {
                idPedido: item.idPedido,
                dataPedido: item.dataPedido,
                statusPedido: item.statusPedido,
                valorTotal: item.valorTotal,
                itens: []
            });
        }
        
        const produtoInfo = {
            idProduto: item.idProduto,
            nomeProduto: item.nomeProduto,
            precoUnitario: item.precoUnitario,
            idAvaliacao: item.idAvaliacao // NULL se não foi avaliado
        };
        
        pedidosMap.get(item.idPedido).itens.push(produtoInfo);
        
        // Armazena o dado completo no cache para uso na avaliação sequencial
        if (!cachePedidos.has(item.idPedido)) {
            cachePedidos.set(item.idPedido, Array());
        }
        cachePedidos.get(item.idPedido).push(produtoInfo);
    });
    
    return Array.from(pedidosMap.values());
}


// ===========================================
// LÓGICA SEQUENCIAL DE AVALIAÇÃO (RF04)
// ===========================================

function iniciarAvaliacaoSequencial(idPedido) {
    pedidoAtualId = idPedido;

    // 1. Carrega todos os itens do pedido do cache que AINDA NÃO FORAM AVALIADOS
    const pedidoCompleto = cachePedidos.get(idPedido);
    filaItensAvaliar = pedidoCompleto.filter(item => !item.idAvaliacao);

    if (filaItensAvaliar.length === 0) {
        alert('Este pedido já foi totalmente avaliado!'); 
        return;
    }

    // 2. Inicia o modal com o PRIMEIRO item da fila
    carregarProximoItemAvaliar();
}

function carregarProximoItemAvaliar() {
    if (filaItensAvaliar.length === 0) {
        // Fila vazia: Avaliação sequencial completa!
        fecharModal();
        alert('✅ Avaliação de todos os itens concluída com sucesso! Atualizando o histórico...');
        window.location.reload(); // Recarrega a página para exibir os novos status "Avaliado"
        return;
    }
    
    // Pega o item atual no topo da fila
    const itemAtual = filaItensAvaliar[0];
    const totalItens = cachePedidos.get(pedidoAtualId).length;
    const itensAvaliarRestantes = filaItensAvaliar.length;
    const itensJaAvaliados = totalItens - itensAvaliarRestantes;

    // 3. Abre/Atualiza o Modal
    const modal = document.getElementById('avaliacaoModal');
    document.getElementById('idProdutoAvaliar').value = itemAtual.idProduto;
    document.getElementById('produtoModalNome').textContent = itemAtual.nomeProduto;
    
    // Atualiza o contador de itens
    document.getElementById('contadorItens').textContent = `Item ${itensJaAvaliados + 1} de ${totalItens}`;
    
    resetarEstrelas();
    document.getElementById('comentarioAvaliacao').value = '';
    notaSelecionada = 0;
    
    modal.style.display = 'block';
}

function fecharModal() {
    const modal = document.getElementById('avaliacaoModal');
    modal.style.display = 'none'; // Oculta o pop-up
}


// Função para enviar avaliação e avançar (chamada pelo submit do modal)
document.getElementById('form-avaliacao-modal').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (notaSelecionada === 0) {
        alert('Por favor, selecione uma nota (1 a 5 estrelas).');
        return;
    }
    
    const idProduto = document.getElementById('idProdutoAvaliar').value;
    const comentario = document.getElementById('comentarioAvaliacao').value;
    const idUsuarioCliente = sessionStorage.getItem('idUsuario');

    if (!idUsuarioCliente) {
        alert('Erro: ID do usuário perdido. Por favor, faça login novamente.');
        fecharModal();
        return;
    }

    const dadosAvaliacao = {
        idUsuarioCliente,
        idProduto: idProduto,
        nota: notaSelecionada,
        comentario: comentario
    };

    // 1. CHAMADA PARA A ROTA /api/avaliar
    try {
        const response = await fetch('/api/avaliar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAvaliacao)
        });

        const data = await response.json();

        if (response.ok) {
            // 2. Processamento de Sucesso: Remove o item da fila
            filaItensAvaliar.shift(); 

            if (data.recompensaConcedida) {
                alert(`🎉 PARABÉNS! VOCÊ GANHOU um cupom de 10% OFF! Use o código: ${data.codigoCupom}`);
            } else {
        
        alert('Avaliação de item enviada com sucesso!');
    }
            // 3. Verifica o próximo item (avança ou fecha)
            carregarProximoItemAvaliar();

        } else {
            alert(`Erro ao enviar avaliação: ${data.message || 'Erro desconhecido do servidor.'}`);
        }

    } catch (error) {
        console.error('Erro na submissão da avaliação:', error);
        alert('Não foi possível conectar ao servidor para enviar a avaliação.');
    }
});


// ===========================================
// LÓGICA DAS ESTRELAS (UI)
// ===========================================

function gerarEstrelas() {
    const estrelasContainer = document.getElementById('ratingStars');
    estrelasContainer.innerHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        const estrela = document.createElement('span');
        estrela.className = 'star';
        estrela.innerHTML = '&#9733;'; 
        estrela.dataset.value = i;
        
        estrela.addEventListener('click', () => selecionarNota(i));
        estrela.addEventListener('mouseover', () => destacarEstrelas(i));
        estrela.addEventListener('mouseout', () => restaurarEstrelas());
        
        estrelasContainer.appendChild(estrela);
    }
}

function selecionarNota(nota) {
    notaSelecionada = nota;
    destacarEstrelas(nota);
}

function destacarEstrelas(nota) {
    const estrelas = document.querySelectorAll('#ratingStars .star');
    estrelas.forEach((estrela, index) => {
        if (index < nota) {
            estrela.classList.add('ativo');
        } else {
            estrela.classList.remove('ativo');
        }
    });
}

function restaurarEstrelas() {
    destacarEstrelas(notaSelecionada);
}

function resetarEstrelas() {
    const estrelas = document.querySelectorAll('#ratingStars .star');
    estrelas.forEach(estrela => estrela.classList.remove('ativo'));
}


// Chamadas iniciais
window.onload = function() {
    gerarEstrelas(); 
    
    const nome = sessionStorage.getItem('nomeUsuario') || 'Cliente';
    document.getElementById('nomeUsuarioLogado').textContent = `Olá, ${nome}!`;
    
    carregarHistoricoPedidos();
};