document.addEventListener('DOMContentLoaded', async () => {
    const saudacaoAdmin = document.getElementById('saudacaoAdmin');
    const totalUsuariosAtivosSpan = document.getElementById('totalUsuariosAtivos');
    const toggleAddProductFormBtn = document.getElementById('toggleAddProductForm');
    const addProductFormSection = document.getElementById('addProductFormSection');
    const formAdicionarProduto = document.getElementById('formAdicionarProduto');
    const cancelAddProductBtn = document.getElementById('cancelAddProduct');

    // Boas-vindas ao administrador
    const nomeUsuario = sessionStorage.getItem('nomeUsuario');
    if (saudacaoAdmin && nomeUsuario) {
        saudacaoAdmin.textContent = `Olá, ${nomeUsuario}!`;
    }

    toggleAddProductFormBtn.addEventListener('click', () => {
        if (addProductFormSection.style.display === 'none') {
            addProductFormSection.style.display = 'block';
            toggleAddProductFormBtn.textContent = 'Ocultar Formulário';
        } else {
            addProductFormSection.style.display = 'none';
            toggleAddProductFormBtn.textContent = 'Adicionar Novo Produto';
            formAdicionarProduto.reset(); // Limpa o formulário ao ocultar
        }
    });

    cancelAddProductBtn.addEventListener('click', () => {
        addProductFormSection.style.display = 'none';
        toggleAddProductFormBtn.textContent = 'Adicionar Novo Produto';
        formAdicionarProduto.reset(); // Limpa o formulário ao cancelar
    });

});