console.log("Detalhes do pedido exibidos.");

const listaAvaliacoes = document.getElementById("lista-avaliacoes");

// Função para criar um item de avaliação na lista
function adicionarAvaliacaoNaLista(nome, comentario) {
  const li = document.createElement("li");
  li.textContent = `${nome} - "${comentario}"`;
  listaAvaliacoes.appendChild(li);
}

// Carrega avaliações salvas do localStorage
function carregarAvaliacoes() {
  const avaliacoesSalvas = localStorage.getItem("avaliacoes");
  if (avaliacoesSalvas) {
    const avaliacoes = JSON.parse(avaliacoesSalvas);
    avaliacoes.forEach(av => adicionarAvaliacaoNaLista(av.nome, av.comentario));
  }
}

// Salva uma nova avaliação no localStorage
function salvarAvaliacao(nome, comentario) {
  const avaliacoesSalvas = localStorage.getItem("avaliacoes");
  const avaliacoes = avaliacoesSalvas ? JSON.parse(avaliacoesSalvas) : [];
  avaliacoes.push({ nome, comentario });
  localStorage.setItem("avaliacoes", JSON.stringify(avaliacoes));
}

// Evento de envio do formulário
document.getElementById("form-avaliacao").addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome-usuario").value.trim();
  const comentario = document.getElementById("comentario").value.trim();

  if (nome && comentario) {
    adicionarAvaliacaoNaLista(nome, comentario);
    salvarAvaliacao(nome, comentario);

    // Limpar os campos
    document.getElementById("nome-usuario").value = "";
    document.getElementById("comentario").value = "";
  }
});

// Carregar avaliações ao abrir a página
carregarAvaliacoes();
