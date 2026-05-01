# 🚀 Projeto de Extensão (PIM) - Grupo Detroit

Este repositório contém o sistema desenvolvido para a disciplina de **Projeto de Extensão (PIM)** do curso de Análise e Desenvolvimento de Sistemas. O objetivo é aplicar conhecimentos técnicos para resolver problemas reais da comunidade externa, garantindo a qualidade e a maturidade dos processos de software.

## 🎯 Visão de Qualidade do Projeto
Conforme a auditoria de processos realizada, nossa percepção de qualidade está dividida entre os seguintes stakeholders:
* **Usuários (Comunidade Externa):** Interface simples, fácil usabilidade e tempo de resposta rápido para comerciantes e clientes.
* **Desenvolvedores (Grupo Detroit):** Código organizado, estruturado e com alta manutenibilidade para facilitar evoluções.
* **Gerentes/Orientadores:** Foco no cumprimento rigoroso do cronograma do PIM e baixo custo de desenvolvimento.

## 🛠 Tecnologias e Processos
* **Runtime:** Node.js
* **Banco de Dados:** SQL Server (DetroitSQL)
* **Versionamento:** Git/GitHub (Gerência de Configuração conforme ISO 12207).
* **Documentação Técnica:** Especificações, Protótipos de alta fidelidade, DER e Diagrama de Casos de Uso.

## 📊 Auditoria e Garantia de Qualidade
Realizamos uma autoauditoria baseada nas normas **ISO 12207** e **CMMI** para garantir a entrega deste projeto de extensão:

* **Gerência de Configuração:** Sim - Código versionado e organizado via GitHub.
* **Garantia de Qualidade:** Sim - Realizadas revisões internas e **Plano de Testes** automatizados.
* **Documentação:** Sim - Manuais, scripts de banco de dados e diagramas atualizados.

## 🧪 Plano de Testes (Garantia de Manutenibilidade)
Para assegurar a robustez do sistema, implementamos:

1. **Testes Unitários:** Validação isolada da lógica de fidelização (regras de cupons).
   - Execução: `node testes_unitarios.js`
2. **Testes de Integração:** Validação da comunicação entre o back-end e o banco de dados com sorteio dinâmico de registros.
   - Execução: `node teste_integracao.js`

## 🚀 Como Executar
Considerando que o ambiente **Node.js** já está configurado, siga os comandos abaixo:
```bash
# Instalação das dependências
npm install

# Execução dos Testes Unitários
node testes_unitarios.js

# Execução dos Testes de Integração
node teste_integracao.js

# Iniciar o servidor principal
node app.js