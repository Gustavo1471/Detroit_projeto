function logout() {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = 'login.html';
}

document.addEventListener("DOMContentLoaded", function() {
    console.log("Sistema Detroit - Interface Ativa");[cite: 9]

    const nomeUsuario = sessionStorage.getItem('nomeUsuario') || 'Cliente';
    const saudacao = document.getElementById('nomeUsuarioLogado');

    if (saudacao) {
        saudacao.innerHTML = `Olá, <strong>${nomeUsuario}</strong>!`;
    }
});