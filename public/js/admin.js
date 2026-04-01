// Arquivo: public/js/admin.js

async function carregarPedidosAdmin() {
    const container = document.getElementById('tabelaPedidosAdminContainer');
    
    // O ideal seria verificar o tipoUsuario (Admin) antes de carregar, mas vamos simplificar.

    container.innerHTML = '<p>Buscando dados no servidor...</p>'; 

    try {
        // Chamada à rota do Back-end de Admin
        const response = await fetch('/api/pedidos/admin');
        const data = await response.json();

        if (response.status === 404) {
            container.innerHTML = '<p>Nenhum pedido encontrado no sistema.</p>';
            return;
        }

        if (!response.ok) {
             container.innerHTML = `<p class="erro">Erro ao carregar pedidos: ${data.message || 'Falha na comunicação com o servidor.'}</p>`;
             return;
        }

        // 1. Criar a Tabela
        let htmlTabela = `
            <table id="tabelaPedidos" class="tabela-admin">
                <thead>
                    <tr>
                        <th>ID Pedido</th>
                        <th>Data</th>
                        <th>Cliente</th>
                        <th>Email Cliente</th>
                        <th>Total</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // 2. Preencher as Linhas
        data.forEach(pedido => {
            const dataFormatada = new Date(pedido.dataPedido).toLocaleDateString('pt-BR');
            // Usa a classe para estilizar o status (você pode adicionar essas classes ao admin.css)
            const statusClass = `status-admin-${pedido.statusPedido.toLowerCase()}`; 

            htmlTabela += `
                <tr>
                    <td>#${pedido.idPedido}</td>
                    <td>${dataFormatada}</td>
                    <td>${pedido.nomeCliente}</td>
                    <td>${pedido.emailCliente}</td>
                    <td>R$ ${pedido.valorTotal.toFixed(2)}</td>
                    <td><span class="${statusClass}">${pedido.statusPedido}</span></td>
                </tr>
            `;
        });
        
        htmlTabela += `
                </tbody>
            </table>
        `;
        
        // 3. Inserir a Tabela no Container
        container.innerHTML = htmlTabela;

    } catch (error) {
        console.error('Falha ao buscar pedidos do Admin:', error);
        container.innerHTML = '<p class="erro">Não foi possível conectar ao servidor para buscar os pedidos.</p>';
    }
}