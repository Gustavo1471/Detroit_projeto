function verificarPremiacao(quantidadeAvaliacoes) {
    return quantidadeAvaliacoes > 0 && quantidadeAvaliacoes % 3 === 0;
}

console.log("--- TESTES UNITÁRIOS: MÓDULO DE FIDELIZAÇÃO ---");

const teste1 = verificarPremiacao(3);
console.log(teste1 === true ? "✅ Passou: 3 avaliações gera cupom." : "❌ Falhou: 3 avaliações deveria gerar cupom.");


const teste2 = verificarPremiacao(2);
console.log(teste2 === false ? "✅ Passou: 2 avaliações NÃO gera cupom." : "❌ Falhou: Regra de múltiplo de 3 violada.");