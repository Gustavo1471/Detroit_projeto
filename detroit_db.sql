-- Criação do banco de dados.
CREATE DATABASE DetroitSQL;
USE DetroitSQL;

-- 1. Tabela de Usuários (Clientes e Administradores/Funcionários da Loja)
CREATE TABLE Usuarios (
    idUsuario INT PRIMARY KEY IDENTITY(1,1),
    nome NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    senha NVARCHAR(100) NOT NULL,
    tipoUsuario VARCHAR(20) CHECK (tipoUsuario IN ('cliente', 'admin')) NOT NULL,
    dataCadastro DATETIME DEFAULT GETDATE()
);

-- 2. Tabela de Produtos
CREATE TABLE Produtos (
    idProduto INT PRIMARY KEY IDENTITY(1,1),
    nomeProduto NVARCHAR(100) NOT NULL,
    descricao NVARCHAR(255),
    preco DECIMAL(10, 2) NOT NULL,
    categoria NVARCHAR(50) NULL
);

-- 3. Tabela de Pedidos
CREATE TABLE Pedidos (
    idPedido INT PRIMARY KEY IDENTITY(1,1),
    idUsuarioCliente INT NOT NULL,
    dataPedido DATETIME DEFAULT GETDATE(),
    statusPedido VARCHAR(50) DEFAULT 'Concluido', -- Ex: 'Concluido', 'Pendente', 'Cancelado'
    valorTotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (idUsuarioCliente) REFERENCES Usuarios(idUsuario)
);

-- 4. Tabela de Itens do Pedido
CREATE TABLE ItensPedido (
    idItemPedido INT PRIMARY KEY IDENTITY(1,1),
    idPedido INT NOT NULL,
    idProduto INT NOT NULL,
    quantidade INT NOT NULL,
    precoUnitario DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (idPedido) REFERENCES Pedidos(idPedido),
    FOREIGN KEY (idProduto) REFERENCES Produtos(idProduto)
);

-- 5. Tabela de Avaliações
CREATE TABLE Avaliacoes (
    idAvaliacao INT PRIMARY KEY IDENTITY(1,1),
    idUsuarioCliente INT NOT NULL,
    idProduto INT NULL, -- Pode ser NULL se a avaliação for do atendimento geral da loja
    dataAvaliacao DATETIME DEFAULT GETDATE(),
    nota INT CHECK (nota >= 1 AND nota <= 5) NOT NULL, -- Avaliação de 1 a 5 estrelas
    comentario NVARCHAR(MAX) NULL,
    FOREIGN KEY (idUsuarioCliente) REFERENCES Usuarios(idUsuario),
    FOREIGN KEY (idProduto) REFERENCES Produtos(idProduto)
);

-- Inserções iniciais de exemplo
INSERT INTO Usuarios (nome, email, senha, tipoUsuario) VALUES
('Bruno Oliveira', 'bruno@email.com', '123456', 'cliente'),
('Admin Loja', 'admin@loja.com', 'admin123', 'admin');

INSERT INTO Produtos (nomeProduto, descricao, preco, categoria) VALUES
('Camiseta Essencial', 'Camiseta básica de algodão', 59.90, 'Camisetas'),
('Calça Jogger Conforto', 'Calça jogger de moletom, ideal para o dia a dia', 120.00, 'Calças'),
('Jaqueta Corta-Vento', 'Jaqueta leve e resistente à água', 180.00, 'Jaquetas');

-- Stored Procedure para login
CREATE PROCEDURE spLoginUsuario
    @email NVARCHAR(100),
    @senha NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT idUsuario, nome, tipoUsuario
    FROM Usuarios
    WHERE email = @email AND senha = @senha;
END;
GO