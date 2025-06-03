document.addEventListener('DOMContentLoaded', async () => {
    // Pega o elemento HTML onde os produtos serão exibidos (deve ter id="produtosContainer" no seu loja.html)
    const produtosContainer = document.getElementById('produtosContainer');
    // Pega o elemento para exibir a saudação ao usuário (opcional, deve ter id="saudacaoUsuario" no seu loja.html)
    const saudacaoUsuario = document.getElementById('saudacaoUsuario');

    // Recupera o nome do usuário da sessionStorage (se ele fez login e o login.js salvou)
    const nomeUsuario = sessionStorage.getItem('nomeUsuario');
    if (saudacaoUsuario && nomeUsuario) {
        saudacaoUsuario.textContent = `Olá, ${nomeUsuario}! Bem-vindo(a) à nossa Loja!`;
    } else if (saudacaoUsuario) {
        saudacaoUsuario.textContent = `Olá! Bem-vindo(a) à nossa Loja!`; // Mensagem padrão se não houver nome logado
    }

    try {
        // Faz uma requisição GET para a rota /api/produtos no seu backend (definida no app.js)
        const response = await fetch('/api/produtos');
        const produtos = await response.json(); // Pega a lista de produtos como JSON da resposta

        if (response.ok && produtos.length > 0) {
            produtosContainer.innerHTML = ''; // Limpa o conteúdo "Carregando produtos..." ou qualquer conteúdo inicial

            // Itera sobre cada produto retornado pelo backend
            produtos.forEach(produto => {
                const produtoDiv = document.createElement('div'); // Cria uma nova div para cada produto
                produtoDiv.className = 'produto-item'; // Adicione essa classe ao seu CSS para estilizar cada item de produto

                // Formata o preço para o padrão brasileiro (R$ X,XX)
                const precoFormatado = produto.preco ? produto.preco.toFixed(2).replace('.', ',') : 'N/A';

                // Constrói o HTML interno para a div do produto usando Template Literals (crases ` ` e ${})
                // ESTA É A PARTE CRÍTICA, COPIE AS CRASES E TUDO DENTRO DELAS EXATAMENTE COMO ESTÁ
                produtoDiv.innerHTML = `
                    <h3>${produto.nomeProduto}</h3>
                    <p>${produto.descricao}</p>
                    <p><strong>R$ ${precoFormatado}</strong></p>
                    <p>Categoria: ${produto.categoria || 'N/A'}</p>
                `;
                produtosContainer.appendChild(produtoDiv); // Adiciona a div do produto ao container principal
            });
        } else {
            // Se a resposta for OK, mas não houver produtos (array vazio), ou se a resposta não for OK
            produtosContainer.innerHTML = '<p>Nenhum produto encontrado ou erro ao carregar.</p>';
        }
    } catch (error) {
        // Captura erros de rede ou outros erros que impedem a requisição de ser bem-sucedida
        console.error('Erro ao carregar produtos:', error);
        produtosContainer.innerHTML = '<p>Erro ao carregar produtos. Verifique se o servidor está rodando e tente novamente.</p>';
    }
});

// A função logout() está no HTML, mas aqui está um exemplo para referência se quiser movê-la
/*
function logout() {
    sessionStorage.clear(); // Limpa todas as informações da sessão
    window.location.href = '/html/login.html'; // Redireciona para a tela de login
}
*/
                    ``