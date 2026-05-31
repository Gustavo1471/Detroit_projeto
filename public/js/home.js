document.addEventListener("DOMContentLoaded", () => {
    // 1. Pega o ID e o nome do usuário salvos pelo login
    const idUsuario = sessionStorage.getItem("idUsuario") || 1; // Padrão 1 caso perca a sessão em testes
    const nomeUsuario = sessionStorage.getItem("nomeUsuario");
    const saudacaoElement = document.getElementById("nomeUsuarioLogado");
    
    if (nomeUsuario && saudacaoElement) {
        saudacaoElement.textContent = `Olá, ${nomeUsuario}!`;
    }

    // [ADICIONADO] 2. Dispara a busca dos cupons na API para renderizar acima da pesquisa
    carregarCuponsHome(idUsuario);

    // 3. Injeta dinamicamente a janela do Chatbot no fim da página (Mantido intacto)
    const chatbotHTML = `
        <div class="suporte-balao-flutuante" onclick="abrirChatbot()">
            <i class="fas fa-headset"></i>
        </div>

        <div id="janelaDetroitBot" class="chatbot-janela">
            <div class="chatbot-header">
                <span><i class="fas fa-robot"></i> Suporte Detroit</span>
                <i class="fas fa-times-circle" onclick="fecharChatbot()"></i>
            </div>
            <div id="corpoMensagensBot" class="chatbot-mensagens">
                <div class="msg-bala bot">Olá! Sou o assistente virtual do Grupo Detroit. Como posso te ajudar com suporte ou chamados hoje?</div>
            </div>
            <div class="chatbot-input-area">
                <input type="text" id="inputTxtBot" placeholder="Digite sua dúvida aqui..." onkeypress="checarEnvioBot(event)">
                <button onclick="enviarMensagemBot()"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
});

// ==========================================================================
// [ADICIONADO] RENDERIZAÇÃO DINÂMICA DE CUPONS ATIVOS DA API
// ==========================================================================
async function carregarCuponsHome(idUsuario) {
    const container = document.getElementById("cuponsDisponiveisContainer");
    if (!container) return;

    try {
        // Faz o fetch na rota do seu app.js
        const response = await fetch(`/api/resumo/cliente/${idUsuario}`);
        if (!response.ok) throw new Error("Erro ao buscar dados do resumo.");

        const data = await response.json();
        
        // Filtra para garantir que só exibe os cupons não utilizados (usado === false ou 0)
        const cuponsAtivos = data.cupons ? data.cupons.filter(c => !c.usado) : [];

        if (cuponsAtivos.length === 0) {
            container.innerHTML = `<span class="sem-cupons-msg">Você não possui cupons ativos. Avalie produtos para ganhar! 🎁</span>`;
            return;
        }

        container.innerHTML = ""; // Limpa a mensagem padrão

        // Desenha cada cupom ativo na tela
        cuponsAtivos.forEach(cupom => {
            const ticketHTML = `
                <div class="cupom-ticket" title="Use este código para obter 10% de desconto!">
                    <i class="fas fa-ticket-alt"></i>
                    <span>10% OFF liberado:</span>
                    <span class="cupom-codigo">${cupom.codigoCupom}</span>
                </div>
            `;
            container.innerHTML += ticketHTML;
        });

    } catch (error) {
        console.error("Erro ao buscar cupons para a Home:", error);
        container.innerHTML = `<span class="sem-cupons-msg" style="color: #ff5b5b;">Erro ao carregar seus cupons ativos.</span>`;
    }
}

// ==========================================================================
// INTERAÇÕES DO CHATBOT (Mantido intacto)
// ==========================================================================
function abrirChatbot() {
    document.getElementById("janelaDetroitBot").style.display = "flex";
}

function fecharChatbot() {
    document.getElementById("janelaDetroitBot").style.display = "none";
}

function checarEnvioBot(e) {
    if (e.key === 'Enter') enviarMensagemBot();
}

function enviarMensagemBot() {
    const input = document.getElementById("inputTxtBot");
    const container = document.getElementById("corpoMensagensBot");
    const texto = input.value.trim();

    if (!texto) return;

    container.innerHTML += `<div class="msg-bala usuario">${texto}</div>`;
    input.value = "";
    container.scrollTop = container.scrollHeight;

    setTimeout(() => {
        let respostaBot = "Hum, não entendi perfeitamente. Tente perguntar sobre 'pedido', 'chamado' ou 'perfil'.";
        const tLower = texto.toLowerCase();

        if (tLower.includes("pedido") || tLower.includes("historico") || tLower.includes("compras")) {
            respostaBot = "Para checar o andamento e avaliar os produtos das suas compras, clique em <strong>Meus Pedidos</strong> na tela inicial.";
        } else if (tLower.includes("chamado") || tLower.includes("suporte") || tLower.includes("sac")) {
            respostaBot = "Você pode gerenciar chamados de helpdesk abrindo a página de detalhes de qualquer uma das nossas <strong>Lojas Parceiras</strong>.";
        } else if (tLower.includes("perfil") || tLower.includes("conta") || tLower.includes("cadastro")) {
            respostaBot = "Quer atualizar seus dados ou alterar sua foto? Basta clicar no menu e acessar a aba de <strong>Perfil</strong>.";
        }

        container.innerHTML += `<div class="msg-bala bot">${respostaBot}</div>`;
        container.scrollTop = container.scrollHeight;
    }, 700);
}

// LÓGICA DO MENU LATERAL GLOBAL (Mantido intacto)
function toggleMenu() {
    const menu = document.getElementById("sideMenu");
    const overlay = document.getElementById("menuOverlay");
    
    if (!menu || !overlay) return;

    if (menu.style.width === "280px") {
        menu.style.width = "0px";
        overlay.style.display = "none";
    } else {
        menu.style.width = "280px";
        overlay.style.display = "block";
    }
}

function logout() {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "login.html";
}