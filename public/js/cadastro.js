document.getElementById("cadastroForm").addEventListener("submit", async function(e) {
    e.preventDefault(); // Impede o comportamento padrão de recarregar a página ao enviar o formulário

    // Pega os valores dos campos do formulário
    // Certifique-se de que seus campos no cadastro.html tenham os IDs "nome", "email", "senha" e "confirmarSenha"
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;

    // Validação simples: verifica se as senhas coincidem
    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem! Por favor, digite senhas iguais.');
        return; // Interrompe a execução da função
    }

    try {
        // Faz uma requisição POST para a rota /api/cadastro no seu backend
        const response = await fetch('/api/cadastro', {
            method: 'POST', // Método HTTP POST
            headers: {
                'Content-Type': 'application/json' // Informa que o corpo da requisição é JSON
            },
            // Converte os dados para JSON e envia no corpo.
            // O tipoUsuario é 'cliente' por padrão para cadastros de novos usuários.
            body: JSON.stringify({ nome, email, senha, tipoUsuario: 'cliente' })
        });

        const data = await response.json(); // Pega a resposta do servidor (que será um JSON)

        if (response.ok) { // Se a resposta HTTP for de sucesso (status 200-299)
            alert(data.message + ' Redirecionando para a tela de login...');
            window.location.href = '/html/login.html'; // Redireciona para a tela de login após o cadastro
        } else {
            // Se a resposta não for sucesso (ex: 409 Conflict - e-mail já existe, 400 Bad Request)
            alert('Erro no cadastro: ' + (data.message || 'Não foi possível realizar o cadastro. Tente novamente.'));
        }
    } catch (error) {
        console.error('Erro ao conectar ou processar cadastro:', error);
        alert('Erro ao conectar ao servidor. Verifique se o servidor está rodando e tente novamente.');
    }
});

// Adiciona um evento de clique para um link/botão que leva para a tela de login
// Certifique-se de que seu cadastro.html tenha um elemento com o ID 'linkLogin'
const linkLogin = document.getElementById('linkLogin');
if (linkLogin) { // Verifica se o elemento existe antes de adicionar o event listener
    linkLogin.addEventListener('click', (event) => {
        event.preventDefault(); // Impede o link de navegar imediatamente se for um <a>
        window.location.href = '/html/login.html'; // Redireciona para a tela de login
    });
}