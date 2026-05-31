document.addEventListener("DOMContentLoaded", () => {
    // 1. Alimenta o header global (saudação)
    const nomeUsuario = sessionStorage.getItem("nomeUsuario");
    const saudacaoElement = document.getElementById("nomeUsuarioLogado");
    
    if (nomeUsuario && saudacaoElement) {
        saudacaoElement.textContent = `Olá, ${nomeUsuario}!`;
    }

    // 2. Alimenta os campos internos do Perfil usando os dados da sessão
    const perfilNome = document.getElementById("perfilNome");
    const perfilUsuario = document.getElementById("perfilUsuario");
    const perfilEmail = document.getElementById("perfilEmail");

    if (perfilNome && nomeUsuario) {
        perfilNome.textContent = nomeUsuario;
    }
    
    if (perfilEmail) {
        const emailSalvo = sessionStorage.getItem("emailUsuario") || "cliente@detroit.com";
        perfilEmail.textContent = emailSalvo;
    }

    if (perfilUsuario && nomeUsuario) {
        perfilUsuario.textContent = `@${nomeUsuario.toLowerCase().replace(/\s+/g, '')}`;
    }

    // 3. Tenta carregar uma foto de perfil salva anteriormente na sessão (opcional)
    const fotoSalva = localStorage.getItem("fotoPerfilBase64");
    if (fotoSalva) {
        document.getElementById("fotoPerfilExibicao").src = fotoSalva;
    }
});

// 📸 FUNÇÃO PARA FAZER O UPLOAD DA FOTO APARECER NA TELA IMEDIATAMENTE
function uploadFoto(input) {
    if (input.files && input.files[0]) {
        const leitor = new FileReader();
        
        leitor.onload = function(e) {
            // Altera o atributo src da imagem na tela para a imagem carregada
            document.getElementById("fotoPerfilExibicao").src = e.target.result;
            
            // Opcional: Salva a imagem na memória do navegador para não sumir ao dar F5
            localStorage.setItem("fotoPerfilBase64", e.target.result);
        };
        
        // Lê o arquivo de imagem local do usuário
        leitor.readAsDataURL(input.files[0]);
    }
}

// Controla o menu lateral
function toggleMenu() {
    const menu = document.getElementById("sideMenu");
    const overlay = document.getElementById("menuOverlay");
    
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
    localStorage.removeItem("fotoPerfilBase64"); // Limpa a foto no logout
    window.location.href = "login.html";
}

function editarCampo(idCampo, chaveSession) {
    alert(`Função para alterar o campo habilitada! Integração com UPDATE do banco.`);
}