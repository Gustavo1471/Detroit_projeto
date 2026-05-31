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
                        `<button class="btn-enviar-av" onclick="iniciarAvaliacaoSequencial(${pedido.idPedido}, ${item.idProduto})">Avaliar</button>` :
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

// Modificado para receber também o idProduto correto do card clicado
window.iniciarAvaliacaoSequencial = function(idPedido, idProduto) {
    pedidoAtualId = idPedido;
    
    const itens = cachePedidos.get(idPedido);
    if (itens && itens.length > 0) {
        // Encontra o produto específico dentro do pedido mapeado
        const itemSelecionado = itens.find(i => i.idProduto === idProduto);
        
        if (itemSelecionado) {
            document.getElementById("produtoModalNome").textContent = itemSelecionado.nomeProduto;
            document.getElementById("idProdutoAvaliar").value = itemSelecionado.idProduto;
        }
    }

    // Reseta o estado das estrelas e comentário
    notaSelecionada = 0;
    destacarEstrelas(0);
    document.getElementById("comentarioAvaliacao").value = "";

    // Exibe o modal centralizado na tela
    document.getElementById("avaliacaoModal").style.display = "flex";
};

// ====================================================================================
// 🚀 TRECHO SUBSTUIÍDO: ENVIO REAL PARA A API DO BACKEND COM VERIFICAÇÃO DE VOUCHER
// ====================================================================================
document.getElementById("form-avaliacao-modal")?.addEventListener("submit", async function(e) {
    e.preventDefault();

    const idUsuarioCliente = sessionStorage.getItem('idUsuario') || 1;
    const idProduto = document.getElementById("idProdutoAvaliar").value;
    const comentario = document.getElementById("comentarioAvaliacao").value.trim();
    
    if (notaSelecionada === 0) {
        alert("Por favor, selecione uma nota em estrelas antes de enviar!");
        return;
    }

    try {
        // Envia os dados para a rota do app.js
        const response = await fetch('/api/avaliar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idUsuarioCliente: parseInt(idUsuarioCliente),
                idProduto: parseInt(idProduto),
                nota: notaSelecionada,
                comentario: comentario
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Verifica se a lógica do UC08 gerou o cupom (múltiplo de 3)
            if (data.recompensaConcedida) {
                alert(`🎉 PARABÉNS! Você atingiu sua meta de avaliações!\n\nSeu Voucher de 10% OFF: ${data.codigoCupom || data.codigo}`);
            } else {
                alert("Avaliação registrada com sucesso! Obrigado pelo seu feedback.");
            }

            fecharModal();
            window.location.reload(); // Recarrega a página para atualizar os botões para "Avaliado"

        } else {
            alert(`Aviso: ${data.message || 'Erro ao registrar a avaliação.'}`);
            fecharModal();
        }

    } catch (error) {
        console.error("Erro ao conectar com a API de avaliação:", error);
        alert("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
        fecharModal();
    }
});