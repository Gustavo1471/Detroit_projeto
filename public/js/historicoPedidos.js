let notaSelecionada = 0;
let filaItensAvaliar = [];
let cachePedidos = new Map();
let pedidoAtualId = null;

// Função global para o Menu Lateral
window.toggleMenu = function() {
    const menu = document.getElementById("sideMenu");
    const overlay = document.getElementById("menuOverlay");

    if (menu.style.width === "280px") {
        menu.style.width = "0px";
        overlay.style.display = "none";
    } else {
        menu.style.width = "280px";
        overlay.style.display = "block";
    }
};

window.logout = function() {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = 'login.html';
};

async function carregarHistoricoPedidos() {
    const idUsuario = sessionStorage.getItem('idUsuario');
    const container = document.getElementById('listaPedidosContainer');
    if (!idUsuario) return;

    try {
        const response = await fetch(`/api/pedidos/cliente/${idUsuario}`);
        const data = await response.json();
        if (!response.ok || data.length === 0) {
            container.innerHTML = '<p>Nenhum pedido encontrado.</p>';
            return;
        }

        container.innerHTML = '';
        const pedidosAgrupados = agruparItens(data);
        pedidosAgrupados.forEach(pedido => {
            pedido.itens.forEach(item => {
                const card = document.createElement('div');
                card.className = 'pedido-card';
                card.innerHTML = `
                    <div class="produto-img">
                        <img src="../html/img/produto_${item.idProduto}.png" onerror="this.src='../html/img/box.png'">
                    </div>
                    <div class="pedido-info">
                        <span class="pedido-numero">Pedido #${pedido.idPedido}</span>
                        <h3>${item.nomeProduto}</h3>
                        <p class="produto-valor">Valor: <strong>R$ ${item.precoUnitario.toFixed(2)}</strong></p>
                    </div>
                    ${!item.idAvaliacao ? 
                        `<button class="btn-enviar-av" onclick="iniciarAvaliacaoSequencial(${pedido.idPedido})">Avaliar</button>` :
                        `<div class="rating-badge"><span class="nota">Avaliado</span><i class="fas fa-check"></i></div>`
                    }
                `;
                container.appendChild(card);
            });
        });
    } catch (error) {
        container.innerHTML = '<p>Erro ao conectar com o servidor.</p>';
    }
}

function agruparItens(dados) {
    const pedidosMap = new Map();
    dados.forEach(item => {
        if (!pedidosMap.has(item.idPedido)) {
            pedidosMap.set(item.idPedido, { idPedido: item.idPedido, itens: [] });
        }
        pedidosMap.get(item.idPedido).itens.push(item);
        if (!cachePedidos.has(item.idPedido)) cachePedidos.set(item.idPedido, []);
        cachePedidos.get(item.idPedido).push(item);
    });
    return Array.from(pedidosMap.values());
}

function gerarEstrelas() {
    const container = document.getElementById('ratingStars');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const s = document.createElement('span');
        s.className = 'star'; s.innerHTML = '&#9733;';
        s.onclick = () => { notaSelecionada = i; destacarEstrelas(i); };
        container.appendChild(s);
    }
}

function destacarEstrelas(n) {
    document.querySelectorAll('.star').forEach((s, i) => s.classList.toggle('ativo', i < n));
}

function fecharModal() { document.getElementById('avaliacaoModal').style.display = 'none'; }

window.onload = () => {
    gerarEstrelas();
    const nome = sessionStorage.getItem('nomeUsuario') || 'Tiger';
    document.getElementById('nomeUsuarioLogado').innerHTML = `Olá, <strong>${nome}</strong>!`;
    carregarHistoricoPedidos();
};