-- Criação do banco de dados.
CREATE DATABASE DetroitSQL;
USE DetroitSQL;

-- 1. Tabela de Usuários (Clientes e Administradores/Funcionários da Loja)
CREATE TABLE Usuarios (
    idUsuario INT PRIMARY KEY IDENTITY(1,1),
    nome NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    senha NVARCHAR(100) NOT NULL, 
    tipoUsuario VARCHAR(20) CHECK (tipoUsuario IN ('cliente', 'admin')) NOT NULL, -- cliente: para usuários comuns| admin para gestores da loja
    dataCadastro DATETIME DEFAULT GETDATE()
);

-- 2. Tabela de Produtos (Para a funcionalidade de Consulta)
CREATE TABLE Produtos (
    idProduto INT PRIMARY KEY IDENTITY(1,1),
    nomeProduto NVARCHAR(100) NOT NULL,
    descricao NVARCHAR(255),
    preco DECIMAL(10, 2) NOT NULL,
    categoria NVARCHAR(50) NULL
);

INSERT INTO Usuarios (nome, email, senha, tipoUsuario) VALUES
('Bruno Oliveira', 'bruno@email.com', '123456', 'cliente'),
('Admin Loja', 'admin@loja.com', 'admin123', 'admin');

-- Alguns produtos
INSERT INTO Produtos (nomeProduto, descricao, preco, categoria) VALUES
('Camiseta Essencial', 'Camiseta básica de algodão', 59.90, 'Camisetas'),
('Calça Jogger Conforto', 'Calça jogger de moletom, ideal para o dia a dia', 120.00, 'Calças'),
('Jaqueta Corta-Vento', 'Jaqueta leve e resistente à água', 180.00, 'Jaquetas');

GO 

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