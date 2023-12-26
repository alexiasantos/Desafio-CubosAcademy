const express = require('express');
const multer = require('./intermediarios/multer');

const login = require('./controladores/login');
const verificarUsuarioLogado = require('./intermediarios/autenticacao');
const validarRequisicao = require('./intermediarios/validar_requisicao');

const loginSchema = require('./validacoes/login');
const usuarioSchema = require('./validacoes/usuarios');
const produtoSchema = require('./validacoes/produtos');
const clienteSchema = require('./validacoes/clientes');
const pedidoSchema = require('./validacoes/pedidos');

const { cadastrarUsuario, detalharPerfil, editarPerfil } = require('./controladores/usuarios');
const listarCategorias = require('./controladores/categorias');

const { listarProdutos, detalharProduto, cadastrarProduto, editarProduto, excluirProduto } = require('./controladores/produtos');
const { listarClientes, detalharCliente, editarCliente, cadastrarCliente } = require('./controladores/clientes');
const { listarPedidos, cadastrarPedido } = require('./controladores/pedidos');

const rotas = express();

rotas.get('/categoria', listarCategorias);
rotas.post('/usuario', validarRequisicao(usuarioSchema), cadastrarUsuario);
rotas.post('/login', validarRequisicao(loginSchema), login);

rotas.use(verificarUsuarioLogado);

rotas.get('/usuario', detalharPerfil);
rotas.put('/usuario', validarRequisicao(usuarioSchema), editarPerfil);

rotas.get('/cliente', listarClientes);
rotas.get('/cliente/:id', detalharCliente);
rotas.post('/cliente', validarRequisicao(clienteSchema), cadastrarCliente);
rotas.put('/cliente/:id', validarRequisicao(clienteSchema), editarCliente);

rotas.get('/produto', listarProdutos);
rotas.get('/produto/:id', detalharProduto);
rotas.post('/produto', multer.single('produto_imagem'), validarRequisicao(produtoSchema), cadastrarProduto);
rotas.put('/produto/:id', multer.single('produto_imagem'), validarRequisicao(produtoSchema), editarProduto);
rotas.delete('/produto/:id', excluirProduto);

rotas.get('/pedido', listarPedidos);
rotas.post('/pedido',validarRequisicao(pedidoSchema),cadastrarPedido);

module.exports = rotas;
