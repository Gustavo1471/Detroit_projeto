document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault(); // Impede o comportamento padrão de recarregar a página ao enviar o formulário

    // Pega os valores dos campos de e-mail e senha
    // Certifique-se de que seus campos no login.html tenham os IDs "email" e "senha"
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        // Faz uma requisição POST para a rota /api/login no seu backend
        const response = await fetch('/api/login', {
            method: 'POST', // Método HTTP POST
            headers: {
                'Content-Type': 'application/json' // Informa que o corpo da requisição é JSON
            },
            body: JSON.stringify({ email, senha }) // Converte os dados para JSON e envia no corpo
        });

        const data = await response.json(); // Pega a resposta do servidor (que será um JSON)

       if (response.ok) { // Se a resposta HTTP for de sucesso (status 200-299)
            alert('Login bem-sucedido! Bem-vindo(a), ' + data.nome);

            // Armazena informações do usuário na sessionStorage
            sessionStorage.setItem('idUsuario', data.idUsuario);
            sessionStorage.setItem('nomeUsuario', data.nome);
            sessionStorage.setItem('tipoUsuario', data.tipoUsuario);
            
            // Variável para a página de destino
            let paginaDestino;

            // Redireciona o usuário com base no tipo (cliente ou admin)
            if (data.tipoUsuario === 'cliente') {
                // Se for cliente, vai para a nova Home/Dashboard
                paginaDestino = '/html/loja.html'; 
            } else if (data.tipoUsuario === 'admin') {
                // Se for admin, vai para o novo Painel de Gestão
                paginaDestino = '/html/admin_dashboard.html'; 
            } else {
                // Caso o tipoUsuario não seja reconhecido, define um padrão seguro (opcional)
                paginaDestino = '/html/home.html'; 
            }
            
            window.location.href = paginaDestino; 
            
        } else {

            // Se a resposta não for sucesso (ex: 401 Unauthorized, 400 Bad Request)
            alert('Erro no login: ' + (data.message || 'Credenciais inválidas.'));
        }
    } catch (error) {
        console.error('Erro ao conectar ou processar login:', error);
        alert('Erro ao conectar ao servidor. Verifique se o servidor está rodando e tente novamente.');
    }
});

// Adiciona um evento de clique para um link/botão que leva para a tela de cadastro
// Certifique-se de que seu login.html tenha um elemento com o ID 'linkCadastro'
const linkCadastro = document.getElementById('linkCadastro');
if (linkCadastro) { // Verifica se o elemento existe antes de adicionar o event listener
    linkCadastro.addEventListener('click', (event) => {
        event.preventDefault(); // Impede o link de navegar imediatamente se for um <a>
        window.location.href = '/html/cadastro.html'; // Redireciona para a tela de cadastro
    });
}