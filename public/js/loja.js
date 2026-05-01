// Funções globais para o Menu Lateral
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

document.addEventListener("DOMContentLoaded", () => {
    // Atualiza a saudação com o nome do usuário
    const nome = sessionStorage.getItem('nomeUsuario') || 'Tiger';
    const saudacao = document.getElementById('nomeUsuarioLogado');
    if (saudacao) {
        saudacao.innerHTML = `Olá, <strong>${nome}</strong>!`;
    }
});