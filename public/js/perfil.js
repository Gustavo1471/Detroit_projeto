// Função global para o Menu Lateral[cite: 7]
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

// Função para Editar Campos de Texto[cite: 7]
window.editarCampo = function(idElemento, chaveSession) {
    const elemento = document.getElementById(idElemento);
    const novoValor = prompt(`Digite o novo valor:`, elemento.textContent);

    if (novoValor !== null && novoValor.trim() !== "") {
        elemento.textContent = novoValor;
        sessionStorage.setItem(chaveSession, novoValor);
        
        if (chaveSession === 'nomeUsuario') {
            document.getElementById('nomeUsuarioLogado').innerHTML = `Olá, <strong>${novoValor}</strong>!`;
        }
    }
};

// Função para Upload e Persistência da Foto[cite: 7]
window.uploadFoto = function(input) {
    if (input.files && input.files[0]) {
        const leitor = new FileReader();
        leitor.onload = function(e) {
            const base64Image = e.target.result;
            document.getElementById('fotoPerfilExibicao').src = base64Image;
            localStorage.setItem('fotoPerfilUsuario', base64Image); // Salva permanentemente
            alert("Foto de perfil atualizada!");
        };
        leitor.readAsDataURL(input.files[0]);
    }
};

window.logout = function() {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = 'login.html';
};

document.addEventListener("DOMContentLoaded", () => {
    // Carrega dados da sessão[cite: 7]
    const nome = sessionStorage.getItem('nomeUsuario') || 'Usuário';
    const email = sessionStorage.getItem('emailUsuario') || 'Não informado';
    const fotoSalva = localStorage.getItem('fotoPerfilUsuario');
    
    // Atualiza Interface
    if (fotoSalva) document.getElementById('fotoPerfilExibicao').src = fotoSalva;
    document.getElementById('nomeUsuarioLogado').innerHTML = `Olá, <strong>${nome}</strong>!`;
    document.getElementById('perfilNome').textContent = nome;
    document.getElementById('perfilEmail').textContent = email;
    document.getElementById('perfilUsuario').textContent = sessionStorage.getItem('userTag') || `@${nome.toLowerCase().replace(/\s/g, '')}`;
    document.getElementById('perfilEndereco').textContent = sessionStorage.getItem('enderecoUsuario') || 'Não informado';
    document.getElementById('perfilCEP').textContent = sessionStorage.getItem('cepUsuario') || '00000-000';
});