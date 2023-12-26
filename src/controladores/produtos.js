const knex = require('../conexao');
const { uploadFile, excluirImagem } = require('../servicos/storage');

const cadastrarProduto = async (req, res) => {

  let { descricao, quantidade_estoque, valor, categoria_id } = req.body
  let originalname, mimetype, buffer
  if (req.file) {
    originalname = req.file.originalname
    mimetype = req.file.mimetype
    buffer = req.file.buffer
  }

  quantidade_estoque = Number(quantidade_estoque)
  valor = Number(valor)
  categoria_id = Number(categoria_id)

  if (!validaCampos(quantidade_estoque, valor, categoria_id)) {
    return res.status(400).json({
      mensagem: 'Os campos quantidade_estoque, valor e categoria_id devem ser um número inteiro.'
    });
  }

  try {
    const categoria = await knex('categorias').andWhere('id', '=', categoria_id).first();
    if (!categoria) {
      return res.status(404).json({ mensagem: 'Categoria não encontrada.' });
    }
    let produto = await knex('produtos').insert({
      descricao,
      quantidade_estoque,
      valor,
      categoria_id
    }).returning('*');

    if (!produto) {
      return res.status(400).json('O produto não foi cadastrado');
    }

    const produto_id = produto[0].id

    if (req.file) {
      originalname = `img_${produto_id}`
      const imagem = await uploadFile(`produtos/${produto_id}/${originalname}`, buffer, mimetype)

      produto = await knex('produtos').update({
        produto_imagem: imagem.path
      }).where({ id: produto_id }).returning('*')

      produto[0].urlImagem = imagem.url
    }
    return res.status(200).json({ ...produto[0], categoria_nome: categoria.descricao });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno no servidor' });
  }
}

const listarProdutos = async (req, res) => {
  const { categoria_id } = req.query;

  try {
    let query = knex('produtos')
      .select('produtos.*', 'categorias.descricao AS categoria_nome')
      .leftJoin('categorias', 'produtos.categoria_id', 'categorias.id')

    if (categoria_id) {
      const categorias = await knex('categorias').where({ id: categoria_id }).first();
      if (!categorias) {
        return res.status(404).json({ mensagem: 'Categoria não encontrada' });
      }
      query.where({ categoria_id });
    }

    const produtos = await query.orderBy('id');

    return res.status(200).json(produtos);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
}

const detalharProduto = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ mensagem: 'Necessário informar um id válido.' });
  }

  try {
    const produtoDetalhado = await knex('produtos')
      .select('produtos.*', 'categorias.descricao AS categoria_nome')
      .leftJoin('categorias', 'produtos.categoria_id', 'categorias.id')
      .where('produtos.id', id).first();

    if (!produtoDetalhado) {
      return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    return res.status(200).json(produtoDetalhado);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
}

const excluirProduto = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ mensagem: 'Necessário informar um id válido.' });
  }

  try {
    const produtoExiste = await knex('produtos').where({ id }).first();

    if (!produtoExiste) {
      return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }


    const produtoPedido = await knex('pedido_produtos').where('produto_id', Number(id)).first();

    if (produtoPedido) {
      return res.status(403).json({ mensagem: 'Produto não pode ser excluído, pois está vinculado a um pedido' });
    }
    const deletarProduto = await knex('produtos').del().where({ id });

    if (produtoExiste.produto_imagem) {
      await excluirImagem(produtoExiste.produto_imagem);
    }

    return res.status(200).json({ mensagem: 'Produto excluído com sucesso!' });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
}

const editarProduto = async (req, res) => {
  const { id } = req.params
  let { descricao, quantidade_estoque, valor, categoria_id } = req.body
  let originalname, mimetype, buffer
  if (req.file) {
    originalname = req.file.originalname
    mimetype = req.file.mimetype
    buffer = req.file.buffer
  }

  originalname = `img_${id}`
  quantidade_estoque = Number(quantidade_estoque)
  valor = Number(valor)
  categoria_id = Number(categoria_id)

  if (!validaCampos(quantidade_estoque, valor, categoria_id)) {
    return res.status(400).json({
      mensagem: 'Os campos quantidade_estoque, valor e categoria_id devem ser um número inteiro.'
    });
  }

  if (isNaN(id)) {
    return res.status(400).json({ mensagem: 'Necessário informar um id válido.' });
  }

  try {
    const produtoEncontrado = await knex('produtos').where({ id }).first();
    if (!produtoEncontrado) {
      return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }
    const categoriaEncontrada = await knex('categorias').where('id', Number(categoria_id)).first();
    if (!categoriaEncontrada) {
      return res.status(404).json({ mensagem: 'Categoria não encontrada' });
    }

    if (produtoEncontrado.produto_imagem) {
      await excluirImagem(produtoEncontrado.produto_imagem)
    }

    let upload = null, novaImagem = null, urlImagem = null

    if (req.file) {
      upload = await uploadFile(`produtos/${produtoEncontrado.id}/${originalname}`, buffer, mimetype)
      novaImagem = upload.path
      urlImagem = upload.url
    }

    let produto = await knex('produtos').update({
      descricao,
      quantidade_estoque,
      valor,
      categoria_id,
      produto_imagem: novaImagem,
    }).where(
      { id }
    ).returning('*');

    produto[0].urlImagem = urlImagem

    return res.status(200).json({ ...produto[0], categoria_nome: categoriaEncontrada.descricao });

  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
}

const validaCampos = (quantidade_estoque, valor, categoria_id) => {
  if (isNaN(quantidade_estoque) || quantidade_estoque < 0) { return false; }
  if (isNaN(valor) || valor < 0.1) { return false; }
  if (isNaN(categoria_id) || categoria_id <= 0) { return false; }
  return true;
}

module.exports = {
  listarProdutos,
  detalharProduto,
  cadastrarProduto,
  editarProduto,
  excluirProduto
}
