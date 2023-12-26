const knex = require("../conexao");
const send = require('../servicos/nodemailer')
const compiladorHtml = require('../utils/compilador_html')

const cadastrarPedido = async (req, res) => {
    const { cliente_id, pedido_produtos, observacao } = req.body;

  try {
    let idPedido = 0;
    const quantidadesPorId = {};
    let valorTotal = 0;
    let valorProduto = 0;
 
    const cliente = await knex('clientes').where({ id: cliente_id }).first();
    if (!cliente) {
        return res.status(404).json({ mensagem: 'Cliente não encontrado.' });
    }

    for (const pedido_produto of pedido_produtos) {
        const { produto_id, quantidade_produto } = pedido_produto;

        const produto = await knex('produtos').where({ id: produto_id }).first();

        if (!pedido_produtos || pedido_produtos.length === 0) {
          return res.status(400).json({ mensagem: 'O pedido deve conter pelo menos um produto vinculado.' });
        }

        if (!produto) {
            return res.status(400).json({ mensagem: `Produto com o ID ${produto_id} não foi encontrado` });
        }
        
        if (quantidadesPorId[produto_id]) {
          quantidadesPorId[produto_id] += quantidade_produto;
        } else {
          quantidadesPorId[produto_id] = quantidade_produto;
        }

        if (produto.quantidade_estoque < quantidadesPorId[produto_id]) {
            return res.status(400).json({
                mensagem: `Quantidade em estoque insuficiente para o produto com o ID ${produto_id}`
            });
        }

      valorProduto = produto.valor;
      valorTotal += valorProduto * quantidade_produto;    
    }
    
    const pedido = await knex('pedidos').insert({
      cliente_id,
      observacao,
      valor_total:valorTotal,
    }).returning('id');

  for (const produto_id in quantidadesPorId){
    const quantidade_produto = quantidadesPorId[produto_id];

     idPedido = pedido[0].id;

     const produtoInfo = await knex('produtos').select('valor','quantidade_estoque').where({ id: produto_id }).first();
     valorProduto = produtoInfo.valor;
     quantidadeAtualizada = produtoInfo.quantidade_estoque - quantidade_produto

    const completarCadastro = await knex('pedido_produtos').insert({
      pedido_id:idPedido,
      produto_id,
      quantidade_produto,
      valor_produto:valorProduto
    })

    const atualizarQuantidade = await knex('produtos').where({id: produto_id}).update({
      quantidade_estoque:quantidadeAtualizada
    })  
}

  const pedidoMaisRecente = await knex('pedidos').where({ id: idPedido }).first(); 

  const pedidoCompleto = await knex('pedido_produtos').where({pedido_id:idPedido})

  const clienteEmail= await knex('clientes').select('email','nome').where({ id: cliente_id }).first();

  if (clienteEmail) {
      const emailSubject = 'Confirmação de Pedido';
      const templateContext = {
          usuario: clienteEmail.nome,
          texto: 'Seu pedido foi cadastrado com sucesso! Obrigado por escolher nossos serviços.'
      };

      const htmlBody = await compiladorHtml('./src/templates/confirmacao_pedido.html', templateContext);

      send(clienteEmail.email, emailSubject, htmlBody);
      
  }else{
    return res.status(404).json({ mensagem: 'E-mail do cliente não encontrado.' });
  }

    return res.status(201).json({
      pedido: {
          id: pedidoMaisRecente.id,
          valor_total: pedidoMaisRecente.valor_total,
          observacao: pedidoMaisRecente.observacao,
          cliente_id: pedidoMaisRecente.cliente_id
      },
      pedido_produtos: pedidoCompleto
  });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno no servidor' });
  }
};

const listarPedidos = async (req, res) => {
  const { cliente_id } = req.query;

  try {
      let pedidosQuery = knex('pedidos')
          .select('id as pedido_id', 'valor_total', 'observacao', 'cliente_id');

      if (cliente_id) {
          if (isNaN(cliente_id)) {
              return res.status(400).json({ mensagem: 'Necessário informar um id válido.' });
          }
          const clienteExiste = await knex('clientes').where({ id: cliente_id }).first();
          if (!clienteExiste) {
              return res.status(404).json({ mensagem: 'Cliente não encontrado' });
          }
          pedidosQuery = pedidosQuery.where('cliente_id', cliente_id);
      }

      const pedidos = await pedidosQuery;
      if (pedidos.length < 1) {
            return res.status(200).json({ mensagem: 'Nenhum pedido encontrado' });
          }

      const resultado = await Promise.all(pedidos.map(async pedido => {
          const produtosDoPedido = await knex('pedido_produtos')
              .select('id', 'quantidade_produto', 'valor_produto', 'pedido_id', 'produto_id')
              .where('pedido_id', pedido.pedido_id);

          return {
              pedido: pedido,
              pedido_produtos: produtosDoPedido
          };
      }));

      return res.status(200).json(resultado);

  } catch (error) {
      return res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
};

module.exports = {cadastrarPedido, listarPedidos}
