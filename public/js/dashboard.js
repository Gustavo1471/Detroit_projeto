// Arquivo: public/js/dashboard.js

async function carregarDashboardResumo() {
    const idUsuario = sessionStorage.getItem('idUsuario');
    const pedidosContainer = document.getElementById('pedidosResumoContainer');
    const cuponsContainer = document.getElementById('cuponsResumoContainer');

    if (!idUsuario) {
        pedidosContainer.innerHTML = '<p>Erro: ID do usuário não encontrado. Faça login novamente.</p>';
        return;
    }
    
    pedidosContainer.innerHTML = '';
    cuponsContainer.innerHTML = '';

    try {
        // Chamada à nova rota do Back-end
        const response = await fetch(`/api/resumo/cliente/${idUsuario}`);
        const data = await response.json();

        if (!response.ok) {
             pedidosContainer.innerHTML = `<p>Erro ao carregar resumo: ${data.message || 'Falha na comunicação com o servidor.'}</p>`;
             return;
        }

        // 1. Renderizar Pedidos
        if (data.pedidos && data.pedidos.length > 0) {
            data.pedidos.forEach(pedido => {
                const card = criarCardPedido(pedido);
                pedidosContainer.appendChild(card);
            });
        } else {
            pedidosContainer.innerHTML = '<p>Você ainda não fez pedidos. Comece a comprar!</p>';
        }
        
        // 2. Renderizar Cupons e Total
        document.getElementById('totalCuponsDisp').textContent = data.totalCupons;

        if (data.cupons && data.cupons.length > 0) {
            data.cupons.forEach(cupom => {
                const card = criarCardCupom(cupom);
                cuponsContainer.appendChild(card);
            });
        } else {
            cuponsContainer.innerHTML = '<p>Nenhum cupom gerado ou disponível no momento.</p>';
        }


    } catch (error) {
        console.error('Falha ao buscar resumo:', error);
        pedidosContainer.innerHTML = '<p>Não foi possível conectar ao servidor.</p>';
    }
}

// Função para criar o Card de Pedido
function criarCardPedido(pedido) {
    const card = document.createElement('div');
    card.className = 'card pedido-resumo-card';
    const dataFormatada = new Date(pedido.dataPedido).toLocaleDateString('pt-BR');
    
    card.innerHTML = `
        <h4 class="card-title">Pedido #${pedido.idPedido}</h4>
        <p>Data: ${dataFormatada}</p>
        <p>Total: R$ ${pedido.valorTotal.toFixed(2)}</p>
        <span class="status-badge status-${pedido.statusPedido.toLowerCase()}">${pedido.statusPedido}</span>
        <button onclick="window.location.href='historico_pedidos.html'">Ver Detalhes</button>
    `;
    return card;
}

// Função para criar o Card de Cupom
function criarCardCupom(cupom) {
    const card = document.createElement('div');
    card.className = `card cupom-resumo-card ${cupom.usado ? 'cupom-usado' : 'cupom-disponivel'}`;
    
    card.innerHTML = `
        <h4 class="card-title">Cupom: ${cupom.desconto * 100}% OFF</h4>
        <p class="cupom-codigo">${cupom.codigoCupom}</p>
        <p class="cupom-status">${cupom.usado ? 'USADO' : 'DISPONÍVEL'}</p>
    `;
    return card;
}