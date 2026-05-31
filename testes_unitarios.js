// teste_unitarios.js

// Replicando fielmente a regra de negócio isolada do app.js (Heurística de Recompensa)
function verificarPremiacao(totalAvaliacoes, totalCuponsGerados) {
    const proximaMetaAvaliacoes = (totalCuponsGerados + 1) * 3;
    return totalAvaliacoes >= proximaMetaAvaliacoes;
}

console.log("--- TESTES UNITÁRIOS: MÓDULO DE FIDELIZAÇÃO (UC08) ---");

// Cenário 1: Usuário novo com 3 avaliações e 0 cupons antigos (Deve ganhar)
const teste1 = verificarPremiacao(3, 0);
console.log(teste1 === true ? "✅ Passou Cenário 1: 3 avaliações geram o primeiro cupom." : "❌ Falhou Cenário 1.");

// Cenário 2: Usuário com apenas 2 avaliações e 0 cupons antigos (NÃO deve ganhar)
const teste2 = verificarPremiacao(2, 0);
console.log(teste2 === false ? "✅ Passou Cenário 2: 2 avaliações não atingem a meta." : "❌ Falhou Cenário 2.");

// Cenário 3: Usuário já tem 1 cupom e fez 4 avaliações no total (NÃO deve ganhar outro, pois a meta agora é 6)
const teste3 = verificarPremiacao(4, 1);
console.log(teste3 === false ? "✅ Passou Cenário 3: 4 avaliações com 1 cupom existente não geram re-premiação precoce." : "❌ Falhou Cenário 3.");

// Cenário 4: Usuário já tem 1 cupom e atingiu 6 avaliações no total (Deve ganhar o segundo cupom)
const teste4 = verificarPremiacao(6, 1);
console.log(teste4 === true ? "✅ Passou Cenário 4: Múltiplo alcançado! 6 avaliações geram o segundo cupom." : "❌ Falhou Cenário 4.");